import bcrypt
from app import db
from app.models.user import User
from app.utils.jwt_utils import generate_token

def hash_password(password):
    """Cria um hash da senha usando bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password, hashed_password):
    """Verifica se a senha corresponde ao hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def register_user(username, email, password):
    """Registra um novo usuário"""
    # Verifica se o usuário já existe
    existing_user = User.query.filter((User.email == email)).first()
    if existing_user:
        if User.email == email:
            return {'error': 'E-mail já está em uso'}, 400

    
    # Cria o novo usuário
    hashed_password = hash_password(password)
    new_user = User(username=username, email=email, password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    
    # Gera token
    token = generate_token(new_user.id)
    
    return {
        'message': 'Usuário criado com sucesso',
        'token': token,
        'user': {
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email
        }
    }, 201

def login_user(email, password):
    """Realiza login de um usuário"""
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password(password, user.password):
        return {'error': 'Credenciais inválidas'}, 401
    
    # Gera token
    token = generate_token(user.id)
    
    # Garante que o placement_level seja uma string
    user_data = user.to_dict()
    user_data['placement_level'] = str(user_data['placement_level']) if user_data['placement_level'] is not None else "0"
    
    return {
        'message': 'Login bem-sucedido',
        'token': token,
        'user': user_data
    }, 200
