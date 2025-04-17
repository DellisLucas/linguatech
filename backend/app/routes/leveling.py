from flask import Blueprint, jsonify, request
from app.models.question import Question
from app.models import db, User
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


placement_bp = Blueprint("nivelamento", __name__, url_prefix="/api/nivelamento")

@placement_bp.route("/", methods=["GET"])
def get_placement_questions():
    questions = Question.query.filter(
        Question.module_id.is_(None),
        Question.category_id.is_(None)
    ).all()

    return jsonify([q.to_dict(include_correct=True) for q in questions])



nivel_map = {
    "iniciante": 1,
    "básico": 2,
    "intermediário": 3,
    "avançado": 4,
    "especialista": 5
}

def nivel_para_texto(nivel: int) -> str:
    return {
        1: "muito fácil",
        2: "fácil",
        3: "médio",
        4: "difícil",
        5: "muito difícil"
    }.get(nivel, "desconhecido")

def gerar_prompt(respostas):
    texto = "Essas foram as questões que o usuário acertou:\n\n"
    for r in respostas:
        texto += f"- Pergunta {r['question_id']}: nível {r['level']} ({nivel_para_texto(r['level'])})\n"

    texto += """
Com base nessas informações, classifique o usuário como um dos seguintes níveis:
- Iniciante
- Básico
- Intermediário
- Avançado
- Especialista

Retorne apenas o nome do nível mais adequado, em letras minúsculas.
"""
    return texto.strip()


# POST: Resultado final e gravação do placement_level
@placement_bp.route("/resultado", methods=["POST"])
def definir_placement_level():
    data = request.get_json()
    user_id = data.get("user_id")
    respostas = data.get("respostas")  # Lista de dicts: {question_id, level}

    if not user_id or not respostas:
        return jsonify({"error": "Parâmetros obrigatórios ausentes."}), 400
    data = request.get_json()
    print("📥 Dados recebidos no backend:", data)
    try:
        prompt = gerar_prompt(respostas)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        nivel_texto = response.text.strip().lower()

        print("🔍 Classificação IA:", nivel_texto)

        placement_level = nivel_map.get(nivel_texto)
        if placement_level is None:
            return jsonify({"error": f"Nível '{nivel_texto}' não reconhecido pela IA."}), 500

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuário não encontrado."}), 404

        user.placement_level = str(placement_level)  # ou int, dependendo da modelagem
        db.session.commit()

        return jsonify({
            "placement_level": placement_level,
            "nivel_texto": nivel_texto.capitalize()
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500