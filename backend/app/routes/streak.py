from flask import Blueprint, jsonify
from app.services.streak_service import get_user_streak, update_user_streak
from app.utils.jwt_utils import token_required

streak_bp = Blueprint('streak', __name__, url_prefix='/api/streak')

@streak_bp.route('', methods=['GET'])
@token_required
def get_streak(current_user):
    streak_data = get_user_streak(current_user.id)
    return jsonify(streak_data)

@streak_bp.route('/update', methods=['POST'])
@token_required
def update_streak(current_user):
    streak_data = update_user_streak(current_user.id)
    return jsonify(streak_data)