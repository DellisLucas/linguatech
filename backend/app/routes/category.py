from flask import Blueprint, jsonify, request, current_app
from app.models.category import Category
from app.services.category_service import get_category_by_module_id
from app.utils.jwt_utils import jwt

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories/module/<int:module_id>', methods=['GET'])
def get_category(module_id):
    user_id = None
    auth_header = request.headers.get('Authorization')
    
    if auth_header and auth_header.startswith('Bearer '):
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['sub']
        except:
            pass  # Ignora erros de token
    
    category = get_category_by_module_id(module_id, user_id)
    
    if not category:
        return jsonify({'error': 'Categoria não encontrada'}), 404
    
    return jsonify(category), 200

@categories_bp.route('/modules/<int:module_id>/categories', methods=['GET'])
def get_categories_by_module(module_id):
    """Retorna todas as categorias de um módulo específico"""
    categories = Category.query.filter_by(module_id=module_id).all()
    
    if not categories:
        return jsonify({"error": "Nenhuma categoria encontrada"}), 404
    
    return jsonify([category.to_dict() for category in categories]), 200
