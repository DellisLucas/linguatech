from app import db
from app.models.user_streak import UserStreak
from datetime import datetime, timedelta

def update_user_streak(user_id):
    """Atualiza a sequência do usuário quando ele completa uma atividade"""
    streak = UserStreak.query.filter_by(user_id=user_id).first()
    now = datetime.utcnow()
    
    if not streak:
        # Cria um novo registro com valores iniciais
        streak = UserStreak(
            user_id=user_id,
            current_streak=1,
            record_streak=1,
            last_activity=now,
            weekly_progress='0000000'
        )
        db.session.add(streak)
        
    # Garante que weekly_progress existe e é uma string válida
    if not streak.weekly_progress:
        streak.weekly_progress = '0000000'
        
    try:
        # Atualiza o progresso semanal
        day_of_week = now.weekday()
        weekly_progress = ['0'] * 7  # Cria uma lista de 7 zeros
        
        # Copia o progresso existente se houver
        if streak.weekly_progress and len(streak.weekly_progress) == 7:
            weekly_progress = list(streak.weekly_progress)
            
        # Marca o dia atual como completo
        weekly_progress[day_of_week] = '1'
        streak.weekly_progress = ''.join(weekly_progress)
        
        # Atualiza a sequência
        if streak.last_activity:
            days_since_last = (now.date() - streak.last_activity.date()).days
            
            if days_since_last == 0:  # Mesmo dia
                pass  # Mantém a sequência atual
            elif days_since_last == 1:  # Dia seguinte
                streak.current_streak += 1
            else:  # Mais de um dia - quebra a sequência
                streak.current_streak = 1
        else:
            streak.current_streak = 1
            
        # Atualiza o recorde se necessário
        if streak.current_streak > streak.record_streak:
            streak.record_streak = streak.current_streak
            
        streak.last_activity = now
        db.session.commit()
        
        return {
            'current_streak': streak.current_streak,
            'record_streak': streak.record_streak,
            'weekly_progress': [int(x) for x in streak.weekly_progress]
        }
        
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao atualizar streak: {str(e)}")
        raise

def get_user_streak(user_id):
    """Obtém as informações de sequência do usuário"""
    streak = UserStreak.query.filter_by(user_id=user_id).first()
    
    if not streak:
        streak = UserStreak(
            user_id=user_id,
            current_streak=0,
            record_streak=0,
            weekly_progress='0000000',
            last_activity=None
        )
        db.session.add(streak)
        db.session.commit()
    
    return {
        'current_streak': streak.current_streak,
        'record_streak': streak.record_streak,
        'weekly_progress': [int(x) for x in (streak.weekly_progress or '0000000')]
    }