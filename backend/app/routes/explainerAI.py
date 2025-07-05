from flask import Blueprint, request, jsonify
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


explainer_bp = Blueprint("explainer", __name__, url_prefix='/api')

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
6. Lembre-se, você deve explicar a parte técnica, mas não se esqueça do inglês também.
""".strip()

EXPLANATION_PROMPT = """
Você é um professor de inglês. Explique o erro do aluno de forma didática, focando na diferença entre a resposta errada e a correta.

Formato:
You answered "[resposta errada]," which is a device that sends and receives data over a network. However, the question asked for the name of the *wireless network itself*, not the device that enables it. [resposta correta] is the name of the technology and the network it creates. A [resposta errada] is a component *of* a [resposta correta] network, but it isn't the name of the network itself.

Diretrizes:
- Use a estrutura exata do formato acima
- Mantenha os asteriscos para ênfase (*palavra*)
- Seja didático e claro
- Foque apenas na diferença entre a resposta errada e a correta
- Use o contexto específico da questão
""".strip()

VOCABULARY_PROMPT = """
Você é um professor de inglês. Forneça o vocabulário específico para o termo correto no contexto da questão.

Formato:
[termo] - [tradução]

Example: I connected to the free [termo] at the cafe.

Tradução: Eu me conectei ao [termo] gratuito na cafeteria.

Diretrizes:
- Use exatamente este formato
- Dê apenas um exemplo relacionado ao termo ou conceito de acordo com o contexto da questão
- Mantenha o exemplo relevante para o uso real do termo
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

@explainer_bp.route("/review", methods=["POST"])
def generate_review():
    data = request.get_json()
    questions = data.get("questions", [])

    if not questions:
        return jsonify({"error": "Nenhuma questão fornecida para revisão."}), 400

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        reviews = []

        for question in questions:
            try:
                # Inclui o contexto da questão em cada prompt
                context = f"""
Contexto da questão:
Pergunta: {question.get('question')}
Resposta correta: {question.get('correctAnswer')}
Resposta do usuário: {question.get('userAnswer')}
"""
                
                # Substitui os placeholders e adiciona contexto
                explanation_prompt = context + EXPLANATION_PROMPT.replace("[resposta errada]", question.get('userAnswer')).replace("[resposta correta]", question.get('correctAnswer'))
                vocabulary_prompt = context + VOCABULARY_PROMPT.replace("[termo]", question.get('correctAnswer'))

                # Gera explicação
                explanation = model.generate_content(explanation_prompt)
                print(f"Explicação gerada: {explanation.text}")

                # Gera vocabulário
                vocabulary = model.generate_content(vocabulary_prompt)
                print(f"Vocabulário gerado: {vocabulary.text}")


                # Monta a resposta
                review = {
                    "question": question.get('question'),
                    "correctAnswer": question.get('correctAnswer'),
                    "userAnswer": question.get('userAnswer'),
                    "aiExplanation": f"""Explicação

{explanation.text}

Vocabulário

{vocabulary.text}
"""
                }
                print(f"Review montada: {review}")
                reviews.append(review)

            except Exception as e:
                print(f"Erro ao processar questão: {str(e)}")
                import traceback
                traceback.print_exc()
                reviews.append({
                    "question": question.get('question'),
                    "correctAnswer": question.get('correctAnswer'),
                    "userAnswer": question.get('userAnswer'),
                    "aiExplanation": "Desculpe, houve um erro ao gerar a explicação. Por favor, tente novamente."
                })

        print(f"Total de reviews geradas: {len(reviews)}")
        return jsonify({"reviews": reviews})

    except Exception as e:
        print(f"Erro geral: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500
