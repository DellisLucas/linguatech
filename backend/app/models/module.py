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
        from app.models.user_progress import UserProgress

        progress = 0
        if user_id:
            progress_data = UserProgress.query.filter_by(
                user_id=user_id,
                module_id=self.id,
                category_id=None  # Progresso geral do módulo
            ).first()

            if progress_data:
                progress = progress_data.progress

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'progress': progress,
            'categories': [category.to_dict(user_id) for category in self.categories]
        }
