# 🚀 Руководство по запуску IPA AI Assistant

## 📋 Обзор проекта

IPA AI Assistant использует **серверную архитектуру**:

- **IPA Server** - обрабатывает запросы, работает с Gemini API, управляет статьями
- **IPA Web Client** - только визуальный интерфейс, отправляет сообщения на сервер
- **IPA Console Client** - консольный интерфейс для удаленного доступа

## 🎯 Быстрый старт

### Шаг 1: Запуск сервера
```bash
# Переходим в папку сервера
cd server-ubuntu

# Устанавливаем зависимости
npm install

# Создаем файл конфигурации
cp env.example .env

# Редактируем .env (добавьте ваш Gemini API ключ)
nano .env

# Запускаем сервер (тестовый режим без API ключа)
npm run test
```

### Шаг 2: Запуск web-клиента
```bash
# В новом терминале, переходим в папку web-клиента
cd client-web

# Устанавливаем зависимости
npm install

# Запускаем web-клиент
npm run dev
```

### Шаг 3: Проверка работы
1. Откройте браузер: `http://localhost:3002`
2. Проверьте подключение к серверу
3. Отправьте тестовое сообщение

## 🔧 Подробные инструкции

### IPA Server (server-ubuntu/)

#### Установка
```bash
cd server-ubuntu
npm install
```

#### Настройка
```bash
# Копируем конфигурацию
cp env.example .env

# Редактируем .env
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

#### Запуск
```bash
# Полная функциональность (требует API ключ)
npm start

# Тестовый режим (без API ключа)
npm run test

# Режим разработки
npm run dev
```

#### Проверка
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
# Режим разработки
npm run dev

# Сборка для продакшна
npm run build

# Предварительный просмотр
npm run preview
```

#### Проверка
- Откройте `http://localhost:3002`
- Проверьте индикатор подключения
- Отправьте тестовое сообщение

### IPA Console Client (client-ubuntu/)

#### Установка
```bash
cd client-ubuntu
npm install
```

#### Настройка
```bash
# Создаем конфигурацию
cp config/config.example.json config.json

# Редактируем конфигурацию
nano config/config.json
```

#### Запуск
```bash
node client.js
```

## 🔄 Как работает архитектура

### Отправка сообщений
1. **Web Client** отправляет сообщение через Socket.IO
2. **IPA Server** получает сообщение и отправляет в Gemini API
3. **Gemini API** обрабатывает запрос и возвращает ответ
4. **IPA Server** получает ответ и отправляет обратно в Web Client
5. **Web Client** отображает ответ в интерфейсе

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

### Проблема: "GEMINI_API_KEY environment variable not set"
**Решение:**
1. Проверьте файл `.env` в папке `server-ubuntu/`
2. Добавьте ваш API ключ Gemini
3. Или используйте тестовый режим: `npm run test`

### Проблема: "Port 3001 is already in use"
**Решение:**
```bash
# Найти процесс
sudo netstat -tulpn | grep :3001

# Остановить процесс
sudo kill -9 <PID>

# Или изменить порт в .env
PORT=3002
```

### Проблема: "Failed to connect to server"
**Решение:**
1. Убедитесь, что сервер запущен на порту 3001
2. Проверьте файрвол
3. Проверьте конфигурацию в `client-web/src/services/socketService.ts`

### Проблема: "Module not found"
**Решение:**
```bash
# Переустановить зависимости
rm -rf node_modules package-lock.json
npm install
```

## 📊 Мониторинг

### Проверка процессов
```bash
# Процессы Node.js
ps aux | grep node

# Использование портов
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :3002
```

### Проверка логов
```bash
# Логи сервера
tail -f server-ubuntu/logs/combined.log

# Логи ошибок
tail -f server-ubuntu/logs/error.log
```

### Тестирование API
```bash
# Здоровье сервера
curl http://localhost:3001/api/health

# Список статей
curl http://localhost:3001/api/articles

# Статистика
curl http://localhost:3001/api/stats
```

## 🚀 Продакшн развертывание

### Ubuntu Server
```bash
# Установка как системный сервис
cd server-ubuntu
sudo ./install.sh

# Управление сервисом
sudo systemctl start ipa-server
sudo systemctl status ipa-server
sudo systemctl stop ipa-server
```

### Docker
```bash
# Создаем docker-compose.yml
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

# Запуск
docker-compose up -d
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

### Очистка
```bash
# Очистка логов
rm -rf server-ubuntu/logs/*

# Очистка статей
rm -rf server-ubuntu/databases/*

# Очистка кэша
rm -rf client-web/node_modules/.vite
```

### Перезапуск
```bash
# Перезапуск сервера
cd server-ubuntu
npm run test

# Перезапуск web-клиента
cd client-web
npm run dev
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
3. Проверьте терминал клиентов
4. Проверьте статус процессов

### Частые проблемы
- **Сервер не запускается:** проверьте `.env` файл
- **Клиент не подключается:** проверьте порт 3001
- **API не отвечает:** проверьте логи сервера
- **CORS ошибки:** проверьте настройки прокси
