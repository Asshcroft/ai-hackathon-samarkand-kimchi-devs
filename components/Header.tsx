import React from 'react';
import { soundService } from '../services/ttsService';

const Header: React.FC = () => {
  return (
    <header className="p-2 border-b-2 border-orange-400/50 flex-shrink-0">
      <h1 
        className="text-lg font-bold text-glow"
        onMouseEnter={() => soundService.playHoverSound()}
      >
        IPA :: INTEGRATED PORTABLE ASSISTANT
      </h1>
    </header>
  );
};

export default Header;