import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-black/90 border-b-2 border-orange-400/50 p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-orange-400 text-glow">
            IPA CLIENT v1.0
          </h1>
          <div className="text-sm text-orange-300">
            Web Interface
          </div>
        </div>
        <div className="text-sm text-orange-300">
          Connected to IPA Server
        </div>
      </div>
    </header>
  );
};

export default Header;

