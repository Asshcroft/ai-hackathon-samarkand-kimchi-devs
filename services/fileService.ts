const API_BASE_URL = 'http://localhost:3001/api';

export const saveArticleToFile = async (filename: string, content: string): Promise<void> => {
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

    console.log(`Article saved to file: ${filename}`);
  } catch (error) {
    console.error("Error saving article to file:", error);
    throw new Error(`Failed to save article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getArticleFromFile = async (filename: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${encodeURIComponent(filename)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to read article');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error reading article from file:", error);
    return null;
  }
};

export const updateArticleInFile = async (filename: string, content: string): Promise<void> => {
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

    console.log(`Article updated in file: ${filename}`);
  } catch (error) {
    console.error("Error updating article in file:", error);
    throw new Error(`Failed to update article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteArticleFromFile = async (filename: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete article');
    }

    console.log(`Article deleted from file: ${filename}`);
  } catch (error) {
    console.error("Error deleting article from file:", error);
    throw new Error(`Failed to delete article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const listArticlesFromFiles = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to list articles');
    }

    const articles = await response.json();
    return articles;
  } catch (error) {
    console.error("Error listing articles from files:", error);
    return [];
  }
};
