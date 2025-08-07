# 🌐 Быстрый запуск IPA Web Client

## 📋 Предварительные требования

- **Node.js 18+** и npm
- **Работающий IPA Server** на порту 3001
- **Современный браузер** (Chrome, Firefox, Safari, Edge)

## 🔧 Установка и настройка

### 1. Переход в папку web-клиента
```bash
cd client-web
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Проверка конфигурации
Файл `vite.config.ts` уже настроен для подключения к серверу:
```typescript
server: {
  port: 3002,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

## 🎯 Запуск web-клиента

### Режим разработки
```bash
npm run dev
```

**Результат:**
- 🌐 Откройте браузер: `http://localhost:3002`
- 🔄 Автоматическая перезагрузка при изменениях
- 📡 Подключение к IPA Server на порту 3001

### Сборка для продакшна
```bash
npm run build
```

### Предварительный просмотр сборки
```bash
npm run preview
```

## ✅ Проверка работы

### 1. Проверка подключения к серверу
- Откройте `http://localhost:3002`
- Проверьте индикатор подключения в интерфейсе
- Должно появиться сообщение: "CONNECTION ESTABLISHED"

### 2. Тестирование функций
- **Отправка сообщений:** Введите текст и нажмите Enter
- **Загрузка изображений:** Нажмите на иконку изображения
- **Управление статьями:** Используйте кнопки внизу интерфейса

### 3. Проверка API через браузер
```javascript
// В консоли браузера (F12)
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log(data));

fetch('/api/articles')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🔍 Отладка

### Проверка консоли браузера
1. Откройте DevTools (F12)
2. Перейдите на вкладку Console
3. Проверьте наличие ошибок

### Проверка сетевых запросов
1. Откройте DevTools (F12)
2. Перейдите на вкладку Network
3. Отправьте сообщение и проверьте запросы

### Проверка WebSocket соединения
```javascript
// В консоли браузера
// Проверка Socket.IO соединения
if (window.socket) {
  console.log('Socket connected:', window.socket.connected);
}
```

## 🛠️ Устранение неполадок

### Проблема: "Failed to connect to server"
**Решение:**
1. Убедитесь, что IPA Server запущен на порту 3001
2. Проверьте файрвол и настройки сети
3. Проверьте конфигурацию в `vite.config.ts`

### Проблема: "Module not found"
**Решение:**
```bash
# Переустановить зависимости
rm -rf node_modules package-lock.json
npm install
```

### Проблема: "Port 3002 is already in use"
**Решение:**
```bash
# Найти процесс
netstat -ano | findstr :3002

# Остановить процесс
taskkill /PID <PID> /F

# Или изменить порт в vite.config.ts
port: 3003
```

### Проблема: "CORS error"
**Решение:**
1. Убедитесь, что сервер настроен для CORS
2. Проверьте настройки proxy в `vite.config.ts`
3. Перезапустите сервер и клиент

## 🔧 Настройка для разных окружений

### Разработка (localhost)
```typescript
// vite.config.ts
server: {
  port: 3002,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

### Продакшн (удаленный сервер)
```typescript
// Измените в src/services/socketService.ts
connect(serverUrl: string = 'http://your-server-ip:3001')
```

### Docker
```dockerfile
# Dockerfile для web-клиента
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "run", "preview"]
```

## 📊 Мониторинг

### Проверка статуса клиента
```bash
# Процессы Node.js
ps aux | grep node

# Использование портов
netstat -ano | findstr :3002

# Логи Vite
# Логи отображаются в терминале при запуске
```

### Тестирование API
```bash
# Проверка здоровья сервера
curl http://localhost:3001/api/health

# Проверка статей
curl http://localhost:3001/api/articles

# Проверка через прокси
curl http://localhost:3002/api/health
```

## 🚀 Продакшн развертывание

### Статическая сборка
```bash
npm run build
```

Файлы будут созданы в папке `dist/`:
- `index.html` - главная страница
- `assets/` - JavaScript, CSS, изображения

### Размещение на веб-сервере
```bash
# Apache
cp -r dist/* /var/www/html/

# Nginx
cp -r dist/* /usr/share/nginx/html/

# Node.js сервер
npx serve dist/
```

### Docker Compose
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
      
  ipa-web-client:
    build: ./client-web
    ports:
      - "3002:3002"
    depends_on:
      - ipa-server
```

## 🔗 Интеграция с другими клиентами

### Console Client
```bash
# Запуск консольного клиента
cd ../client-ubuntu
npm install
node client.js
```

### Мобильное приложение
Web-клиент адаптивен и работает на мобильных устройствах.

## 📝 Полезные команды

```bash
# Очистка кэша
npm run build -- --force

# Проверка зависимостей
npm audit

# Обновление зависимостей
npm update

# Запуск с отладкой
DEBUG=vite:* npm run dev

# Проверка TypeScript
npx tsc --noEmit
```

## 🆘 Получение помощи

- 📖 **Документация:** `README.md`
- 🔧 **Vite документация:** https://vitejs.dev/
- 📋 **Socket.IO документация:** https://socket.io/docs/
- 🐛 **Отладка:** проверьте консоль браузера и терминал

## 🎨 Кастомизация

### Изменение темы
```css
/* src/index.css */
:root {
  --primary-color: #f97316;
  --background-color: #0f0f0f;
  --text-color: #f97316;
}
```

### Изменение конфигурации сервера
```typescript
// src/services/socketService.ts
connect(serverUrl: string = 'http://your-custom-server:3001')
```

### Добавление новых функций
1. Создайте компонент в `src/components/`
2. Добавьте логику в `src/services/`
3. Обновите типы в `src/types.ts`
