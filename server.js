const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

const DATABASE_DIR = './database';

// Ensure database directory exists
const ensureDatabaseDir = async () => {
  try {
    await fs.access(DATABASE_DIR);
  } catch (error) {
    await fs.mkdir(DATABASE_DIR, { recursive: true });
  }
};

// API Routes
app.get('/api/articles', async (req, res) => {
  try {
    await ensureDatabaseDir();
    const files = await fs.readdir(DATABASE_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    res.json(mdFiles.sort());
  } catch (error) {
    console.error('Error listing articles:', error);
    res.status(500).json({ error: 'Failed to list articles' });
  }
});

app.get('/api/articles/:filename', async (req, res) => {
  try {
    await ensureDatabaseDir();
    const filename = req.params.filename.endsWith('.md') ? req.params.filename : `${req.params.filename}.md`;
    const filePath = path.join(DATABASE_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (error) {
    console.error('Error reading article:', error);
    res.status(404).json({ error: 'Article not found' });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content are required' });
    }

    await ensureDatabaseDir();
    const filePath = path.join(DATABASE_DIR, filename.endsWith('.md') ? filename : `${filename}.md`);
    await fs.writeFile(filePath, content, 'utf-8');
    res.json({ message: 'Article saved successfully' });
  } catch (error) {
    console.error('Error saving article:', error);
    res.status(500).json({ error: 'Failed to save article' });
  }
});

app.put('/api/articles/:filename', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    await ensureDatabaseDir();
    const filename = req.params.filename.endsWith('.md') ? req.params.filename : `${req.params.filename}.md`;
    const filePath = path.join(DATABASE_DIR, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

app.delete('/api/articles/:filename', async (req, res) => {
  try {
    await ensureDatabaseDir();
    const filename = req.params.filename.endsWith('.md') ? req.params.filename : `${req.params.filename}.md`;
    const filePath = path.join(DATABASE_DIR, filename);
    await fs.unlink(filePath);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

