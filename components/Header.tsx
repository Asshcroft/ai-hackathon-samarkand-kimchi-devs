import React, { useState } from 'react';
import { soundService } from '../services/ttsService';
import DatabaseModal from './DatabaseModal';

interface HeaderProps {
  onArticleSelect?: (filename: string, content: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onArticleSelect }) => {
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  const handleDatabaseClick = () => {
    soundService.playHoverSound();
    setIsDatabaseModalOpen(true);
  };

  const handleArticleSelect = (filename: string, content: string) => {
    if (onArticleSelect) {
      onArticleSelect(filename, content);
    }
  };

  return (
    <>
      <header className="p-2 border-b-2 border-orange-400/50 flex-shrink-0 flex justify-between items-center">
        <h1 
          className="text-lg font-bold text-glow"
          onMouseEnter={() => soundService.playHoverSound()}
        >
          IPA :: INTEGRATED PORTABLE ASSISTANT
        </h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleDatabaseClick}
            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm font-medium border border-orange-400/50 transition-colors"
            onMouseEnter={() => soundService.playHoverSound()}
          >
            📚 База данных
          </button>
        </div>
      </header>

      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onArticleSelect={handleArticleSelect}
      />
    </>
  );
};

export default Header;