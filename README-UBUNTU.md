# 🤖 IPA AI Assistant - Серверная архитектура

## 📋 Обзор проекта

IPA AI Assistant теперь использует **серверную архитектуру**, где:

- **IPA Server** - обрабатывает все запросы, работает с Gemini API и управляет статьями
- **IPA Web Client** - только визуальный интерфейс, отправляет сообщения на сервер
- **IPA Console Client** - консольный интерфейс для удаленного доступа

## 🏗️ Архитектура

```
┌─────────────────┐    Socket.IO    ┌─────────────────┐
│   Web Client    │◄──────────────►│  IPA Server     │
│  (Visual UI)    │                 │  (Gemini API)   │
└─────────────────┘                 └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   Gemini API    │
                                    │  (Google AI)    │
                                    └─────────────────┘
```

### 🔄 Поток данных:

1. **Web Client** отправляет сообщение через Socket.IO
2. **IPA Server** получает сообщение и отправляет в Gemini API
3. **Gemini API** обрабатывает запрос и возвращает ответ
4. **IPA Server** получает ответ и отправляет обратно в Web Client
5. **Web Client** отображает ответ в интерфейсе

## 📁 Структура проекта

```
AI/
├── server-ubuntu/          # Серверная часть
│   ├── server.js          # Основной сервер
│   ├── services/          # Сервисы (Gemini, Database)
│   ├── config/            # Конфигурация (логирование)
│   ├── databases/         # Папка для статей (.md файлы)
│   ├── logs/              # Логи сервера
│   └── package.json       # Зависимости сервера
│
├── client-web/            # Web-клиент (только UI)
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── services/      # Socket.IO клиент
│   │   └── types.ts       # TypeScript типы
│   └── package.json       # Зависимости клиента
│
└── client-ubuntu/         # Консольный клиент
    ├── client.js          # Основной клиент
    ├── services/          # Сервисы клиента
    └── package.json       # Зависимости клиента
```

## 🚀 Быстрый запуск

### 1. Запуск сервера
```bash
cd server-ubuntu
npm install
cp env.example .env
# Отредактируйте .env (добавьте Gemini API ключ)
npm run test  # Тестовый режим без API ключа
```

### 2. Запуск web-клиента
```bash
cd client-web
npm install
npm run dev
# Откройте http://localhost:3002
```

### 3. Проверка работы
- Отправьте сообщение в web-клиенте
- Сервер обработает его через Gemini API
- Ответ появится в интерфейсе

## 🔧 Подробные инструкции

### IPA Server (server-ubuntu/)

#### Установка и настройка
```bash
cd server-ubuntu
npm install

# Создаем конфигурацию
cp env.example .env
nano .env
```

**Содержимое .env:**
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0  # Важно для внешних подключений
GEMINI_API_KEY=your_actual_api_key_here
LOG_LEVEL=info
```

#### Запуск сервера
```bash
# Полная функциональность (требует API ключ)
npm start

# Тестовый режим (без API ключа)
npm run test

# Режим разработки
npm run dev
```

#### Проверка работы
```bash
# Проверка здоровья сервера
curl http://localhost:3001/api/health

# Проверка статей
curl http://localhost:3001/api/articles
```

### IPA Web Client (client-web/)

#### Установка
```bash
cd client-web
npm install
```

#### Настройка для внешнего сервера
Если сервер на другом компьютере, измените в `src/services/socketService.ts`:
```typescript
connect(serverUrl: string = 'http://192.168.1.100:3001')
```

#### Запуск
```bash
npm run dev
# Откройте http://localhost:3002
```

### IPA Console Client (client-ubuntu/)

#### Установка
```bash
cd client-ubuntu
npm install
```

#### Настройка
```bash
cp config/config.example.json config.json
nano config/config.json
```

#### Запуск
```bash
node client.js
```

## 🔄 Как работает новая архитектура

### Отправка сообщений
1. Пользователь вводит сообщение в web-клиенте
2. Web-клиент отправляет сообщение через Socket.IO на сервер
3. Сервер получает сообщение и отправляет его в Gemini API
4. Gemini API обрабатывает запрос и возвращает ответ
5. Сервер получает ответ от Gemini и отправляет его обратно в web-клиент
6. Web-клиент отображает ответ в интерфейсе

### Сохранение статей
1. Пользователь просит AI создать статью
2. AI генерирует контент и отправляет его на сервер
3. Сервер автоматически сохраняет статью в папку `databases/`
4. Сервер отправляет подтверждение в web-клиент
5. Web-клиент отображает уведомление о сохранении

### Управление статьями
- **Чтение:** Web-клиент запрашивает список статей → Сервер возвращает список
- **Просмотр:** Web-клиент запрашивает содержимое статьи → Сервер возвращает контент
- **Удаление:** Web-клиент отправляет запрос на удаление → Сервер удаляет файл

## 🌐 Подключение к удаленному серверу

### Настройка сервера
```bash
# В server-ubuntu/.env
HOST=0.0.0.0  # Разрешает внешние подключения
PORT=3001
```

### Настройка web-клиента
```typescript
// В client-web/src/services/socketService.ts
connect(serverUrl: string = 'http://192.168.1.100:3001')
```

### Проверка подключения
```bash
# С клиентского ПК
ping 192.168.1.100
curl http://192.168.1.100:3001/api/health
```

## 🛠️ Устранение неполадок

### Проблема: "Failed to connect to server"
**Решение:**
1. Убедитесь, что сервер запущен: `cd server-ubuntu && npm run test`
2. Проверьте IP адрес сервера в конфигурации клиента
3. Проверьте файрвол: `sudo ufw allow 3001`

### Проблема: "GEMINI_API_KEY not set"
**Решение:**
1. Добавьте API ключ в `server-ubuntu/.env`
2. Или используйте тестовый режим: `npm run test`

### Проблема: "CORS error"
**Решение:**
1. Проверьте настройки CORS в `server-ubuntu/server.js`
2. Убедитесь, что клиент подключается к правильному адресу

## 📊 Мониторинг

### Логи сервера
```bash
# Все логи
tail -f server-ubuntu/logs/combined.log

# Только ошибки
tail -f server-ubuntu/logs/error.log

# API запросы
tail -f server-ubuntu/logs/api.log
```

### Статус процессов
```bash
# Процессы Node.js
ps aux | grep node

# Использование портов
sudo netstat -tulpn | grep :3001
```

## 🚀 Продакшн развертывание

### Ubuntu Server
```bash
cd server-ubuntu
sudo ./install.sh
sudo systemctl start ipa-server
sudo systemctl enable ipa-server
```

### Docker
```yaml
# docker-compose.yml
version: '3.8'
services:
  ipa-server:
    build: ./server-ubuntu
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      
  ipa-web-client:
    build: ./client-web
    ports:
      - "3002:3002"
    depends_on:
      - ipa-server
```

## 📝 Полезные команды

### Остановка всех компонентов
```bash
# Остановка сервера
pkill -f "node.*server"

# Остановка web-клиента
pkill -f "vite"

# Остановка консольного клиента
pkill -f "node.*client"
```

### Перезапуск
```bash
# Перезапуск сервера
cd server-ubuntu && npm run test

# Перезапуск web-клиента
cd client-web && npm run dev
```

## 🔗 Полезные ссылки

- 📖 **Документация сервера:** `server-ubuntu/README.md`
- 📖 **Документация web-клиента:** `client-web/README.md`
- 📖 **Документация консольного клиента:** `client-ubuntu/README.md`
- 🔧 **Устранение неполадок:** `server-ubuntu/TROUBLESHOOTING.md`
- 🚀 **Быстрый старт сервера:** `server-ubuntu/QUICK_START.md`
- 🌐 **Быстрый старт web-клиента:** `client-web/QUICK_START.md`

## 🆘 Получение помощи

### Логи
- **Сервер:** `server-ubuntu/logs/`
- **Web-клиент:** консоль браузера (F12)
- **Консольный клиент:** терминал

### Отладка
1. Проверьте логи сервера
2. Проверьте консоль браузера
3. Проверьте статус процессов
4. Проверьте сетевые подключения

### Частые проблемы
- **Сервер не запускается:** проверьте `.env` файл
- **Клиент не подключается:** проверьте IP адрес и порт
- **API не отвечает:** проверьте Gemini API ключ
- **CORS ошибки:** проверьте настройки сервера

