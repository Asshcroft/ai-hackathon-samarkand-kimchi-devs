#!/usr/bin/env node

import { io } from 'socket.io-client';
import readline from 'readline';
import inquirer from 'inquirer';
import ora from 'ora';
import { display } from './utils/display.js';
import { config, saveConfig } from './config/config.js';
import apiService from './services/apiService.js';

class IPAClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.client.reconnectAttempts;
    this.reconnectDelay = config.client.reconnectDelay;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });
  }

  // Инициализация клиента
  async init() {
    display.showHeader();
    display.info('Initializing IPA Console Client...');

    // Проверяем подключение к серверу
    const spinner = ora('Checking server connection...').start();
    try {
      await apiService.healthCheck();
      spinner.succeed('Server is reachable');
      display.success('Server connection established');
    } catch (error) {
      spinner.fail('Server connection failed');
      display.error(error.message);
      display.warning('Make sure the server is running and accessible');
      process.exit(1);
    }

    // Подключаемся к Socket.IO
    this.connectSocket();
    
    // Показываем меню
    display.showMenu();
    
    // Запускаем интерактивный режим
    this.startInteractiveMode();
  }

  // Подключение к Socket.IO
  connectSocket() {
    const serverUrl = `${config.server.protocol}://${config.server.host}:${config.server.port}`;
    
    this.socket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      display.connectionStatus('connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      display.connectionStatus('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      display.error(`Connection error: ${error.message}`);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.reconnectAttempts = attemptNumber;
      display.connectionStatus('reconnecting');
    });

    this.socket.on('reconnect_failed', () => {
      display.error('Failed to reconnect to server');
      display.warning('You can still use REST API commands');
    });

    // Обработка AI ответов
    this.socket.on('ai_response', (response) => {
      display.aiResponse(response);
    });

    // Обработка сохранения статей
    this.socket.on('article_saved', (data) => {
      display.success(`Article saved: ${data.filename}`);
    });

    // Обработка списка статей
    this.socket.on('articles_list', (articles) => {
      display.info('Articles from server:');
      display.articlesList(articles);
    });

    // Обработка ошибок
    this.socket.on('error', (error) => {
      display.error(`Server error: ${error.message}`);
    });
  }

  // Интерактивный режим
  startInteractiveMode() {
    this.rl.prompt();

    this.rl.on('line', async (input) => {
      const command = input.trim();
      
      if (command === '') {
        this.rl.prompt();
        return;
      }

      // Обработка команд
      if (command.startsWith('/')) {
        await this.handleCommand(command);
      } else {
        // Отправка сообщения ИИ
        await this.sendMessage(command);
      }

      this.rl.prompt();
    });

    this.rl.on('close', () => {
      display.info('Goodbye!');
      process.exit(0);
    });
  }

  // Обработка команд
  async handleCommand(command) {
    const [cmd, ...args] = command.split(' ');

    switch (cmd.toLowerCase()) {
      case '/help':
        display.showMenu();
        break;

      case '/list':
        await this.listArticles();
        break;

      case '/read':
        await this.readArticle(args[0]);
        break;

      case '/stats':
        await this.showStats();
        break;

      case '/config':
        display.showConfig();
        break;

      case '/clear':
        display.clear();
        display.showHeader();
        display.showMenu();
        break;

      case '/quit':
      case '/exit':
        this.rl.close();
        break;

      default:
        display.error(`Unknown command: ${cmd}`);
        display.info('Type /help for available commands');
    }
  }

  // Отправка сообщения ИИ
  async sendMessage(message) {
    if (!this.isConnected) {
      display.error('Not connected to server. Using REST API...');
      // Здесь можно добавить fallback на REST API
      return;
    }

    display.userMessage(message);
    this.socket.emit('send_message', { message });
  }

  // Список статей
  async listArticles() {
    const spinner = ora('Loading articles...').start();
    try {
      const articles = await apiService.getArticles();
      spinner.succeed('Articles loaded');
      display.articlesList(articles);
    } catch (error) {
      spinner.fail('Failed to load articles');
      display.error(error.message);
    }
  }

  // Чтение статьи
  async readArticle(filename) {
    if (!filename) {
      try {
        const articles = await apiService.getArticles();
        if (articles.length === 0) {
          display.warning('No articles available');
          return;
        }

        const { selectedArticle } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedArticle',
            message: 'Select an article to read:',
            choices: articles
          }
        ]);
        filename = selectedArticle;
      } catch (error) {
        display.error('Failed to get articles list');
        return;
      }
    }

    const spinner = ora(`Loading article: ${filename}`).start();
    try {
      const content = await apiService.getArticle(filename);
      spinner.succeed('Article loaded');
      
      if (content === null) {
        display.error(`Article not found: ${filename}`);
      } else {
        display.articleContent(filename, content);
      }
    } catch (error) {
      spinner.fail('Failed to load article');
      display.error(error.message);
    }
  }

  // Показать статистику
  async showStats() {
    const spinner = ora('Loading statistics...').start();
    try {
      const stats = await apiService.getStats();
      spinner.succeed('Statistics loaded');
      display.articlesStats(stats);
    } catch (error) {
      spinner.fail('Failed to load statistics');
      display.error(error.message);
    }
  }

  // Очистка ресурсов
  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.rl) {
      this.rl.close();
    }
  }
}

// Обработка сигналов завершения
process.on('SIGINT', () => {
  display.info('\nReceived SIGINT. Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  display.info('\nReceived SIGTERM. Shutting down...');
  process.exit(0);
});

// Запуск клиента
const client = new IPAClient();

client.init().catch((error) => {
  display.error(`Failed to initialize client: ${error.message}`);
  process.exit(1);
});

// Очистка при завершении
process.on('exit', () => {
  client.cleanup();
});

