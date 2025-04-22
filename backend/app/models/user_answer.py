from app import db
from datetime import datetime

class UserAnswer(db.Model):
    __tablename__ = 'user_answers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    answer = db.Column(db.String(500), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = db.relationship('User', backref=db.backref('answers', lazy=True))
    question = db.relationship('Question', backref=db.backref('answers_given', lazy=True))
    
    def __init__(self, user_id, question_id, answer, is_correct):
        self.user_id = user_id
        self.question_id = question_id
        self.answer = answer
        self.is_correct = is_correct
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'question_id': self.question_id,
            'answer': self.answer,
            'is_correct': self.is_correct,
            'created_at': self.created_at.isoformat()
        } 