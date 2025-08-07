const API_BASE_URL = '/api';

export interface ArticleStats {
  totalArticles: number;
  totalSize: number;
  lastModified?: Date;
}

class ApiService {
  async getArticles(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  async getArticle(filename: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${encodeURIComponent(filename)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Article not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  }

  async saveArticle(filename: string, content: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, content }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    }
  }

  async updateArticle(filename: string, content: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${encodeURIComponent(filename)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update article');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  async deleteArticle(filename: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  async getStats(): Promise<ArticleStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
