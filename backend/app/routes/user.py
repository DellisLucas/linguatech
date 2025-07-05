from flask import Blueprint, jsonify, request
from app.models.user import User
from app.models.user_progress import UserProgress
from app import db
from app.utils.jwt_utils import token_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    # Calcula completedModules e completedLessons
    completed_modules = UserProgress.query.filter_by(user_id=current_user.id).filter(UserProgress.progress >= 100).count()
    completed_lessons = UserProgress.query.filter_by(user_id=current_user.id).count()
    # Exemplo de level e points (ajuste conforme sua lógica)
    level = current_user.placement_level or 1
    points = 0  # Implemente sua lógica de pontos se desejar

    return jsonify({
        "id": current_user.id,
        "name": current_user.username,
        "email": current_user.email,
        "avatarUrl": None,
        "level": level,
        "points": points,
        "createdAt": current_user.created_at.isoformat(),
        "completedModules": completed_modules,
        "completedLessons": completed_lessons
    })

@user_bp.route('/user/profile', methods=['PATCH'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    if "name" in data:
        current_user.username = data["name"]
    db.session.commit()
    # Retorne o perfil atualizado no mesmo formato do GET
    completed_modules = UserProgress.query.filter_by(user_id=current_user.id).filter(UserProgress.progress >= 100).count()
    completed_lessons = UserProgress.query.filter_by(user_id=current_user.id).count()
    level = current_user.placement_level or 1
    points = 0
    return jsonify({
        "id": current_user.id,
        "name": current_user.username,
        "email": current_user.email,
        "avatarUrl": None,
        "level": level,
        "points": points,
        "createdAt": current_user.created_at.isoformat(),
        "completedModules": completed_modules,
        "completedLessons": completed_lessons
    }) 