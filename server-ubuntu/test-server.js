import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import * as db from './services/databaseService.js';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Статьи API
app.get('/api/articles', async (req, res) => {
  try {
    logger.info('API: Listing articles requested');
    const articles = await db.listArticles();
    res.json(articles);
  } catch (error) {
    logger.error('API: Error listing articles:', error);
    res.status(500).json({ error: 'Failed to list articles' });
  }
});

app.get('/api/articles/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    logger.info('API: Reading article requested', { filename });
    const content = await db.getArticle(filename);
    
    if (content === null) {
      res.status(404).json({ error: 'Article not found' });
    } else {
      res.json({ content });
    }
  } catch (error) {
    logger.error('API: Error reading article:', error);
    res.status(500).json({ error: 'Failed to read article' });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content are required' });
    }

    logger.info('API: Creating article requested', { filename });
    const result = await db.saveArticle(filename, content);
    res.json(result);
  } catch (error) {
    logger.error('API: Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

app.put('/api/articles/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    logger.info('API: Updating article requested', { filename });
    const result = await db.updateArticle(filename, content);
    res.json(result);
  } catch (error) {
    logger.error('API: Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

app.delete('/api/articles/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    logger.info('API: Deleting article requested', { filename });
    const result = await db.deleteArticle(filename);
    res.json(result);
  } catch (error) {
    logger.error('API: Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    logger.info('API: Stats requested');
    const stats = await db.getArticleStats();
    res.json(stats);
  } catch (error) {
    logger.error('API: Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Socket.IO обработчики
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  // Простой эхо-сервер для тестирования
  socket.on('send_message', async (data) => {
    try {
      const { message } = data;
      logger.info('Processing message from client', { 
        socketId: socket.id, 
        messageLength: message?.length || 0
      });

      // Простой ответ без Gemini API
      const response = {
        action: 'CHAT',
        responseText: `Echo: ${message}\n\nThis is a test server without Gemini API integration.`
      };
      
      socket.emit('ai_response', response);

    } catch (error) {
      logger.error('Error processing message:', error);
      socket.emit('error', { 
        message: 'Failed to process message',
        details: error.message 
      });
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });

  socket.on('error', (error) => {
    logger.error('Socket error:', error);
  });
});

// Обработка ошибок сервера
server.on('error', (error) => {
  logger.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Запуск сервера
server.listen(PORT, () => {
  logger.info(`IPA Test Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Database directory: ./databases`);
  logger.info(`Logs directory: ./logs`);
  logger.info('This is a TEST SERVER without Gemini API integration');
});

export default app;
