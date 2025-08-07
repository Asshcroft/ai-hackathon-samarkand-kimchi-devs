# 🚀 Быстрый запуск IPA Server

## 📋 Предварительные требования

- **Node.js 18+** и npm
- **Ubuntu 20.04/22.04/24.04** (или Windows для разработки)
- **Gemini API ключ** (опционально для тестирования)

## 🔧 Установка и настройка

### 1. Переход в папку сервера
```bash
cd server-ubuntu
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
```bash
# Копируем пример конфигурации
cp env.example .env

# Редактируем файл .env
nano .env
```

**Содержимое файла .env:**
```env
NODE_ENV=production
PORT=3001

# Получите API ключ на https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_api_key_here

LOG_LEVEL=info
```

## 🎯 Запуск сервера

### Вариант 1: Запуск с Gemini API (полная функциональность)
```bash
# Убедитесь, что в .env указан правильный API ключ
npm start
```

### Вариант 2: Тестовый запуск без Gemini API
```bash
# Работает без API ключа, только базовая функциональность
npm run test
```

### Вариант 3: Режим разработки
```bash
# Автоматический перезапуск при изменениях
npm run dev
```

## ✅ Проверка работы сервера

### 1. Проверка здоровья сервера
```bash
curl http://localhost:3001/api/health
```

**Ожидаемый ответ:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-07T21:37:03.810Z",
  "uptime": 28.0429617
}
```

### 2. Проверка API статей
```bash
# Список статей
curl http://localhost:3001/api/articles

# Статистика
curl http://localhost:3001/api/stats
```

### 3. Проверка порта
```bash
# Ubuntu/Linux
sudo netstat -tulpn | grep :3001

# Windows
netstat -ano | findstr :3001
```

## 🔍 Логи и отладка

### Просмотр логов
```bash
# Все логи
tail -f logs/combined.log

# Только ошибки
tail -f logs/error.log

# API запросы
tail -f logs/api.log
```

### Проверка папок
```bash
# Проверяем, что папки созданы
ls -la logs/
ls -la databases/
```

## 🛠️ Устранение неполадок

### Проблема: "GEMINI_API_KEY environment variable not set"
**Решение:**
1. Проверьте файл `.env` в папке `server-ubuntu/`
2. Убедитесь, что API ключ указан правильно
3. Для тестирования используйте `npm run test`

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

### Проблема: "Module not found"
**Решение:**
```bash
# Переустановить зависимости
rm -rf node_modules package-lock.json
npm install
```

## 📊 Мониторинг

### Проверка статуса сервера
```bash
# Процессы Node.js
ps aux | grep node

# Использование портов
sudo netstat -tulpn | grep :3001

# Логи в реальном времени
tail -f logs/combined.log
```

### Тестирование API
```bash
# Создание тестовой статьи
curl -X POST http://localhost:3001/api/articles \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.md","content":"# Test Article\n\nThis is a test."}'

# Чтение статьи
curl http://localhost:3001/api/articles/test.md

# Удаление статьи
curl -X DELETE http://localhost:3001/api/articles/test.md
```

## 🚀 Продакшн запуск

### Через systemd (Ubuntu)
```bash
# Установка как системный сервис
sudo ./install.sh

# Управление сервисом
sudo systemctl start ipa-server
sudo systemctl status ipa-server
sudo systemctl stop ipa-server
```

### Через PM2
```bash
# Установка PM2
npm install -g pm2

# Запуск
pm2 start server.js --name "ipa-server"

# Управление
pm2 status
pm2 logs ipa-server
pm2 restart ipa-server
pm2 stop ipa-server
```

## 🔗 Подключение клиентов

### Web Client
```bash
# В другой папке
cd ../client-web
npm install
npm run dev
# Откройте http://localhost:3002
```

### Console Client
```bash
# В другой папке
cd ../client-ubuntu
npm install
node client.js
```

## 📝 Полезные команды

```bash
# Остановка всех процессов на порту 3001
sudo kill -9 $(sudo lsof -t -i:3001)

# Очистка логов
rm -rf logs/*

# Проверка размера папок
du -sh logs/ databases/

# Мониторинг в реальном времени
watch -n 1 'curl -s http://localhost:3001/api/health'
```

## 🆘 Получение помощи

- 📖 **Документация:** `README.md`
- 🔧 **Устранение неполадок:** `TROUBLESHOOTING.md`
- 📋 **Логи:** папка `logs/`
- 🐛 **Отладка:** проверьте консоль сервера
