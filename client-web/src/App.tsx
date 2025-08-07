import React from 'react';
import ChatWindow from './components/ChatWindow';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-black/80 backdrop-blur-sm">
      <Header />
      <main className="flex-grow overflow-hidden">
        <ChatWindow />
      </main>
    </div>
  );
};

export default App;

