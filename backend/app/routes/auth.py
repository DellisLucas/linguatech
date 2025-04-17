from flask import Blueprint, request, jsonify
from app.services.auth_service import register_user, login_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validação básica
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Dados incompletos'}), 400
    
    response, status_code = register_user(
        data.get('name'),
        data.get('email'),
        data.get('password')
    )
    
    return jsonify(response), status_code

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validação básica
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Dados incompletos'}), 400
    
    response, status_code = login_user(
        data.get('email'),
        data.get('password')
    )
    
    return jsonify(response), status_code
