import * as fileService from './fileService';

const DB_PREFIX = 'ipa_database_';

// Legacy localStorage functions (kept for backward compatibility)
export const saveArticle = (filename: string, content: string): void => {
  try {
    localStorage.setItem(`${DB_PREFIX}${filename}`, content);
  } catch (error) {
    console.error("Error saving to localStorage", error);
  }
};

export const getArticle = (filename: string): string | null => {
  try {
    return localStorage.getItem(`${DB_PREFIX}${filename}`);
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return null;
  }
};

export const updateArticle = (filename: string, content: string): void => {
  // Overwriting is the same as saving
  saveArticle(filename, content);
};

export const deleteArticle = (filename: string): void => {
  try {
    localStorage.removeItem(`${DB_PREFIX}${filename}`);
  } catch (error) {
    console.error("Error deleting from localStorage", error);
  }
};

export const listArticles = (): string[] => {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DB_PREFIX)) {
        keys.push(key.substring(DB_PREFIX.length));
      }
    }
  } catch (error) {
     console.error("Error listing from localStorage", error);
  }
  return keys.sort();
};

// New file-based functions
export const saveArticleToFile = async (filename: string, content: string): Promise<void> => {
  await fileService.saveArticleToFile(filename, content);
};

export const getArticleFromFile = async (filename: string): Promise<string | null> => {
  return await fileService.getArticleFromFile(filename);
};

export const updateArticleInFile = async (filename: string, content: string): Promise<void> => {
  await fileService.updateArticleInFile(filename, content);
};

export const deleteArticleFromFile = async (filename: string): Promise<void> => {
  await fileService.deleteArticleFromFile(filename);
};

export const listArticlesFromFiles = async (): Promise<string[]> => {
  return await fileService.listArticlesFromFiles();
};

// Combined functions that work with both localStorage and files
export const saveArticleCombined = async (filename: string, content: string): Promise<void> => {
  // Save to both localStorage and file
  saveArticle(filename, content);
  await saveArticleToFile(filename, content);
};

export const getArticleCombined = async (filename: string): Promise<string | null> => {
  // Try file first, then localStorage
  const fileContent = await getArticleFromFile(filename);
  if (fileContent !== null) {
    return fileContent;
  }
  return getArticle(filename);
};

export const listArticlesCombined = async (): Promise<string[]> => {
  // Get articles from both sources
  const fileArticles = await listArticlesFromFiles();
  const localStorageArticles = listArticles();
  
  // Combine and remove duplicates
  const allArticles = new Set([...fileArticles, ...localStorageArticles]);
  return Array.from(allArticles).sort();
};
