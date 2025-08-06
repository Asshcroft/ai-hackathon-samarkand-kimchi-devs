const DB_PREFIX = 'ipa_database_';

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
