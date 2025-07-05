from app import db

class Module(db.Model):
    __tablename__ = 'modules'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Relacionamentos
    categories = db.relationship('Category', backref='module', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Module {self.title}>'

    def to_dict(self, user_id=None):
        """
        Retorna um dicionário com os dados do módulo,
        incluindo progresso do usuário (se fornecido) e categorias.
        """
        from app.models.question import Question
        from app.models.user_answer import UserAnswer
        from app import db

        progress = 0
        if user_id:
            # Calcula o progresso com base nas respostas do usuário
            # Busca todas as questões das categorias deste módulo
            category_ids = [category.id for category in self.categories]
            if category_ids:
                total_questions = Question.query.filter(Question.category_id.in_(category_ids)).count()
                
                if total_questions > 0:
                    # Busca as questões que o usuário respondeu corretamente
                    correct_answers = UserAnswer.query.filter(
                        UserAnswer.user_id == user_id,
                        UserAnswer.is_correct == True,
                        UserAnswer.question_id.in_(
                            db.session.query(Question.id).filter(Question.category_id.in_(category_ids))
                        )
                    ).count()
                    
                    # Calcula o progresso como porcentagem
                    progress = round((correct_answers / total_questions) * 100)

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'progress': progress,
            'categories': [category.to_dict(user_id) for category in self.categories]
        }
