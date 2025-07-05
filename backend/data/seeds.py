import sys
import json
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app import create_app, db
from app.models.module import Module
from app.models.category import Category
from app.models.question import Question, Option
from app.models.user_placement_answer import UserPlacementAnswer

app = create_app()

def is_duplicate_question(question_text, options, is_placement=False):
    """
    Verifica se uma questão já existe no banco com o mesmo texto e opções.
    Se is_placement for True, verifica apenas questões sem categoria.
    """
    query = Question.query.filter_by(question=question_text)
    
    if is_placement:
        # Para questões de nivelamento, verifica apenas questões sem categoria
        query = query.filter_by(category_id=None)
    else:
        # Para questões normais, verifica apenas questões com categoria
        query = query.filter(Question.category_id.isnot(None))
    
    existing = query.first()
    if not existing:
        return False
    
    # Verifica se as opções são as mesmas
    existing_options = {opt.text: opt.is_correct for opt in existing.options}
    new_options = {opt["text"]: opt["is_correct"] if "is_correct" in opt else opt["correct"] for opt in options}
    
    return existing_options == new_options

def get_or_create_category(name, module_title, module_objs, category_objs):
    """Obtém uma categoria existente ou cria uma nova se não existir"""
    if name in category_objs:
        return category_objs[name]
    
    # Cria uma nova categoria
    module = module_objs.get(module_title)
    if not module:
        print(f"⚠️ Módulo '{module_title}' não encontrado para a categoria '{name}'")
        return None
    
    category = Category(name=name, module_id=module.id)
    db.session.add(category)
    db.session.flush()
    category_objs[name] = category
    print(f"✅ Nova categoria criada: {name}")
    return category

def seed_from_json():
    with app.app_context():
        print("🧹 Limpando banco de dados...")
        UserPlacementAnswer.query.delete()
        Option.query.delete()
        Question.query.delete()
        Category.query.delete()
        Module.query.delete()
        db.session.commit()

        data_dir = Path(__file__).parent.parent / "data"

        print("📦 Importando módulos...")
        with open(data_dir / "modules.json", encoding="utf-8") as f:
            modules_data = json.load(f)
        module_objs = {}
        for m in modules_data:
            mod = Module(title=m["title"], description=m["description"])
            db.session.add(mod)
            module_objs[m["title"]] = mod
        db.session.commit()

        print("📂 Importando categorias...")
        with open(data_dir / "categories.json", encoding="utf-8") as f:
            categories_data = json.load(f)
        category_objs = {}
        for c in categories_data:
            cat = Category(name=c["name"], module_id=module_objs[c["module_title"]].id)
            db.session.add(cat)
            category_objs[c["name"]] = cat
        db.session.commit()

        print("❓ Importando perguntas normais com opções...")
        with open(data_dir / "questions.json", encoding="utf-8") as f:
            questions_data = json.load(f)
        
        imported_count = 0
        skipped_count = 0
        error_count = 0
        
        # Contadores específicos para o módulo Desenvolvedores e banco de dados
        dev_db_imported = 0
        dev_db_skipped = 0
        dev_db_errors = 0
        
        for q in questions_data:
            try:
                # Verifica se a questão é uma lista e pega o primeiro elemento se for
                if isinstance(q, list):
                    q = q[0]
                
                # Verifica se o módulo existe
                if q["module_title"] not in module_objs:
                    print(f"⚠️ Módulo não encontrado para a questão: {q['question']}")
                    skipped_count += 1
                    if q["module_title"] == "Desenvolvedores e banco de dados":
                        dev_db_skipped += 1
                    continue
                    
                # Verifica se a questão já existe
                if is_duplicate_question(q["question"], q["options"]):
                    print(f"⚠️ Questão normal duplicada encontrada: {q['question']}")
                    skipped_count += 1
                    if q["module_title"] == "Desenvolvedores e banco de dados":
                        dev_db_skipped += 1
                    continue
                    
                # Obtém ou cria a categoria
                category = get_or_create_category(
                    q["category_name"],
                    q["module_title"],
                    module_objs,
                    category_objs
                )
                
                if not category:
                    print(f"⚠️ Questão ignorada devido a categoria inválida: {q['question']}")
                    skipped_count += 1
                    if q["module_title"] == "Desenvolvedores e banco de dados":
                        dev_db_skipped += 1
                    continue
                    
                # Verifica se todas as opções necessárias estão presentes
                if not all(key in q for key in ["question", "level", "options"]):
                    print(f"⚠️ Questão com campos faltando: {q.get('question', 'Questão sem texto')}")
                    error_count += 1
                    if q["module_title"] == "Desenvolvedores e banco de dados":
                        dev_db_errors += 1
                    continue
                    
                question = Question(
                    question=q["question"],
                    level=q["level"],
                    explanation=q.get("explanation", ""),
                    module_id=module_objs[q["module_title"]].id,
                    category_id=category.id
                )
                db.session.add(question)
                db.session.flush()
                
                # Verifica se todas as opções têm os campos necessários
                for opt in q["options"]:
                    if not all(key in opt for key in ["option_id", "text", "is_correct"]):
                        print(f"⚠️ Opção com campos faltando na questão: {q['question']}")
                        error_count += 1
                        if q["module_title"] == "Desenvolvedores e banco de dados":
                            dev_db_errors += 1
                        continue
                        
                    db.session.add(Option(
                        question_id=question.id,
                        option_id=opt["option_id"],
                        text=opt["text"],
                        is_correct=opt["is_correct"]
                    ))
                imported_count += 1
                if q["module_title"] == "Desenvolvedores e banco de dados":
                    dev_db_imported += 1
            except Exception as e:
                print(f"⚠️ Erro ao importar questão: {str(e)}")
                print(f"Questão: {q}")
                error_count += 1
                if q["module_title"] == "Desenvolvedores e banco de dados":
                    dev_db_errors += 1
                continue
                
        db.session.commit()
        print(f"✅ {imported_count} questões normais importadas, {skipped_count} ignoradas, {error_count} com erro")
        print(f"📊 Estatísticas do módulo 'Desenvolvedores e banco de dados':")
        print(f"   - Importadas: {dev_db_imported}")
        print(f"   - Ignoradas: {dev_db_skipped}")
        print(f"   - Com erro: {dev_db_errors}")

        print("🧪 Importando perguntas de nivelamento...")
        with open(data_dir / "questions_placement.json", encoding="utf-8") as f:
            placement_questions = json.load(f)
        
        imported_count = 0
        skipped_count = 0
        
        for p in placement_questions:
            try:
                # Verifica se a questão já existe
                if is_duplicate_question(p["question"], p["options"], is_placement=True):
                    print(f"⚠️ Questão de nivelamento duplicada encontrada: {p['question']}")
                    skipped_count += 1
                    continue
                    
                question = Question(
                    question=p["question"],
                    level=p["level"],
                    explanation=p.get("explanation", "")
                )
                db.session.add(question)
                db.session.flush()
                
                for opt in p["options"]:
                    db.session.add(Option(
                        question_id=question.id,
                        option_id=opt["option_id"],
                        text=opt["text"],
                        is_correct=opt["is_correct"]
                    ))
                imported_count += 1
            except Exception as e:
                print(f"⚠️ Erro ao importar questão de nivelamento: {str(e)}")
                print(f"Questão: {p}")
                skipped_count += 1
                continue
                
        db.session.commit()
        
        print(f"✅ Importação concluída! {imported_count} questões de nivelamento importadas, {skipped_count} questões duplicadas ignoradas.")

if __name__ == "__main__":
    seed_from_json()
