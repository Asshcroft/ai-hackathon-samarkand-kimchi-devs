# Устранение неполадок IPA Server

## Основные проблемы и решения

### 1. Ошибка: "GEMINI_API_KEY environment variable not set"

**Проблема:** Сервер не может найти API ключ Gemini.

**Решение:**
1. Убедитесь, что файл `.env` существует в папке `server-ubuntu/`
2. Откройте файл `.env` и замените `your_gemini_api_key_here` на ваш реальный API ключ Gemini
3. Получите API ключ на https://makersuite.google.com/app/apikey

**Пример правильного .env файла:**
```
NODE_ENV=production
PORT=3001
GEMINI_API_KEY=AIzaSyC...ваш_реальный_ключ
LOG_LEVEL=info
```

### 2. Ошибка: "Port 3001 is already in use"

**Проблема:** Порт 3001 уже занят другим процессом.

**Решение:**
1. Найдите процесс, использующий порт 3001:
   ```bash
   sudo netstat -tulpn | grep :3001
   ```
2. Остановите процесс:
   ```bash
   sudo kill -9 <PID>
   ```
3. Или измените порт в файле `.env`:
   ```
   PORT=3002
   ```

### 3. Ошибка: "Module not found"

**Проблема:** Отсутствуют зависимости.

**Решение:**
1. Установите зависимости:
   ```bash
   npm install
   ```

### 4. Ошибка: "Permission denied"

**Проблема:** Недостаточно прав для создания папок или файлов.

**Решение:**
1. Убедитесь, что у пользователя есть права на запись в текущую директорию:
   ```bash
   sudo chown -R $USER:$USER .
   ```

### 5. Тестирование без Gemini API

Если у вас нет API ключа Gemini, вы можете протестировать базовую функциональность:

```bash
npm run test
```

Этот режим запускает сервер без интеграции с Gemini API, но с полной поддержкой:
- REST API для статей
- Socket.IO соединения
- Логирование
- Управление файлами

### 6. Проверка логов

Логи сохраняются в папке `logs/`:
- `error.log` - ошибки
- `combined.log` - все логи
- `api.log` - API запросы
- `gemini.log` - запросы к Gemini API

### 7. Проверка состояния сервера

```bash
# Проверка здоровья сервера
curl http://localhost:3001/api/health

# Проверка списка статей
curl http://localhost:3001/api/articles

# Проверка статистики
curl http://localhost:3001/api/stats
```

### 8. Перезапуск сервера

```bash
# Остановка сервера
sudo systemctl stop ipa-server

# Запуск сервера
sudo systemctl start ipa-server

# Проверка статуса
sudo systemctl status ipa-server

# Просмотр логов
sudo journalctl -u ipa-server -f
```

### 9. Полная переустановка

Если ничего не помогает:

```bash
# Остановка сервиса
sudo systemctl stop ipa-server

# Удаление старых файлов
sudo rm -rf /opt/ipa-server

# Переустановка
sudo ./install.sh

# Запуск
sudo systemctl start ipa-server
```

## Частые ошибки

### EADDRINUSE
- Порт занят другим процессом
- Решение: см. пункт 2

### EACCES
- Недостаточно прав
- Решение: см. пункт 4

### ENOENT
- Файл или папка не найдены
- Решение: убедитесь, что все файлы на месте

### ECONNREFUSED
- Клиент не может подключиться к серверу
- Решение: проверьте, что сервер запущен и порт доступен
