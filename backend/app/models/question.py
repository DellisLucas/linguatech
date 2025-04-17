from app import db

class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)

    # Relacionamentos de chave estrangeira
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)

    level = db.Column(db.Integer, default=1)
    explanation = db.Column(db.Text, nullable=True)

    # Relacionamentos
    options = db.relationship('Option', backref='question', lazy=True, cascade='all, delete-orphan')
    module = db.relationship('Module', backref=db.backref('questions', lazy=True, cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<Question {self.id}>'

    def to_dict(self, include_correct=False):
        """
        Retorna um dicionário com os dados da questão e suas opções.
        Se include_correct for True, inclui o campo 'correct' nas opções.
        """
        return {
            'id': self.id,
            'question': self.question,
            'options': [option.to_dict(include_correct) for option in self.options],
            'module_id': self.module_id,
            'category_id': self.category_id,
            'level': self.level,
            'explanation': self.explanation
        }


class Option(db.Model):
    __tablename__ = 'options'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    option_id = db.Column(db.String(10), nullable=False)  # Por ex: 'a', 'b', 'c', 'd'
    text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Option {self.option_id} for Question {self.question_id}>'

    def to_dict(self, include_correct=False):
        """
        Retorna os dados da opção. Se include_correct for True,
        também inclui se é a resposta correta.
        """
        data = {
            'id': self.option_id,
            'text': self.text
        }

        if include_correct:
            data['correct'] = self.is_correct

        return data
