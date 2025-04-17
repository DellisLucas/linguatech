from app import db
from app.models.question import Question, Option
from app.models.user_progress import UserProgress
from app.models.category import Category
from sqlalchemy import or_

def get_questions(topic=None, module_id=None, category_id=None):
    """Busca questões com base nos filtros fornecidos"""
    query = Question.query
    
    if topic:
        query = query.filter(Question.module.like(f'%{topic}%'))
    
    if category_id:
        query = query.filter(Question.category_id == category_id)
    elif module_id:
        # Se apenas module_id for fornecido, busca todas as questões das categorias desse módulo
        categories = Category.query.filter_by(module_id=module_id).all()
        category_ids = [c.id for c in categories]
        if category_ids:
            query = query.filter(Question.category_id.in_(category_ids))
    
    questions = query.all()
    return [q.to_dict(include_correct=False) for q in questions]

def evaluate_quiz(answers, user_id=None, module_id=None, category_id=None):
    """Avalia as respostas do quiz e retorna os resultados"""
    score = 0
    total = len(answers)
    
    if total == 0:
        return {
            'score': 0,
            'total': 0,
            'percentage': 0,
            'feedback': 'Nenhuma resposta fornecida'
        }
    
    for answer in answers:
        question_id = answer['questionId']
        selected_option = answer['selectedOption']
        
        # Verifica se a resposta está correta
        option = Option.query.join(Question).filter(
            Question.id == question_id,
            Option.option_id == selected_option,
            Option.is_correct == True
        ).first()
        
        if option:
            score += 1
    
    # Calcula a porcentagem
    percentage = round((score / total) * 100)
    
    # Gera feedback com base na porcentagem
    feedback = ""
    if percentage >= 80:
        feedback = "Excelente! Você dominou esse conteúdo."
    elif percentage >= 60:
        feedback = "Bom trabalho! Você está no caminho certo."
    else:
        feedback = "Continue praticando. A prática leva à perfeição!"
    
    # Atualiza o progresso do usuário se o usuário estiver autenticado
    if user_id and (module_id or category_id):
        update_user_progress(user_id, module_id, category_id, percentage)
    
    return {
        'score': score,
        'total': total,
        'percentage': percentage,
        'feedback': feedback
    }

def update_user_progress(user_id, module_id, category_id=None, percentage=0):
    """Atualiza o progresso do usuário para um módulo/categoria"""
    progress = UserProgress.query.filter_by(
        user_id=user_id,
        module_id=module_id,
        category_id=category_id
    ).first()
    
    if progress:
        # Atualiza o progresso existente
        progress.progress = max(progress.progress, percentage)  # Atualiza apenas se for maior que o atual
    else:
        # Cria um novo registro de progresso
        progress = UserProgress(
            user_id=user_id,
            module_id=module_id,
            category_id=category_id,
            progress=percentage
        )
        db.session.add(progress)
    
    db.session.commit()
    
    # Se foi um progresso de categoria, também atualiza o progresso do módulo
    if category_id:
        update_module_progress(user_id, module_id)

def update_module_progress(user_id, module_id):
    """Atualiza o progresso geral do módulo com base nas categorias"""
    # Encontra todas as categorias do módulo
    categories = Category.query.filter_by(module_id=module_id).all()
    
    if not categories:
        return
    
    # Calcula a média de progresso das categorias
    total_progress = 0
    for category in categories:
        progress = UserProgress.query.filter_by(
            user_id=user_id,
            module_id=module_id,
            category_id=category.id
        ).first()
        
        total_progress += progress.progress if progress else 0
    
    average_progress = total_progress // len(categories)
    
    # Atualiza o progresso do módulo
    module_progress = UserProgress.query.filter_by(
        user_id=user_id,
        module_id=module_id,
        category_id=None
    ).first()
    
    if module_progress:
        module_progress.progress = average_progress
    else:
        module_progress = UserProgress(
            user_id=user_id,
            module_id=module_id,
            category_id=None,
            progress=average_progress
        )
        db.session.add(module_progress)
    
    db.session.commit()
