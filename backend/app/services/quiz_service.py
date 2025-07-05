from app import db
from app.models.question import Question, Option
from app.models.user_progress import UserProgress
from app.models.category import Category
from app.models.user_answer import UserAnswer
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
    
    # Dicionário para armazenar o progresso por categoria
    category_progress = {}
    
    for answer in answers:
        try:
            # Verifica se answer é um dicionário
            if not isinstance(answer, dict):
                print(f"Resposta inválida (não é um dicionário): {answer}")
                continue
                
            question_id = answer.get('questionId')
            selected_option = answer.get('selectedOption')
            
            if not question_id or not selected_option:
                print(f"Resposta inválida (campos ausentes): {answer}")
                continue
            
            # Busca a questão para obter a categoria
            question = Question.query.get(question_id)
            if not question:
                print(f"Questão não encontrada: {question_id}")
                continue
                
            # Inicializa o contador para a categoria se não existir
            if question.category_id not in category_progress:
                category_progress[question.category_id] = {
                    'score': 0,
                    'total': 0,
                    'module_id': question.category.module_id
                }
            
            # Incrementa o total de questões para a categoria
            category_progress[question.category_id]['total'] += 1
            
            # Verifica se a resposta está correta
            option = Option.query.join(Question).filter(
                Question.id == question_id,
                Option.option_id == selected_option,
                Option.is_correct == True
            ).first()
            
            is_correct = bool(option)
            if is_correct:
                score += 1
                category_progress[question.category_id]['score'] += 1
            
            # Salva a resposta do usuário
            if user_id:
                user_answer = UserAnswer(
                    user_id=user_id,
                    question_id=question_id,
                    answer=selected_option,
                    is_correct=is_correct
                )
                db.session.add(user_answer)
                
        except Exception as e:
            print(f"Erro ao processar resposta: {e}")
            continue
    
    # Calcula a porcentagem geral
    percentage = round((score / total) * 100)
    
    # Gera feedback com base na porcentagem
    feedback = ""
    if percentage >= 80:
        feedback = "Excelente! Você dominou esse conteúdo."
    elif percentage >= 60:
        feedback = "Bom trabalho! Você está no caminho certo."
    else:
        feedback = "Continue praticando. A prática leva à perfeição!"
    
    # Commit para salvar todas as respostas
    if user_id:
        db.session.commit()
    
    return {
        'score': score,
        'total': total,
        'percentage': percentage,
        'feedback': feedback
    }

def update_user_progress(user_id, module_id, category_id=None, percentage=0):
    """Atualiza o progresso do usuário para um módulo/categoria"""
    # Esta função agora não faz nada, pois não estamos mais usando a tabela user_progress
    # O progresso é calculado diretamente quando necessário
    pass

def update_module_progress(user_id, module_id):
    """Atualiza o progresso geral do módulo com base nas categorias"""
    # Esta função agora não faz nada, pois não estamos mais usando a tabela user_progress
    # O progresso é calculado diretamente quando necessário
    pass
