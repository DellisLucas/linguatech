from app import db

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)

    # Relacionamentos
    questions = db.relationship('Question', backref='category', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Category {self.name}>'

    def to_dict(self, user_id=None):
        """
        Retorna um dicionário com os dados da categoria,
        incluindo o progresso do usuário, se fornecido.
        """
        from app.models.question import Question
        from app.models.user_answer import UserAnswer
        from app import db
        
        progress = 0
        if user_id:
            # Busca todas as questões da categoria
            total_questions = Question.query.filter_by(category_id=self.id).count()
            
            if total_questions > 0:
                # Busca as questões que o usuário respondeu corretamente
                correct_answers = UserAnswer.query.filter(
                    UserAnswer.user_id == user_id,
                    UserAnswer.is_correct == True,
                    UserAnswer.question_id.in_(
                        db.session.query(Question.id).filter_by(category_id=self.id)
                    )
                ).count()
                
                # Calcula o progresso como porcentagem
                progress = round((correct_answers / total_questions) * 100)

        return {
            'id': self.id,
            'name': self.name,
            'progress': progress
        }
