from app import db
from datetime import datetime

class UserProgress(db.Model):
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)

    progress = db.Column(db.Integer, default=0)  # Porcentagem (0-100)
    total_quizzes = db.Column(db.Integer, default=0)  # Total de quizzes respondidos
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos (opcional, mas úteis para facilitar joins e queries com ORM)
    user = db.relationship('User', back_populates='progress')
    module = db.relationship('Module', backref=db.backref('user_progress', lazy=True, cascade='all, delete-orphan'))
    category = db.relationship('Category', backref=db.backref('user_progress', lazy=True, cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<UserProgress user_id={self.user_id} module_id={self.module_id} category_id={self.category_id}>'

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'module_id': self.module_id,
            'category_id': self.category_id,
            'progress': self.progress,
            'total_quizzes': self.total_quizzes,
            'last_updated': self.last_updated.isoformat()
        }
