import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import * as db from './services/databaseService.js';
import { createChatSession, sendMessage } from './services/geminiService.js';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3002", "http://localhost:5173", "http://127.0.0.1:3002", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Хранилище активных чат-сессий
const chatSessions = new Map();

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

  // Создаем новую чат-сессию для клиента
  try {
    const chatSession = createChatSession();
    chatSessions.set(socket.id, chatSession);
    logger.info('Chat session created for client', { socketId: socket.id });
    
    // Отправляем подтверждение подключения
    socket.emit('connection_established', { 
      message: 'Connected to IPA Server',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating chat session:', error);
    socket.emit('error', { message: 'Failed to create chat session' });
    return;
  }

  // Обработка сообщений от клиента
  socket.on('send_message', async (data) => {
    try {
      const { message, imageFile } = data;
      const chatSession = chatSessions.get(socket.id);
      
      if (!chatSession) {
        socket.emit('error', { message: 'Chat session not found' });
        return;
      }

      logger.info('Processing message from client', { 
        socketId: socket.id, 
        messageLength: message?.length || 0,
        hasImage: !!imageFile 
      });

      // Отправляем сообщение в Gemini и получаем ответ
      const response = await sendMessage(chatSession, message, imageFile);
      
      // Отправляем ответ клиенту
      socket.emit('ai_response', {
        id: Date.now().toString(),
        text: response.responseText || response.text,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        action: response.action,
        filename: response.filename,
        content: response.content
      });

      // Обрабатываем специальные действия
      if (response.action === 'CREATE_ARTICLE' || response.action === 'UPDATE_ARTICLE') {
        if (response.filename && response.content) {
          try {
            await db.saveArticle(response.filename, response.content);
            socket.emit('article_saved', { 
              filename: response.filename, 
              message: 'Article saved successfully',
              timestamp: new Date().toISOString()
            });
            logger.info('Article saved via socket', { filename: response.filename });
          } catch (error) {
            logger.error('Error saving article via socket:', error);
            socket.emit('error', { message: 'Failed to save article' });
          }
        }
      }

      if (response.action === 'LIST_ARTICLES') {
        try {
          const articles = await db.listArticles();
          socket.emit('articles_list', {
            articles,
            timestamp: new Date().toISOString()
          });
          logger.info('Articles list sent via socket', { count: articles.length });
        } catch (error) {
          logger.error('Error listing articles via socket:', error);
          socket.emit('error', { message: 'Failed to list articles' });
        }
      }

    } catch (error) {
      logger.error('Error processing message:', error);
      socket.emit('error', { 
        message: 'Failed to process message',
        details: error.message 
      });
    }
  });

  // Обработка запроса списка статей
  socket.on('get_articles', async () => {
    try {
      const articles = await db.listArticles();
      socket.emit('articles_list', {
        articles,
        timestamp: new Date().toISOString()
      });
      logger.info('Articles list requested via socket', { count: articles.length });
    } catch (error) {
      logger.error('Error listing articles via socket:', error);
      socket.emit('error', { message: 'Failed to list articles' });
    }
  });

  // Обработка запроса статьи
  socket.on('get_article', async (data) => {
    try {
      const { filename } = data;
      const content = await db.getArticle(filename);
      
      if (content === null) {
        socket.emit('error', { message: 'Article not found' });
      } else {
        socket.emit('article_content', {
          filename,
          content,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Error getting article via socket:', error);
      socket.emit('error', { message: 'Failed to get article' });
    }
  });

  // Обработка удаления статьи
  socket.on('delete_article', async (data) => {
    try {
      const { filename } = data;
      const result = await db.deleteArticle(filename);
      socket.emit('article_deleted', {
        filename,
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      });
      logger.info('Article deleted via socket', { filename });
    } catch (error) {
      logger.error('Error deleting article via socket:', error);
      socket.emit('error', { message: 'Failed to delete article' });
    }
  });

  // Обработка отключения клиента
  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
    chatSessions.delete(socket.id);
  });

  // Обработка ошибок
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
server.listen(PORT, HOST, () => {
  logger.info(`IPA Server running on ${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Database directory: ./databases`);
  logger.info(`Logs directory: ./logs`);
  logger.info(`Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
});

// Обработка ошибок при запуске сервера
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please try a different port.`);
  } else {
    logger.error('Server error:', error);
  }
  process.exit(1);
});

export default app;

