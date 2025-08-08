
import React, { useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import Header from './components/Header';

const App: React.FC = () => {
  const chatWindowRef = useRef<{ handleArticleSelect: (filename: string, content: string) => void }>(null);

  const handleArticleSelect = (filename: string, content: string) => {
    if (chatWindowRef.current) {
      chatWindowRef.current.handleArticleSelect(filename, content);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/80 backdrop-blur-sm">
      <Header onArticleSelect={handleArticleSelect} />
      <main className="flex-grow overflow-hidden">
        <ChatWindow ref={chatWindowRef} />
      </main>
    </div>
  );
};

export default App;