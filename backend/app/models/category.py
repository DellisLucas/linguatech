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
        from app.models.user_progress import UserProgress
        
        progress = 0
        if user_id:
            progress_data = UserProgress.query.filter_by(
                user_id=user_id,
                module_id=self.module_id,
                category_id=self.id
            ).first()

            if progress_data:
                progress = progress_data.progress

        return {
            'id': self.id,
            'name': self.name,
            'progress': progress
        }
