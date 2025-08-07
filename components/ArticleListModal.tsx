import React, { useState, useEffect } from 'react';
import { soundService } from '../services/ttsService';
import * as db from '../services/databaseService';

interface ArticleListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (filename: string) => void;
  articles: string[];
}

const ArticleListModal: React.FC<ArticleListModalProps> = ({ isOpen, onClose, onSelectArticle, articles }) => {
  const [dynamicArticles, setDynamicArticles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadArticles();
    }
  }, [isOpen]);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const allArticles = await db.listArticlesCombined();
      setDynamicArticles(allArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
      setDynamicArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Use dynamic articles if available, otherwise fall back to props
  const displayArticles = dynamicArticles.length > 0 ? dynamicArticles : articles;
  if (!isOpen) {
    return null;
  }

  const handleSelect = (filename: string) => {
    soundService.playClickSound();
    onSelectArticle(filename);
    onClose();
  };
  
  const handleClose = () => {
    soundService.playClickSound();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-black border-2 border-orange-400/50 p-6 rounded-lg max-w-lg w-full text-orange-400 shadow-lg shadow-orange-500/20 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center border-b-2 border-orange-400/50 pb-2 mb-4">
          <h2 className="text-xl font-bold text-glow">DATABASE FILES</h2>
          <button 
            onClick={handleClose}
            onMouseEnter={() => soundService.playHoverSound()}
            className="text-orange-400 hover:text-orange-300 text-glow"
            aria-label="Close"
          >
            [X]
          </button>
        </div>
        <div className="overflow-y-auto pr-2">
          {isLoading ? (
            <p className="text-orange-600">...LOADING ARTICLES...</p>
          ) : displayArticles.length > 0 ? (
            <ul className="space-y-2">
              {displayArticles.map((filename) => (
                <li key={filename}>
                  <button 
                    onClick={() => handleSelect(filename)}
                    onMouseEnter={() => soundService.playHoverSound()}
                    className="w-full text-left p-2 hover:bg-orange-700/50 rounded-md transition-colors duration-200"
                  >
                    - {filename}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-orange-600">...DATABASE IS EMPTY...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleListModal;