import winston from 'winston';
import fs from 'fs-extra';
import path from 'path';

// Создаем папку для логов если её нет
const logsDir = './logs';
fs.ensureDirSync(logsDir);

// Формат логов
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Создаем логгер
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'ipa-server' },
  transports: [
    // Логи ошибок
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Все логи
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Логи API запросов
    new winston.transports.File({ 
      filename: path.join(logsDir, 'api.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Логи Gemini API
    new winston.transports.File({ 
      filename: path.join(logsDir, 'gemini.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Добавляем консольный вывод в режиме разработки
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
