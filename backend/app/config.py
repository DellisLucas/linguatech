import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    JWT_EXPIRATION_DELTA = int(os.getenv('JWT_EXPIRATION_DELTA', 86400))
    
    # CORS
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:8080')
    
    # Security
    BCRYPT_SALT_ROUNDS = int(os.getenv('BCRYPT_SALT_ROUNDS', 12))