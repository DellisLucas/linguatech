from flask import Blueprint, jsonify, request
from app.services.module_service import get_all_modules, get_module_by_id
from app.utils.jwt_utils import token_required
from app.models.user_progress import UserProgress

modules_bp = Blueprint('modules', __name__)

@modules_bp.route('/modules', methods=['GET'])
def get_modules():
    # Tenta extrair o usuário se houver um token (opcional)
    user_id = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        from app.utils.jwt_utils import jwt
        try:
            token = auth_header.split(' ')[1]
            from flask import current_app
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['sub']
        except:
            # Ignora erros de token - listar módulos sem progresso personalizado
            pass
    
    modules = get_all_modules(user_id)
    return jsonify(modules), 200

@modules_bp.route('/modules/<int:module_id>', methods=['GET'])
def get_module(module_id):
    # Tenta extrair o usuário se houver um token (opcional)
    user_id = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        from app.utils.jwt_utils import jwt
        try:
            token = auth_header.split(' ')[1]
            from flask import current_app
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['sub']
        except:
            # Ignora erros de token
            pass
    
    module = get_module_by_id(module_id, user_id)
    
    if not module:
        return jsonify({'error': 'Módulo não encontrado'}), 404
    
    return jsonify(module), 200

@modules_bp.route('/modules/<int:module_id>/categories/<int:category_id>/progress', methods=['GET'])
def get_category_progress(module_id, category_id):
    # Tenta extrair o usuário se houver um token
    user_id = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        from app.utils.jwt_utils import jwt
        try:
            token = auth_header.split(' ')[1]
            from flask import current_app
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['sub']
        except:
            return jsonify({'error': 'Token inválido'}), 401
    
    if not user_id:
        return jsonify({'error': 'Usuário não autenticado'}), 401
    
    # Busca o progresso do usuário para a categoria
    progress = UserProgress.query.filter_by(
        user_id=user_id,
        module_id=module_id,
        category_id=category_id
    ).first()
    
    if not progress:
        return jsonify({'progress': 0}), 200
    
    return jsonify({'progress': progress.progress}), 200
