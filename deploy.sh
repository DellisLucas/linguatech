#!/bin/bash

# Atualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar dependências do sistema
sudo apt install -y nginx python3-pip python3-venv nodejs npm

# Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo systemctl restart nginx

# Configurar backend
sudo mkdir -p /var/www/backend
sudo cp -r backend/* /var/www/backend/
cd /var/www/backend

# Configurar ambiente virtual
sudo python3 -m venv venv
sudo chown -R $USER:$USER venv
source venv/bin/activate

# Instalar dependências Python
pip install -r requirements.txt
pip install gunicorn

# Configurar variáveis de ambiente
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Por favor, configure o arquivo .env com suas configurações"
    echo "Após configurar, execute novamente o script"
    exit 1
fi

# Inicializar banco de dados SQLite
export FLASK_APP=app
export FLASK_ENV=production
flask db upgrade

# Configurar serviço do backend
sudo cp /home/$USER/linguatech/backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable backend
sudo systemctl start backend

# Configurar frontend
sudo mkdir -p /var/www/frontend
sudo cp -r frontend/* /var/www/frontend/
cd /var/www/frontend

# Configurar variáveis de ambiente do frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Por favor, configure o arquivo .env do frontend com suas configurações"
    echo "Após configurar, execute novamente o script"
    exit 1
fi

# Instalar dependências e build
sudo chown -R $USER:$USER .
npm install
npm run build

# Configurar permissões finais
sudo chown -R www-data:www-data /var/www
sudo chmod -R 755 /var/www

echo "Deploy concluído!"
echo "Por favor, verifique se os serviços estão rodando:"
echo "sudo systemctl status backend"
echo "sudo systemctl status nginx" 