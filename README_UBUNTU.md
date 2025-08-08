# IPA AI Assistant - Ubuntu Installation Guide

## 📋 Обзор проекта

IPA (Integrated Portable Assistant) - это ИИ-ассистент с расширенными возможностями для инженеров, включающий:

- 🤖 **ИИ-чат** с поддержкой Gemini API
- 📝 **Управление статьями** (создание, чтение, удаление)
- 🔧 **Инженерные инструменты** (калькулятор, конвертер единиц, формулы, константы)
- 📊 **Визуализация данных** (графики, схемы)
- 🌤️ **Погодная информация**
- 🔊 **Text-to-Speech** (озвучивание ответов)
- 🖼️ **Анализ изображений**

## 🏗️ Архитектура

Проект состоит из трех основных компонентов:

1. **Серверная часть** (`server-ubuntu/`) - основной бэкенд
2. **Веб-клиент** (`client-web/`) - браузерный интерфейс
3. **Консольный клиент** (`client-ubuntu/`) - терминальный интерфейс

## 🚀 Быстрая установка

### Предварительные требования

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js и npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка Git
sudo apt install git -y

# Проверка версий
node --version
npm --version
git --version
```

### 1. Клонирование проекта

```bash
# Клонирование репозитория
git clone <your-repository-url>
cd AI

# Или если проект уже есть
cd /path/to/your/AI/project
```

### 2. Установка серверной части

```bash
# Переход в директорию сервера
cd server-ubuntu

# Установка зависимостей
npm install

# Создание файла .env
cp env.example .env

# Редактирование .env файла
nano .env
```

**Содержимое .env файла:**
```env
PORT=3001
HOST=0.0.0.0
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=production
```

### 3. Установка веб-клиента

```bash
# Переход в директорию веб-клиента
cd ../client-web

# Установка зависимостей
npm install

# Сборка для продакшена
npm run build
```

### 4. Установка консольного клиента (опционально)

```bash
# Переход в директорию консольного клиента
cd ../client-ubuntu

# Установка зависимостей
npm install

# Создание конфигурационного файла
cp config/config.example.js config/config.js

# Редактирование конфигурации
nano config/config.js
```

## 🔧 Подробная настройка

### Настройка сервера

#### 1. Создание системного сервиса

```bash
# Создание файла сервиса
sudo nano /etc/systemd/system/ipa-server.service
```

**Содержимое файла сервиса:**
```ini
[Unit]
Description=IPA AI Assistant Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/AI/server-ubuntu
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=HOST=0.0.0.0

[Install]
WantedBy=multi-user.target
```

#### 2. Активация сервиса

```bash
# Перезагрузка systemd
sudo systemctl daemon-reload

# Включение автозапуска
sudo systemctl enable ipa-server

# Запуск сервиса
sudo systemctl start ipa-server

# Проверка статуса
sudo systemctl status ipa-server

# Просмотр логов
sudo journalctl -u ipa-server -f
```

#### 3. Настройка файрвола

```bash
# Открытие порта 3001
sudo ufw allow 3001

# Проверка статуса файрвола
sudo ufw status
```

### Настройка веб-клиента

#### 1. Установка Nginx

```bash
# Установка Nginx
sudo apt install nginx -y

# Запуск и включение автозапуска
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 2. Настройка Nginx

```bash
# Создание конфигурации сайта
sudo nano /etc/nginx/sites-available/ipa-client
```

**Содержимое конфигурации:**
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен или IP

    root /home/ubuntu/AI/client-web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксирование API запросов к серверу
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Проксирование Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. Активация сайта

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/ipa-client /etc/nginx/sites-enabled/

# Удаление дефолтного сайта
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl reload nginx
```

#### 4. Настройка SSL (опционально)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление сертификата
sudo crontab -e
# Добавить строку: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Настройка консольного клиента

#### 1. Создание скрипта запуска

```bash
# Создание скрипта
nano ~/start-ipa-client.sh
```

**Содержимое скрипта:**
```bash
#!/bin/bash
cd /home/ubuntu/AI/client-ubuntu
node client.js
```

#### 2. Делаем скрипт исполняемым

```bash
chmod +x ~/start-ipa-client.sh
```

## 🧪 Тестирование установки

### 1. Проверка сервера

```bash
# Проверка статуса сервиса
sudo systemctl status ipa-server

# Проверка порта
netstat -tulpn | grep :3001

# Тестирование API
curl http://localhost:3001/api/articles
```

### 2. Проверка веб-клиента

```bash
# Проверка Nginx
sudo systemctl status nginx

# Проверка доступности сайта
curl http://localhost

# Открытие в браузере
# http://your-server-ip
```

### 3. Проверка консольного клиента

```bash
# Запуск клиента
cd ~/AI/client-ubuntu
node client.js
```

## 🔧 Устранение неполадок

### Проблемы с сервером

#### Сервер не запускается

```bash
# Проверка логов
sudo journalctl -u ipa-server -n 50

# Проверка файла .env
cat /home/ubuntu/AI/server-ubuntu/.env

# Проверка зависимостей
cd /home/ubuntu/AI/server-ubuntu
npm list

# Ручной запуск для отладки
cd /home/ubuntu/AI/server-ubuntu
node server.js
```

#### Проблемы с API ключом

```bash
# Проверка переменной окружения
echo $GEMINI_API_KEY

# Проверка в .env файле
grep GEMINI_API_KEY /home/ubuntu/AI/server-ubuntu/.env
```

### Проблемы с веб-клиентом

#### Сайт не загружается

```bash
# Проверка статуса Nginx
sudo systemctl status nginx

# Проверка конфигурации
sudo nginx -t

# Проверка файлов
ls -la /home/ubuntu/AI/client-web/dist/

# Проверка логов Nginx
sudo tail -f /var/log/nginx/error.log
```

#### Проблемы с подключением к серверу

```bash
# Проверка CORS настроек
curl -H "Origin: http://localhost" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:3001/api/articles
```

### Проблемы с консольным клиентом

```bash
# Проверка подключения к серверу
telnet localhost 3001

# Проверка конфигурации
cat ~/AI/client-ubuntu/config/config.js

# Запуск с отладкой
cd ~/AI/client-ubuntu
DEBUG=* node client.js
```

## 📊 Мониторинг и логирование

### Просмотр логов сервера

```bash
# Логи systemd
sudo journalctl -u ipa-server -f

# Логи приложения
tail -f /home/ubuntu/AI/server-ubuntu/logs/combined.log
tail -f /home/ubuntu/AI/server-ubuntu/logs/error.log
tail -f /home/ubuntu/AI/server-ubuntu/logs/api.log
tail -f /home/ubuntu/AI/server-ubuntu/logs/gemini.log
```

### Мониторинг ресурсов

```bash
# Мониторинг процессов
htop

# Мониторинг сети
iftop

# Мониторинг диска
df -h
du -sh /home/ubuntu/AI/
```

## 🔄 Обновление системы

### Обновление кода

```bash
# Остановка сервисов
sudo systemctl stop ipa-server

# Обновление кода
cd /home/ubuntu/AI
git pull origin main

# Обновление зависимостей сервера
cd server-ubuntu
npm install

# Обновление веб-клиента
cd ../client-web
npm install
npm run build

# Перезапуск сервисов
sudo systemctl start ipa-server
sudo systemctl reload nginx
```

### Обновление системы

```bash
# Обновление пакетов
sudo apt update && sudo apt upgrade -y

# Перезагрузка системы (при необходимости)
sudo reboot
```

## 🔒 Безопасность

### Настройка файрвола

```bash
# Включение UFW
sudo ufw enable

# Разрешение SSH
sudo ufw allow ssh

# Разрешение HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Разрешение порта сервера
sudo ufw allow 3001

# Проверка правил
sudo ufw status numbered
```

### Настройка пользователей

```bash
# Создание отдельного пользователя для приложения
sudo adduser ipa-user

# Передача прав на директорию
sudo chown -R ipa-user:ipa-user /home/ubuntu/AI

# Обновление сервиса для использования нового пользователя
sudo nano /etc/systemd/system/ipa-server.service
# Изменить User=ubuntu на User=ipa-user
```

## 📝 Полезные команды

### Управление сервисами

```bash
# Статус сервисов
sudo systemctl status ipa-server
sudo systemctl status nginx

# Перезапуск сервисов
sudo systemctl restart ipa-server
sudo systemctl reload nginx

# Включение/выключение автозапуска
sudo systemctl enable ipa-server
sudo systemctl disable ipa-server
```

### Работа с логами

```bash
# Просмотр логов в реальном времени
sudo journalctl -u ipa-server -f
sudo tail -f /var/log/nginx/access.log

# Очистка логов
sudo journalctl --vacuum-time=7d
```

### Резервное копирование

```bash
# Создание резервной копии
tar -czf ipa-backup-$(date +%Y%m%d).tar.gz /home/ubuntu/AI/

# Восстановление из резервной копии
tar -xzf ipa-backup-YYYYMMDD.tar.gz -C /
```

## 🆘 Поддержка

### Полезные ссылки

- [Node.js Documentation](https://nodejs.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Systemd Documentation](https://systemd.io/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)

### Логи и отладка

При возникновении проблем:

1. Проверьте логи сервера: `sudo journalctl -u ipa-server -f`
2. Проверьте логи Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Проверьте статус сервисов: `sudo systemctl status ipa-server nginx`
4. Проверьте сетевые соединения: `netstat -tulpn | grep :3001`

### Контакты

Для получения поддержки создайте issue в репозитории проекта или обратитесь к разработчикам.

---

**Версия документа:** 1.0  
**Последнее обновление:** $(date)  
**Совместимость:** Ubuntu 20.04 LTS и выше
