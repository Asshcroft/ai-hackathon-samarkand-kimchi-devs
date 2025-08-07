import chalk from 'chalk';
import figlet from 'figlet';
import Table from 'cli-table3';
import { config } from '../config/config.js';

// Отключение цветов если не поддерживаются
if (!config.display.colors) {
  chalk.level = 0;
}

export const display = {
  // Заголовок приложения
  showHeader: () => {
    console.clear();
    console.log(chalk.cyan(figlet.textSync('IPA CLIENT', { font: 'Standard' })));
    console.log(chalk.gray('Integrated Portable Assistant - Console Client\n'));
  },

  // Сообщения
  info: (message) => {
    const timestamp = config.display.timestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    console.log(chalk.blue(`${timestamp}ℹ ${message}`));
  },

  success: (message) => {
    const timestamp = config.display.timestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    console.log(chalk.green(`${timestamp}✓ ${message}`));
  },

  warning: (message) => {
    const timestamp = config.display.timestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    console.log(chalk.yellow(`${timestamp}⚠ ${message}`));
  },

  error: (message) => {
    const timestamp = config.display.timestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    console.log(chalk.red(`${timestamp}✗ ${message}`));
  },

  // AI ответы
  aiResponse: (response) => {
    const timestamp = config.display.timestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    console.log(chalk.cyan(`${timestamp}🤖 AI:`));
    
    if (response.responseText) {
      const text = response.responseText.length > config.display.maxMessageLength 
        ? response.responseText.substring(0, config.display.maxMessageLength) + '...'
        : response.responseText;
      console.log(chalk.white(text));
    }

    if (response.action && response.action !== 'CHAT') {
      console.log(chalk.gray(`Action: ${response.action}`));
    }
  },

  // Сообщения пользователя
  userMessage: (message) => {
    const timestamp = config.display.timestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    console.log(chalk.magenta(`${timestamp}👤 You: ${message}`));
  },

  // Статус подключения
  connectionStatus: (status) => {
    const timestamp = config.display.timestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    switch (status) {
      case 'connected':
        console.log(chalk.green(`${timestamp}🔗 Connected to server`));
        break;
      case 'disconnected':
        console.log(chalk.red(`${timestamp}🔌 Disconnected from server`));
        break;
      case 'connecting':
        console.log(chalk.yellow(`${timestamp}🔄 Connecting to server...`));
        break;
      case 'reconnecting':
        console.log(chalk.yellow(`${timestamp}🔄 Reconnecting...`));
        break;
    }
  },

  // Список статей
  articlesList: (articles) => {
    if (articles.length === 0) {
      console.log(chalk.gray('No articles found'));
      return;
    }

    const table = new Table({
      head: [chalk.cyan('№'), chalk.cyan('Filename'), chalk.cyan('Size')],
      colWidths: [5, 40, 15]
    });

    articles.forEach((article, index) => {
      table.push([
        chalk.white(index + 1),
        chalk.white(article),
        chalk.gray('N/A')
      ]);
    });

    console.log(table.toString());
  },

  // Статистика статей
  articlesStats: (stats) => {
    console.log(chalk.cyan('\n📊 Articles Statistics:'));
    console.log(chalk.white(`Total articles: ${stats.totalArticles}`));
    console.log(chalk.white(`Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`));
    
    if (stats.articles.length > 0) {
      const table = new Table({
        head: [chalk.cyan('Filename'), chalk.cyan('Size'), chalk.cyan('Lines'), chalk.cyan('Modified')],
        colWidths: [30, 10, 8, 20]
      });

      stats.articles.slice(0, 10).forEach(article => {
        table.push([
          chalk.white(article.filename),
          chalk.gray(`${(article.size / 1024).toFixed(1)} KB`),
          chalk.gray(article.lines),
          chalk.gray(article.modified.toLocaleDateString())
        ]);
      });

      console.log(table.toString());
    }
  },

  // Содержимое статьи
  articleContent: (filename, content) => {
    console.log(chalk.cyan(`\n📄 Article: ${filename}`));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white(content));
    console.log(chalk.gray('─'.repeat(50)));
  },

  // Меню команд
  showMenu: () => {
    console.log(chalk.cyan('\n📋 Available Commands:'));
    console.log(chalk.white('  /help     - Show this menu'));
    console.log(chalk.white('  /list     - List all articles'));
    console.log(chalk.white('  /read     - Read an article'));
    console.log(chalk.white('  /stats    - Show articles statistics'));
    console.log(chalk.white('  /config   - Show current configuration'));
    console.log(chalk.white('  /clear    - Clear screen'));
    console.log(chalk.white('  /quit     - Exit client'));
    console.log(chalk.gray('  Type your message to chat with AI\n'));
  },

  // Конфигурация
  showConfig: () => {
    console.log(chalk.cyan('\n⚙️  Current Configuration:'));
    console.log(chalk.white(`Server: ${config.server.protocol}://${config.server.host}:${config.server.port}`));
    console.log(chalk.white(`Client: ${config.client.name} v${config.client.version}`));
    console.log(chalk.white(`Reconnect attempts: ${config.client.reconnectAttempts}`));
    console.log(chalk.white(`Colors: ${config.display.colors ? 'enabled' : 'disabled'}`));
    console.log(chalk.white(`Timestamps: ${config.display.timestamps ? 'enabled' : 'disabled'}`));
  },

  // Разделитель
  separator: () => {
    console.log(chalk.gray('─'.repeat(60)));
  },

  // Очистка экрана
  clear: () => {
    console.clear();
  }
};
