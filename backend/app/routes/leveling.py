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
        Question.explanation == "BV",
        Question.category_id.is_(None)
    ).order_by(db.func.random()).limit(15).all()

    return jsonify([q.to_dict(include_correct=True) for q in questions])

# POST: Resultado final e gravação do placement_level
@placement_bp.route("/resultado", methods=["POST"])
def definir_placement_level():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "Parâmetro 'user_id' é obrigatório."}), 400

    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuário não encontrado."}), 404

        user.placement_level = "10"  # ou int(10) se o campo for inteiro
        db.session.commit()

        return jsonify({
            "placement_level": "10",
            "mensagem": "Nível atualizado com sucesso."
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
