from flask import Blueprint, jsonify, request
from app.services.module_service import get_all_modules, get_module_by_id
from app.utils.jwt_utils import token_required
from app.models.question import Question
from app.models.user_answer import UserAnswer
from app import db

modules_bp = Blueprint('modules', __name__)

@modules_bp.route('/modules', methods=['GET'])
@token_required
def get_modules(current_user):
    user_id = current_user.id
    modules = get_all_modules(user_id)
    return jsonify(modules), 200

@modules_bp.route('/modules/<int:module_id>', methods=['GET'])
@token_required
def get_module(current_user, module_id):
    user_id = current_user.id
    module = get_module_by_id(module_id, user_id)
    
    if not module:
        return jsonify({'error': 'Módulo não encontrado'}), 404
    
    return jsonify(module), 200

@modules_bp.route('/modules/<int:module_id>/categories/<int:category_id>/progress', methods=['GET'])
@token_required
def get_category_progress(current_user, module_id, category_id):
    user_id = current_user.id
    
    # Busca todas as questões da categoria
    questions = Question.query.filter_by(category_id=category_id).all()
    total_questions = len(questions)
    
    if total_questions == 0:
        return jsonify({'progress': 0}), 200
    
    # Busca as questões que o usuário respondeu corretamente
    user_answers = UserAnswer.query.filter(
        UserAnswer.user_id == user_id,
        UserAnswer.is_correct == True,
        UserAnswer.question_id.in_([q.id for q in questions])
    ).all()
    
    correct_answers = len(user_answers)
    
    # Calcula o progresso como porcentagem
    progress = round((correct_answers / total_questions) * 100)
    
    return jsonify({'progress': progress}), 200

@modules_bp.route('/debug/user-answers/<int:user_id>/<int:category_id>', methods=['GET'])
def debug_user_answers(user_id, category_id):
    # Busca todas as questões da categoria
    questions = Question.query.filter_by(category_id=category_id).all()
    question_ids = [q.id for q in questions]
    
    # Busca todas as respostas do usuário para as questões da categoria
    user_answers = UserAnswer.query.filter(
        UserAnswer.user_id == user_id,
        UserAnswer.question_id.in_(question_ids)
    ).all()
    
    return jsonify({
        'total_questions': len(questions),
        'user_answers': [{
            'question_id': answer.question_id,
            'answer': answer.answer,
            'is_correct': answer.is_correct
        } for answer in user_answers]
    }), 200

@modules_bp.route('/debug/check-tables/<int:user_id>/<int:category_id>', methods=['GET'])
def debug_check_tables(user_id, category_id):
    # Busca todas as questões da categoria
    questions = Question.query.filter_by(category_id=category_id).all()
    
    # Busca todas as respostas do usuário
    user_answers = UserAnswer.query.filter(
        UserAnswer.user_id == user_id,
        UserAnswer.question_id.in_([q.id for q in questions])
    ).all()
    
    # Busca registros na tabela user_progress
    from app.models.user_progress import UserProgress
    progress_records = UserProgress.query.filter_by(
        user_id=user_id,
        category_id=category_id
    ).all()
    
    return jsonify({
        'questions': [{
            'id': q.id,
            'category_id': q.category_id
        } for q in questions],
        'user_answers': [{
            'id': a.id,
            'question_id': a.question_id,
            'is_correct': a.is_correct,
            'answer': a.answer
        } for a in user_answers],
        'progress_records': [{
            'id': p.id,
            'user_id': p.user_id,
            'module_id': p.module_id,
            'category_id': p.category_id,
            'progress': p.progress
        } for p in progress_records]
    }), 200
