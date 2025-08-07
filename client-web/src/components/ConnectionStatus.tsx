import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error?: string | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, error }) => {
  return (
    <div className="px-4 py-2 bg-black/50 border-b border-orange-400/30">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
        <span className="text-sm text-orange-300">
          {isConnected ? 'Connected to IPA Server' : 'Disconnected'}
        </span>
        {error && (
          <span className="text-sm text-red-400 ml-2">
            Error: {error}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
