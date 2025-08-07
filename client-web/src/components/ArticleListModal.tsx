import React, { useState, useEffect } from 'react';

interface ArticleListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (filename: string) => void;
  articles: string[];
}

const ArticleListModal: React.FC<ArticleListModalProps> = ({
  isOpen,
  onClose,
  onSelectArticle,
  articles,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 border-2 border-orange-400/50 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-orange-400">Available Articles</h2>
          <button
            onClick={onClose}
            className="text-orange-400 hover:text-orange-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-orange-400 text-lg">Loading articles...</div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-orange-400/60 text-lg">No articles found</div>
              <div className="text-orange-400/40 text-sm mt-2">
                Create articles by asking the AI to write content
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {articles.map((filename) => (
                <button
                  key={filename}
                  onClick={() => onSelectArticle(filename)}
                  className="w-full text-left p-3 bg-black/50 border border-orange-400/30 rounded hover:bg-orange-600/20 transition-colors"
                >
                  <div className="text-orange-300 font-mono text-sm">{filename}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-300 rounded hover:bg-orange-700/20 font-mono text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleListModal;

