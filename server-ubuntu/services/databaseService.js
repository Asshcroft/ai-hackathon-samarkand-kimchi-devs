import fs from 'fs-extra';
import path from 'path';
import logger from '../config/logger.js';

const DATABASE_DIR = './databases';

// Обеспечиваем существование папки базы данных
const ensureDatabaseDir = async () => {
  try {
    await fs.ensureDir(DATABASE_DIR);
    logger.info('Database directory ensured');
  } catch (error) {
    logger.error('Error ensuring database directory:', error);
    throw error;
  }
};

export const saveArticle = async (filename, content) => {
  try {
    await ensureDatabaseDir();
    
    // Обеспечиваем расширение .md
    const filePath = path.join(DATABASE_DIR, filename.endsWith('.md') ? filename : `${filename}.md`);
    
    await fs.writeFile(filePath, content, 'utf-8');
    logger.info('Article saved successfully', { filename, filePath });
    return { success: true, filePath };
  } catch (error) {
    logger.error('Error saving article:', error);
    throw new Error(`Failed to save article: ${error.message}`);
  }
};

export const getArticle = async (filename) => {
  try {
    await ensureDatabaseDir();
    
    const filePath = path.join(DATABASE_DIR, filename.endsWith('.md') ? filename : `${filename}.md`);
    
    if (!await fs.pathExists(filePath)) {
      logger.warn('Article not found', { filename, filePath });
      return null;
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    logger.info('Article retrieved successfully', { filename });
    return content;
  } catch (error) {
    logger.error('Error reading article:', error);
    return null;
  }
};

export const updateArticle = async (filename, content) => {
  try {
    await ensureDatabaseDir();
    
    const filePath = path.join(DATABASE_DIR, filename.endsWith('.md') ? filename : `${filename}.md`);
    
    await fs.writeFile(filePath, content, 'utf-8');
    logger.info('Article updated successfully', { filename, filePath });
    return { success: true, filePath };
  } catch (error) {
    logger.error('Error updating article:', error);
    throw new Error(`Failed to update article: ${error.message}`);
  }
};

export const deleteArticle = async (filename) => {
  try {
    await ensureDatabaseDir();
    
    const filePath = path.join(DATABASE_DIR, filename.endsWith('.md') ? filename : `${filename}.md`);
    
    if (!await fs.pathExists(filePath)) {
      logger.warn('Article not found for deletion', { filename, filePath });
      return { success: false, error: 'Article not found' };
    }
    
    await fs.remove(filePath);
    logger.info('Article deleted successfully', { filename, filePath });
    return { success: true };
  } catch (error) {
    logger.error('Error deleting article:', error);
    throw new Error(`Failed to delete article: ${error.message}`);
  }
};

export const listArticles = async () => {
  try {
    await ensureDatabaseDir();
    
    const files = await fs.readdir(DATABASE_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    const sortedFiles = mdFiles.sort();
    
    logger.info('Articles listed successfully', { count: sortedFiles.length });
    return sortedFiles;
  } catch (error) {
    logger.error('Error listing articles:', error);
    return [];
  }
};

export const getArticleStats = async () => {
  try {
    await ensureDatabaseDir();
    
    const files = await fs.readdir(DATABASE_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    let totalSize = 0;
    const articles = [];
    
    for (const file of mdFiles) {
      const filePath = path.join(DATABASE_DIR, file);
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      
      articles.push({
        filename: file,
        size: stats.size,
        lines: content.split('\n').length,
        created: stats.birthtime,
        modified: stats.mtime
      });
      
      totalSize += stats.size;
    }
    
    return {
      totalArticles: mdFiles.length,
      totalSize,
      articles: articles.sort((a, b) => b.modified - a.modified)
    };
  } catch (error) {
    logger.error('Error getting article stats:', error);
    return { totalArticles: 0, totalSize: 0, articles: [] };
  }
};

