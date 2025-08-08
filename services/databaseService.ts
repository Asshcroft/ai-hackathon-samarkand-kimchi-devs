// Database service for managing articles in .md files
const DATABASE_FOLDER = 'database';

// Utility function to ensure filename has .md extension
const ensureMarkdownExtension = (filename: string): string => {
  if (!filename.endsWith('.md')) {
    return `${filename}.md`;
  }
  return filename;
};

// Utility function to generate filename from title
export const generateFilename = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50) // Limit length
    + '.md';
};

// Save article to file system
export const saveArticle = async (filename: string, content: string): Promise<boolean> => {
  try {
    const fullFilename = ensureMarkdownExtension(filename);
    const filePath = `${DATABASE_FOLDER}/${fullFilename}`;
    
    // Create a downloadable file
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fullFilename;
    
    // For browser environment, we'll use localStorage as backup
    // and provide download functionality
    const storageKey = `ipa_db_${fullFilename}`;
    localStorage.setItem(storageKey, content);
    
    // Also trigger download
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`Article saved: ${fullFilename}`);
    return true;
  } catch (error) {
    console.error("Error saving article", error);
    return false;
  }
};

// Get article from localStorage (browser environment)
export const getArticle = (filename: string): string | null => {
  try {
    const fullFilename = ensureMarkdownExtension(filename);
    const storageKey = `ipa_db_${fullFilename}`;
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.error("Error reading article", error);
    return null;
  }
};

// Update article
export const updateArticle = async (filename: string, content: string): Promise<boolean> => {
  return await saveArticle(filename, content);
};

// Delete article
export const deleteArticle = (filename: string): boolean => {
  try {
    const fullFilename = ensureMarkdownExtension(filename);
    const storageKey = `ipa_db_${fullFilename}`;
    localStorage.removeItem(storageKey);
    console.log(`Article deleted: ${fullFilename}`);
    return true;
  } catch (error) {
    console.error("Error deleting article", error);
    return false;
  }
};

// List all articles
export const listArticles = (): string[] => {
  const articles: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ipa_db_')) {
        const filename = key.substring(7); // Remove 'ipa_db_' prefix
        articles.push(filename);
      }
    }
  } catch (error) {
    console.error("Error listing articles", error);
  }
  return articles.sort();
};

// Load article from uploaded file
export const loadArticleFromFile = (file: File): Promise<{ filename: string; content: string }> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.md')) {
      reject(new Error('Only .md files are supported'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        filename: file.name,
        content: content
      });
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

// Search articles by content
export const searchArticles = (query: string): { filename: string; content: string; matches: number }[] => {
  const results: { filename: string; content: string; matches: number }[] = [];
  const articles = listArticles();
  const searchTerm = query.toLowerCase();

  articles.forEach(filename => {
    const content = getArticle(filename);
    if (content) {
      const contentLower = content.toLowerCase();
      const matches = (contentLower.match(new RegExp(searchTerm, 'g')) || []).length;
      if (matches > 0) {
        results.push({ filename, content, matches });
      }
    }
  });

  return results.sort((a, b) => b.matches - a.matches);
};

// Export all articles as JSON
export const exportAllArticles = (): void => {
  try {
    const articles = listArticles();
    const exportData: { [key: string]: string } = {};

    articles.forEach(filename => {
      const content = getArticle(filename);
      if (content) {
        exportData[filename] = content;
      }
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'articles_export.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting articles", error);
  }
};
