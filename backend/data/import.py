import sys
import json
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app import create_app, db
from app.models.module import Module
from app.models.question import Question, Option

app = create_app()

def importar_perguntas_sem_categoria():
    data_path = Path(__file__).parent / "boasvindas.json"

    with app.app_context():
        print("📥 Importando perguntas sem categoria...")

        # Modifique este título se quiser associar a outro módulo existente
        modulo = Module.query.filter_by(title="Infraestrutura e Redes").first()
        if not modulo:
            print("❌ Módulo não encontrado!")
            return

        with open(data_path, encoding="utf-8") as f:
            perguntas = json.load(f)

        for q in perguntas:
            nova_pergunta = Question(
                question=q["question"],
                level=q["level"],
                explanation=q.get("explanation", ""),
                module_id=modulo.id,
                category_id=None  # deixa sem categoria
            )
            db.session.add(nova_pergunta)
            db.session.flush()  # para gerar ID da pergunta

            for opt in q["options"]:
                nova_opcao = Option(
                    question_id=nova_pergunta.id,
                    option_id=opt["option_id"],
                    text=opt["text"],
                    is_correct=opt["is_correct"]
                )
                db.session.add(nova_opcao)

        db.session.commit()
        print("✅ Perguntas importadas com sucesso!")

if __name__ == "__main__":
    importar_perguntas_sem_categoria()
