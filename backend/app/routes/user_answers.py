from flask import Blueprint, request, jsonify
from app.models import UserAnswer, Question
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint('user_answers', __name__)

@bp.route('/user-answers', methods=['POST'])
@jwt_required()
def create_user_answer():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        question_id = data.get('question_id')
        answer = data.get('answer')
        is_correct = data.get('is_correct')
        
        if not all([question_id, answer, is_correct is not None]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Verificar se a questão existe
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
            
        # Criar nova resposta
        user_answer = UserAnswer(
            user_id=user_id,
            question_id=question_id,
            answer=answer,
            is_correct=is_correct
        )
        
        db.session.add(user_answer)
        db.session.commit()
        
        return jsonify(user_answer.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/user-answers', methods=['GET'])
@jwt_required()
def get_user_answers():
    try:
        user_id = get_jwt_identity()
        user_answers = UserAnswer.query.filter_by(user_id=user_id).all()
        
        return jsonify([answer.to_dict() for answer in user_answers]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/user-answers/<int:answer_id>', methods=['GET'])
@jwt_required()
def get_user_answer(answer_id):
    try:
        user_id = get_jwt_identity()
        user_answer = UserAnswer.query.filter_by(id=answer_id, user_id=user_id).first()
        
        if not user_answer:
            return jsonify({'error': 'Answer not found'}), 404
            
        return jsonify(user_answer.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/user-answers/stats/<int:user_id>', methods=['GET'])
def get_user_answers_stats(user_id):
    try:
        print('user_id:', user_id)
        total_questions = Question.query.count()
        correct = UserAnswer.query.filter_by(user_id=user_id, is_correct=True).count()
        return jsonify({"total": total_questions, "correct": correct}), 200
    except Exception as e:
        print('Erro:', e)
        return jsonify({'error': str(e)}), 500