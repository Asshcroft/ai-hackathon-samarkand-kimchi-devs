# IPA Server (Ubuntu)

Серверная часть IPA (Integrated Portable Assistant) для Ubuntu с поддержкой Socket.IO и логирования.

## Возможности

- **AI Assistant**: Интеграция с Google Gemini API
- **Article Management**: Создание, чтение, обновление и удаление статей в формате .md
- **Real-time Communication**: Socket.IO для постоянного соединения с клиентами
- **Logging**: Полная система логирования с ротацией файлов
- **REST API**: HTTP API для управления статьями
- **File Storage**: Хранение статей в папке `./databases`
- **Health Monitoring**: Мониторинг состояния сервера

## Установка

### Требования

- Ubuntu 20.04 или новее
- Node.js 18+ 
- npm или yarn

### Установка зависимостей

```bash
# Клонирование репозитория
git clone <repository-url>
cd server-ubuntu

# Установка зависимостей
npm install
```

### Настройка

1. Скопируйте файл конфигурации:
```bash
cp env.example .env
```

2. Отредактируйте `.env` файл:
```bash
nano .env
```

Добавьте ваш API ключ Gemini:
```
GEMINI_API_KEY=your_actual_api_key_here
```

## Запуск

### Режим разработки
```bash
npm run dev
```

### Продакшн режим
```bash
npm start
```

### Запуск как служба (systemd)

1. Создайте файл службы:
```bash
sudo nano /etc/systemd/system/ipa-server.service
```

2. Добавьте содержимое:
```ini
[Unit]
Description=IPA Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/server-ubuntu
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. Запустите службу:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ipa-server
sudo systemctl start ipa-server
```

## API Endpoints

### REST API

- `GET /api/health` - Проверка состояния сервера
- `GET /api/articles` - Список всех статей
- `GET /api/articles/:filename` - Чтение статьи
- `POST /api/articles` - Создание новой статьи
- `PUT /api/articles/:filename` - Обновление статьи
- `DELETE /api/articles/:filename` - Удаление статьи
- `GET /api/stats` - Статистика статей

### Socket.IO Events

**От клиента:**
- `send_message` - Отправка сообщения ИИ

**Клиенту:**
- `ai_response` - Ответ от ИИ
- `article_saved` - Подтверждение сохранения статьи
- `articles_list` - Список статей
- `error` - Ошибки

## Структура проекта

```
server-ubuntu/
├── config/
│   └── logger.js          # Система логирования
├── services/
│   ├── geminiService.js   # Интеграция с Gemini API
│   └── databaseService.js # Управление статьями
├── databases/             # Папка со статьями .md
├── logs/                  # Папка с логами
├── server.js             # Основной серверный файл
├── package.json          # Зависимости
└── README.md            # Документация
```

## Логирование

Логи сохраняются в папке `./logs/`:

- `error.log` - Только ошибки
- `combined.log` - Все логи
- `api.log` - API запросы
- `gemini.log` - Запросы к Gemini API

Ротация логов: максимальный размер файла 5MB, максимум 5 файлов.

## Мониторинг

### Проверка состояния
```bash
curl http://localhost:3001/api/health
```

### Просмотр логов
```bash
# Все логи
tail -f logs/combined.log

# Только ошибки
tail -f logs/error.log

# API запросы
tail -f logs/api.log
```

### Статистика статей
```bash
curl http://localhost:3001/api/stats
```

## Безопасность

- Используйте HTTPS в продакшене
- Настройте файрвол для ограничения доступа
- Регулярно обновляйте зависимости
- Мониторьте логи на предмет подозрительной активности

## Troubleshooting

### Проблемы с подключением
1. Проверьте, что порт 3001 не занят
2. Убедитесь, что файрвол разрешает подключения
3. Проверьте логи: `tail -f logs/error.log`

### Проблемы с Gemini API
1. Проверьте правильность API ключа
2. Убедитесь, что у вас есть доступ к Gemini API
3. Проверьте лимиты API

### Проблемы с файловой системой
1. Убедитесь, что у процесса есть права на запись в папки `./databases` и `./logs`
2. Проверьте свободное место на диске
3. Проверьте права доступа к файлам

