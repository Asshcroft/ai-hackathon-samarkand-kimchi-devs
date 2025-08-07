# IPA - Integrated Portable Assistant (Ubuntu Versions)

Две версии IPA для Ubuntu: серверная часть и консольный клиент с постоянным соединением.

## Архитектура

```
┌─────────────────┐    Socket.IO    ┌─────────────────┐
│   IPA Client    │ ◄──────────────► │   IPA Server    │
│  (Ubuntu)       │                 │   (Ubuntu)      │
│                 │                 │                 │
│ - Console UI    │                 │ - Gemini API    │
│ - Socket.IO     │                 │ - File Storage  │
│ - REST API      │                 │ - Logging       │
└─────────────────┘                 └─────────────────┘
```

## Компоненты

### 1. IPA Server (server-ubuntu/)
Серверная часть, которая:
- Обрабатывает запросы к Gemini API
- Сохраняет статьи в папке `./databases/`
- Ведет логи в папке `./logs/`
- Предоставляет REST API и Socket.IO
- Работает как systemd служба

### 2. IPA Client (client-ubuntu/)
Консольный клиент, который:
- Поддерживает постоянное соединение с сервером
- Имеет интерактивный интерфейс
- Управляет статьями через команды
- Автоматически переподключается при разрыве

## Быстрая установка

### Установка сервера

```bash
# Клонирование
git clone <repository-url>
cd server-ubuntu

# Установка
chmod +x install.sh
./install.sh

# Настройка API ключа
nano ~/ipa-server/.env
# Добавьте: GEMINI_API_KEY=your_api_key_here

# Запуск
~/ipa-server/manage.sh start
```

### Установка клиента

```bash
# Клонирование
git clone <repository-url>
cd client-ubuntu

# Установка
chmod +x install.sh
./install.sh

# Настройка сервера
~/ipa-client/configure.sh

# Запуск
cd ~/ipa-client
npm start
```

## Подробная установка

### Требования

- Ubuntu 20.04, 22.04 или 24.04
- Node.js 18+
- npm или yarn
- API ключ Google Gemini

### Установка сервера

1. **Подготовка системы:**
```bash
sudo apt update
sudo apt install -y curl git
```

2. **Установка Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Клонирование и установка:**
```bash
git clone <repository-url>
cd server-ubuntu
chmod +x install.sh
./install.sh
```

4. **Настройка:**
```bash
nano ~/ipa-server/.env
# Добавьте ваш GEMINI_API_KEY
```

5. **Запуск:**
```bash
~/ipa-server/manage.sh start
~/ipa-server/manage.sh status
```

### Установка клиента

1. **Подготовка:**
```bash
sudo apt update
sudo apt install -y curl git
```

2. **Установка Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Клонирование и установка:**
```bash
git clone <repository-url>
cd client-ubuntu
chmod +x install.sh
./install.sh
```

4. **Настройка:**
```bash
~/ipa-client/configure.sh
# Введите IP адрес сервера
```

5. **Запуск:**
```bash
cd ~/ipa-client
npm start
```

## Использование

### Серверные команды

```bash
# Управление службой
~/ipa-server/manage.sh start    # Запуск
~/ipa-server/manage.sh stop     # Остановка
~/ipa-server/manage.sh restart  # Перезапуск
~/ipa-server/manage.sh status   # Статус
~/ipa-server/manage.sh logs     # Просмотр логов

# Прямой запуск
cd ~/ipa-server
npm start
```

### Клиентские команды

```bash
# Запуск клиента
cd ~/ipa-client
npm start

# Команды в клиенте
/help     # Показать меню
/list     # Список статей
/read     # Читать статью
/stats    # Статистика
/config   # Конфигурация
/clear    # Очистить экран
/quit     # Выйти
```

### Примеры использования

```bash
# На сервере
$ ~/ipa-server/manage.sh start
$ curl http://localhost:3001/api/health

# На клиенте
$ cd ~/ipa-client
$ npm start

> Привет, как дела?
🤖 AI: Привет! У меня все хорошо...

> Создай статью о первой помощи
🤖 AI: Создаю статью о первой помощи...
✓ Article saved: first_aid_guide.md

> /list
┌─────┬──────────────────────────────┬─────────────┐
│ №   │ Filename                     │ Size        │
├─────┼──────────────────────────────┼─────────────┤
│ 1   │ first_aid_guide.md           │ N/A         │
└─────┴──────────────────────────────┴─────────────┘
```

## API Endpoints

### REST API (Сервер)

- `GET /api/health` - Проверка состояния
- `GET /api/articles` - Список статей
- `GET /api/articles/:filename` - Чтение статьи
- `POST /api/articles` - Создание статьи
- `PUT /api/articles/:filename` - Обновление статьи
- `DELETE /api/articles/:filename` - Удаление статьи
- `GET /api/stats` - Статистика

### Socket.IO Events

**От клиента:**
- `send_message` - Отправка сообщения ИИ

**Клиенту:**
- `ai_response` - Ответ от ИИ
- `article_saved` - Подтверждение сохранения
- `articles_list` - Список статей
- `error` - Ошибки

## Структура файлов

### Сервер
```
~/ipa-server/
├── databases/           # Статьи .md
├── logs/               # Логи
│   ├── error.log
│   ├── combined.log
│   ├── api.log
│   └── gemini.log
├── config/
├── services/
├── server.js
├── manage.sh           # Управление службой
└── .env               # Конфигурация
```

### Клиент
```
~/ipa-client/
├── config/
├── services/
├── utils/
├── client.js
├── config.json        # Конфигурация
├── launch.sh          # Запуск
├── configure.sh       # Настройка
└── help.sh           # Помощь
```

## Мониторинг

### Сервер
```bash
# Статус службы
~/ipa-server/manage.sh status

# Просмотр логов
~/ipa-server/manage.sh logs

# Проверка API
curl http://localhost:3001/api/health

# Статистика статей
curl http://localhost:3001/api/stats
```

### Клиент
```bash
# Проверка подключения
cd ~/ipa-client
node -e "const c=require('./config.json'); console.log('Server:', c.server.protocol+'://'+c.server.host+':'+c.server.port)"

# Тест API
curl http://SERVER_IP:3001/api/health
```

## Troubleshooting

### Проблемы с сервером

1. **Служба не запускается:**
```bash
~/ipa-server/manage.sh status
sudo journalctl -u ipa-server -f
```

2. **Проблемы с API ключом:**
```bash
nano ~/ipa-server/.env
# Проверьте GEMINI_API_KEY
```

3. **Проблемы с портом:**
```bash
sudo netstat -tlnp | grep :3001
sudo ufw status
```

### Проблемы с клиентом

1. **Не подключается к серверу:**
```bash
~/ipa-client/configure.sh
# Проверьте IP адрес сервера
```

2. **Проблемы с отображением:**
```bash
nano ~/ipa-client/config.json
# Отключите colors: false
```

3. **Проблемы с Node.js:**
```bash
node --version
npm --version
```

## Безопасность

### Рекомендации

1. **Файрвол:**
```bash
sudo ufw enable
sudo ufw allow 3001/tcp
```

2. **HTTPS в продакшене:**
- Настройте nginx как reverse proxy
- Используйте Let's Encrypt для SSL

3. **Мониторинг:**
- Регулярно проверяйте логи
- Настройте алерты при ошибках

4. **Резервное копирование:**
```bash
# Резервная копия статей
tar -czf backup-$(date +%Y%m%d).tar.gz ~/ipa-server/databases/

# Резервная копия логов
tar -czf logs-$(date +%Y%m%d).tar.gz ~/ipa-server/logs/
```

## Разработка

### Добавление новых функций

1. **На сервере:**
- Добавьте новые API endpoints в `server.js`
- Обновите `geminiService.js` для новых действий
- Добавьте логирование

2. **На клиенте:**
- Добавьте новые команды в `client.js`
- Обновите отображение в `display.js`
- Добавьте обработку в `apiService.js`

### Отладка

```bash
# Сервер в режиме разработки
cd ~/ipa-server
npm run dev

# Клиент в режиме разработки
cd ~/ipa-client
npm run dev
```

## Лицензия

MIT License
