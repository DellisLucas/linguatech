from app.models.category import Category

def get_all_category(user_id=None):
    """Retorna todos os módulos e suas categorias"""
    modules = Module.query.all()
    return [module.to_dict(user_id) for module in modules]

def get_module_by_id(module_id, user_id=None):
    """Retorna um módulo específico por ID"""
    module = Module.query.get(module_id)
    if not module:
        return None
    
    return module.to_dict(user_id)

def get_category_by_module_id(module_id, user_id=None):
    """Retorna uma categoria específica com base no módulo e usuário (se necessário)"""
    category = Category.query.filter_by(module_id=module_id).first()
    
    if not category:
        return None
    
    return category.to_dict()