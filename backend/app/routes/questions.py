from flask import Blueprint, request, jsonify, current_app
from app.models.question import Question
from app.models.category import Category
from app.services.quiz_service import get_questions, evaluate_quiz
from app.utils.jwt_utils import jwt
import random

questions_bp = Blueprint('questions', __name__, url_prefix='/api/questions')

def get_authenticated_user():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            return payload['sub']
        except:
            pass
    return None

@questions_bp.route('', methods=['GET'])
def get_quiz_questions():
    topic = request.args.get('topic')
    module_id = request.args.get('moduleId', type=int)
    category_id = request.args.get('categoryId', type=int)

    questions = get_questions(topic, module_id, category_id)
    return jsonify(questions or []), 200

@questions_bp.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    try:
        data = request.get_json()
        if not data or 'answers' not in data:
            return jsonify({'error': 'No answers provided'}), 400
        
        user_id = get_authenticated_user()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        answers = data['answers']
        module_id = data.get('moduleId')
        category_id = data.get('categoryId')
        
        # Converte para int se existir
        if module_id is not None:
            module_id = int(module_id)
        if category_id is not None:
            category_id = int(category_id)
        
        result = evaluate_quiz(answers, user_id, module_id, category_id)
        return jsonify(result)
    except Exception as e:
        print(f"Erro ao processar quiz: {e}")
        return jsonify({'error': str(e)}), 500

@questions_bp.route('/category/<int:category_id>', methods=['GET'])
def get_questions_by_category(category_id):
    questions = Question.query.filter_by(category_id=category_id).all()

    if not questions:
        return jsonify({"error": "Nenhuma questão encontrada para esta categoria"}), 404

    # Garante que o campo 'correct' está presente nas opções
    return jsonify([q.to_dict(True) for q in questions]), 200

@questions_bp.route('/by-level', methods=['POST'])
def get_questions_by_level():
    data = request.get_json()

    user_id = data.get('user_id')
    module_id = data.get('module_id')
    quantity = data.get('quantity')

    # Verificações básicas
    if not all([user_id, module_id, quantity]):
        return jsonify({'error': 'Parâmetros ausentes'}), 400

    # Buscar o usuário e seu nível
    from app.models import User
    user = User.query.get(user_id)

    if not user or not user.placement_level:
        return jsonify({'error': 'Usuário não encontrado ou sem nível definido'}), 404

    level = int(user.placement_level)

    # Buscar categorias do módulo
    categories = Category.query.filter_by(module_id=module_id).all()
    category_ids = [cat.id for cat in categories]

    # Buscar perguntas daquele nível
    questions_query = Question.query.filter(
        Question.category_id.in_(category_ids),
        Question.level == level
    ).all()

    if not questions_query:
        return jsonify([]), 200

    selected_questions = random.sample(questions_query, min(quantity, len(questions_query)))

    # Garante que o campo 'correct' está presente nas opções
    return jsonify([q.to_dict(True) for q in selected_questions]), 200