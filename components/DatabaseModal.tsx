import React, { useState, useEffect } from 'react';
import { 
  listArticles, 
  getArticle, 
  deleteArticle, 
  loadArticleFromFile, 
  searchArticles,
  exportAllArticles 
} from '../services/databaseService';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleSelect: (filename: string, content: string) => void;
}

const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose, onArticleSelect }) => {
  const [articles, setArticles] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<string>('');
  const [articleContent, setArticleContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ filename: string; content: string; matches: number }[]>([]);
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadArticlesList();
    }
  }, [isOpen]);

  const loadArticlesList = () => {
    const articlesList = listArticles();
    setArticles(articlesList);
  };

  const handleArticleSelect = (filename: string) => {
    const content = getArticle(filename);
    if (content) {
      setSelectedArticle(filename);
      setArticleContent(content);
    }
  };

  const handleOpenArticle = () => {
    if (selectedArticle && articleContent) {
      onArticleSelect(selectedArticle, articleContent);
      onClose();
    }
  };

  const handleDeleteArticle = (filename: string) => {
    if (window.confirm(`Удалить статью "${filename}"?`)) {
      if (deleteArticle(filename)) {
        loadArticlesList();
        if (selectedArticle === filename) {
          setSelectedArticle('');
          setArticleContent('');
        }
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { filename, content } = await loadArticleFromFile(file);
        // Save to database
        const storageKey = `ipa_db_${filename}`;
        localStorage.setItem(storageKey, content);
        loadArticlesList();
        alert(`Статья "${filename}" успешно загружена!`);
      } catch (error) {
        alert(`Ошибка загрузки файла: ${error}`);
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchArticles(searchQuery);
      setSearchResults(results);
      setIsSearchMode(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchMode(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-orange-400 rounded-lg w-4/5 h-4/5 max-w-6xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-orange-400/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-orange-400">База данных статей</h2>
          <button
            onClick={onClose}
            className="text-orange-400 hover:text-orange-300 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Articles list */}
          <div className="w-1/3 border-r border-orange-400/50 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-orange-400/30">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по содержимому..."
                  className="flex-1 bg-gray-800 border border-orange-400/50 rounded px-3 py-1 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm"
                >
                  Найти
                </button>
              </div>
              {isSearchMode && (
                <button
                  onClick={clearSearch}
                  className="text-orange-400 hover:text-orange-300 text-sm"
                >
                  Очистить поиск
                </button>
              )}
            </div>

            {/* File upload */}
            <div className="p-4 border-b border-orange-400/30">
              <input
                type="file"
                accept=".md"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer text-white text-sm"
              >
                📁 Загрузить .md файл
              </label>
            </div>

            {/* Export button */}
            <div className="p-4 border-b border-orange-400/30">
              <button
                onClick={exportAllArticles}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
              >
                📤 Экспорт всех статей
              </button>
            </div>

            {/* Articles list */}
            <div className="flex-1 overflow-y-auto p-4">
              {isSearchMode ? (
                <div>
                  <p className="text-orange-400 mb-2 text-sm">
                    Найдено: {searchResults.length} результатов
                  </p>
                  {searchResults.map((result) => (
                    <div
                      key={result.filename}
                      onClick={() => handleArticleSelect(result.filename)}
                      className={`p-2 mb-2 rounded cursor-pointer border ${
                        selectedArticle === result.filename
                          ? 'bg-orange-600/20 border-orange-400'
                          : 'bg-gray-800/50 border-gray-700 hover:border-orange-400/50'
                      }`}
                    >
                      <div className="text-white text-sm">{result.filename}</div>
                      <div className="text-orange-400 text-xs">
                        {result.matches} совпадений
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-orange-400 mb-2 text-sm">
                    Всего статей: {articles.length}
                  </p>
                  {articles.map((filename) => (
                    <div
                      key={filename}
                      className={`p-2 mb-2 rounded cursor-pointer border flex justify-between items-center ${
                        selectedArticle === filename
                          ? 'bg-orange-600/20 border-orange-400'
                          : 'bg-gray-800/50 border-gray-700 hover:border-orange-400/50'
                      }`}
                    >
                      <span
                        onClick={() => handleArticleSelect(filename)}
                        className="flex-1 text-white text-sm"
                      >
                        {filename}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArticle(filename);
                        }}
                        className="text-red-400 hover:text-red-300 ml-2 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel - Article preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-orange-400/50 flex justify-between items-center">
              <h3 className="text-lg text-orange-400">
                {selectedArticle ? `Предварительный просмотр: ${selectedArticle}` : 'Выберите статью'}
              </h3>
              {selectedArticle && (
                <button
                  onClick={handleOpenArticle}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white"
                >
                  Открыть в чате
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {articleContent ? (
                <div className="bg-gray-800 rounded p-4 h-full">
                  <pre className="text-white text-sm whitespace-pre-wrap font-mono">
                    {articleContent}
                  </pre>
                </div>
              ) : (
                <div className="text-gray-500 text-center mt-8">
                  Выберите статью для предварительного просмотра
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseModal;
