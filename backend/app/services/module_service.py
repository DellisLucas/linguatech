from app.models.module import Module

def get_all_modules(user_id=None):
    """Retorna todos os módulos e suas categorias"""
    modules = Module.query.all()
    return [module.to_dict(user_id) for module in modules]

def get_module_by_id(module_id, user_id=None):
    """Retorna um módulo específico por ID"""
    module = Module.query.get(module_id)
    if not module:
        return None
    
    return module.to_dict(user_id)
