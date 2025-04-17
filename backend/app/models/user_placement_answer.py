from app import db

class UserPlacementAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'))
    selected_option_id = db.Column(db.String, nullable=False)  # 'a', 'b', 'c', 'd'
    is_correct = db.Column(db.Boolean, default=False)
    level = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship('User', backref=db.backref('placement_answers', lazy=True))
    question = db.relationship('Question', backref=db.backref('user_answers', lazy=True))
