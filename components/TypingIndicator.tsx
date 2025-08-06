import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center text-glow">
        <span>PROCESSING...</span>
        <div className="w-3 h-5 bg-orange-400 animate-pulse ml-2"></div>
    </div>
  );
};

export default TypingIndicator;