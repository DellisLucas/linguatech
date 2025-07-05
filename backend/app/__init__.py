from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from app.config import Config
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicialize o JWTManager
    jwt = JWTManager(app)

    # Configuração do CORS para permitir múltiplas origens
    CORS(app, resources={
        r"/*": {  # Permite todas as rotas
            "origins": "*",
            "supports_credentials": True,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin"]
        }
    })
    
    db.init_app(app)
    migrate.init_app(app, db)

    # Importa modelos para registrar no SQLAlchemy
    from app import models

    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.questions import questions_bp
    from app.routes.modules import modules_bp
    from app.routes.category import categories_bp
    from app.routes.leveling import placement_bp
    from app.routes.explainerAI import explainer_bp
    from app.routes.streak import streak_bp
    from app.routes.user_answers import bp as user_answers_bp
    from app.routes.user import user_bp


    app.register_blueprint(explainer_bp)
    app.register_blueprint(placement_bp)
    app.register_blueprint(questions_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(modules_bp, url_prefix='/api')
    app.register_blueprint(categories_bp, url_prefix='/api')
    app.register_blueprint(streak_bp)
    app.register_blueprint(user_answers_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')

    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            return '', 200

    with app.app_context():
        db.create_all()

    return app
