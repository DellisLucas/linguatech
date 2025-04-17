import jwt
import datetime
from flask import current_app, request, jsonify
from functools import wraps
from app.models.user import User

def generate_token(user_id):
    """Gera um token JWT para o usuário"""
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=current_app.config['JWT_EXPIRATION_DELTA']),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(
        payload,
        current_app.config.get('SECRET_KEY'),
        algorithm='HS256'
    )

def token_required(f):
    """Decorator para verificar token JWT em rotas protegidas"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Pega o token do header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token inválido'}), 401
        
        if not token:
            return jsonify({'message': 'Token ausente'}), 401
        
        try:
            # Decodifica o token
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = payload['sub']
            current_user = User.query.get(current_user_id)
            
            if not current_user:
                return jsonify({'message': 'Usuário não encontrado'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado. Faça login novamente'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 401
            
        # Passa o usuário atual para a função
        return f(current_user, *args, **kwargs)
    
    return decorated
