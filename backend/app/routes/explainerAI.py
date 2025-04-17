from flask import Blueprint, request, jsonify
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


explainer_bp = Blueprint("explainer", __name__, url_prefix="/api")

INSTRUCTION_PROMPT = """
Você é uma inteligência artificial treinada para explicar conceitos técnicos de forma clara e didática. 
Seu objetivo é analisar uma pergunta de múltipla escolha e explicar por que uma determinada alternativa é a correta, 
considerando o contexto da tecnologia da informação (TI), como inglês técnico, programação, redes e segurança da informação.

Formato da resposta:
1. Apresente uma explicação breve e direta sobre o porquê da alternativa correta.
2. Se possível, exemplifique com uma situação prática ou um trecho de código/comando real.
3. Mantenha a explicação com linguagem acessível, mas sem perder a precisão técnica.
4. Seja imparcial: não mencione as demais alternativas, apenas foque na correta.
5. Seja BREVE, repostas mais curtas e em português.
""".strip()

@explainer_bp.route("/explainer", methods=["POST"])
def generate_explanation():
    data = request.get_json()
    question = data.get("question")
    correct_answer = data.get("correct_answer")

    if not question or not correct_answer:
        return jsonify({"error": "Parâmetros ausentes."}), 400

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"{INSTRUCTION_PROMPT}\n\nPergunta: {question}\nResposta correta: {correct_answer}\n\nExplique:"

        response = model.generate_content(prompt)

        return jsonify({"explanation": response.text})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500
