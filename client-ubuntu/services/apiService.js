import fetch from 'node-fetch';
import { getServerUrl } from '../config/config.js';

class ApiService {
  constructor() {
    this.baseUrl = getServerUrl();
  }

  // Проверка здоровья сервера
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // Получение списка статей
  async getArticles() {
    try {
      const response = await fetch(`${this.baseUrl}/api/articles`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      throw new Error(`Failed to get articles: ${error.message}`);
    }
  }

  // Чтение статьи
  async getArticle(filename) {
    try {
      const response = await fetch(`${this.baseUrl}/api/articles/${encodeURIComponent(filename)}`);
      if (response.ok) {
        const data = await response.json();
        return data.content;
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      throw new Error(`Failed to get article: ${error.message}`);
    }
  }

  // Создание статьи
  async createArticle(filename, content) {
    try {
      const response = await fetch(`${this.baseUrl}/api/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, content }),
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      throw new Error(`Failed to create article: ${error.message}`);
    }
  }

  // Обновление статьи
  async updateArticle(filename, content) {
    try {
      const response = await fetch(`${this.baseUrl}/api/articles/${encodeURIComponent(filename)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      throw new Error(`Failed to update article: ${error.message}`);
    }
  }

  // Удаление статьи
  async deleteArticle(filename) {
    try {
      const response = await fetch(`${this.baseUrl}/api/articles/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      throw new Error(`Failed to delete article: ${error.message}`);
    }
  }

  // Получение статистики
  async getStats() {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

export default new ApiService();

