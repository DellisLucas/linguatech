from app import db
from datetime import datetime

class UserStreak(db.Model):
    __tablename__ = 'user_streaks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    current_streak = db.Column(db.Integer, default=0)
    record_streak = db.Column(db.Integer, default=0)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    weekly_progress = db.Column(db.String, default='0000000')  # Representa os 7 dias da semana (0 = não estudou, 1 = estudou)
    
    user = db.relationship('User', backref=db.backref('streak', uselist=False))

    def to_dict(self):
        return {
            'current_streak': self.current_streak,
            'record_streak': self.record_streak,
            'weekly_progress': [int(day) for day in self.weekly_progress]
        }