#!/bin/bash

# Atualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar dependências
sudo apt install -y nginx python3-pip python3-venv nodejs npm

# Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo systemctl restart nginx

# Configurar backend
sudo mkdir -p /var/www/backend
sudo cp -r backend/* /var/www/backend/
cd /var/www/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Configurar serviço do backend
sudo cp backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable backend
sudo systemctl start backend

# Configurar frontend
sudo mkdir -p /var/www/frontend
cd /var/www/frontend
sudo cp -r frontend/* .
npm install
npm run build

# Configurar permissões
sudo chown -R www-data:www-data /var/www
sudo chmod -R 755 /var/www

echo "Deploy concluído!" 