# LinguaTech - Plataforma de Aprendizado de Inglês Técnico

LinguaTech é uma plataforma inovadora projetada para auxiliar profissionais de TI no aprendizado de inglês técnico. A aplicação oferece um ambiente interativo com módulos personalizados, sistema de nivelamento e feedback em tempo real.

## 🚀 Estrutura do Projeto
linguatech/
├── backend/ # API Flask
├── frontend/ # Aplicação React
├── docs/ # Documentação
└── README.md


## 🛠️ Tecnologias Utilizadas

### Backend
- Python 3.11+
- Flask
- SQLAlchemy
- Flask-Migrate
- Google Gemini AI
- PostgreSQL (produção) / SQLite (desenvolvimento)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- React Query
- React Router DOM

## 📋 Pré-requisitos

- Python 3.11 ou superior
- Node.js 18 ou superior
- npm, yarn ou bun
- Git

## 🔧 Instalação

### Clonando o Repositório

```bash
git clone <url-do-repositorio>
cd linguatech
```

### Configurando o Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicializar banco de dados
flask db upgrade

# Iniciar servidor de desenvolvimento
flask run
```

### Configurando o Frontend

```bash
cd frontend

# Instalar dependências
npm install
# ou
yarn install
# ou
bun install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar servidor de desenvolvimento
npm run dev
# ou
yarn dev
# ou
bun dev
```

## 🚀 Executando o Projeto

### Backend

```bash
cd backend
source venv/bin/activate  # ou venv\Scripts\activate no Windows
flask run
```

O backend estará disponível em `http://localhost:5000`

### Frontend

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:8080`

## 📚 Funcionalidades Principais

- **Sistema de Nivelamento**: Avaliação inicial para determinar o nível do usuário
- **Módulos Personalizados**: Conteúdo adaptado ao nível e área de interesse
- **Explicações com IA**: Feedback detalhado usando Google Gemini AI
- **Progresso Personalizado**: Acompanhamento do desenvolvimento do usuário
- **Interface Intuitiva**: Design moderno e responsivo

## 🗂️ Estrutura de Módulos

1. **Entrevistas e Reuniões**
   - Vocabulário para entrevistas técnicas
   - Comunicação em reuniões

2. **Programação e Desenvolvimento**
   - Termos técnicos de programação
   - Documentação e comentários

3. **Documentação Técnica**
   - Leitura de documentação
   - Escrita técnica

4. **Segurança da Informação**
   - Terminologia de segurança
   - Comunicação de incidentes

## 👥 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature:
```bash
git checkout -b feature/nova-funcionalidade
```
3. Commit suas mudanças:
```bash
git commit -m "feat: adiciona nova funcionalidade"
```
4. Push para a branch:
```bash
git push origin feature/nova-funcionalidade
```
5. Abra um Pull Request

## 📝 Convenções de Código

### Commits
Seguimos o padrão Conventional Commits:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alteração em documentação
- `style`: Alterações que não afetam o código
- `refactor`: Refatoração de código
- `test`: Adição ou modificação de testes
- `chore`: Alterações em arquivos de build

### Estilo de Código
- Backend: PEP 8
- Frontend: ESLint + Prettier

## ⚠️ Aviso de Direitos Autorais

Este projeto foi desenvolvido como Trabalho de Graduação (TG) por Lucas da Silva Dellis e Leticia Camargo Marmo Rangel de Andrade em 2025.

**Todos os direitos reservados.** É permitida apenas a visualização para fins acadêmicos e educacionais.

É proibida a cópia, modificação, redistribuição ou uso comercial sem autorização prévia do autor.

## 📝 Direitos Autorais e Uso

Este projeto está protegido por direitos autorais. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes sobre as permissões e restrições de uso.

Para solicitar permissões adicionais, entre em contato com os autores.
