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
        for q in questions_data:
            question = Question(
                question=q["question"],
                level=q["level"],
                explanation=q.get("explanation", ""),
                module_id=module_objs[q["module_title"]].id,
                category_id=category_objs[q["category_name"]].id
            )
            db.session.add(question)
            db.session.flush()
            for opt in q["options"]:
                db.session.add(Option(
                    question_id=question.id,
                    option_id=opt["option_id"],
                    text=opt["text"],
                    is_correct=opt["is_correct"]
                ))
        db.session.commit()

        print("🧪 Importando perguntas de nivelamento...")
        with open(data_dir / "questions_placement.json", encoding="utf-8") as f:
            placement_questions = json.load(f)
        for p in placement_questions:
            question = Question(
                question=p["question"],
                level=p["level"]
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
        db.session.commit()

        print("🎉 Banco de dados populado com sucesso!")

if __name__ == "__main__":
    seed_from_json()
