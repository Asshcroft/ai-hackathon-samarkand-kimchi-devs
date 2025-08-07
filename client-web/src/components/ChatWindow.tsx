import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { socketService } from '../services/socketService';
import ArticleListModal from './ArticleListModal';
import ConnectionStatus from './ConnectionStatus';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      text: "IPA CLIENT v1.0 ONLINE. CONNECTING TO SERVER...",
      sender: Sender.Bot,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [articles, setArticles] = useState<string[]>([]);

  useEffect(() => {
    // Connect to server
    const connectToServer = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        setConnectionError(null);
        
        // Update initial message
        setMessages(prev => [
          {
            id: 'connection-success',
            text: "CONNECTION ESTABLISHED. ENGINEERING & EMERGENCY PROTOCOLS LOADED. YOU CAN NOW ATTACH IMAGES FOR ANALYSIS. AWAITING COMMAND.",
            sender: Sender.Bot,
          }
        ]);
      } catch (error) {
        console.error('Failed to connect to server:', error);
        setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        setIsConnected(false);
        
        setMessages(prev => [
          {
            id: 'connection-error',
            text: `CONNECTION ERROR: ${error instanceof Error ? error.message : 'Failed to connect to server'}. Please check if the IPA server is running.`,
            sender: Sender.Bot,
          }
        ]);
      }
    };

    // Set up event handlers
    socketService.onMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
      setIsLoading(false);
    });

    socketService.onError((error: string) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `ERROR: ${error}`,
        sender: Sender.Bot,
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    });

    socketService.onConnectionChange((status) => {
      setIsConnected(status.connected);
      setConnectionError(status.error || null);
    });

    socketService.onArticlesList((articlesList: string[]) => {
      setArticles(articlesList);
    });

    socketService.onArticleSaved((data) => {
      const savedMessage: Message = {
        id: Date.now().toString(),
        text: `SYSTEM: Article "${data.filename}" saved successfully.`,
        sender: Sender.Bot,
      };
      setMessages(prev => [...prev, savedMessage]);
    });

    socketService.onArticleDeleted((data) => {
      const deletedMessage: Message = {
        id: Date.now().toString(),
        text: `SYSTEM: Article "${data.filename}" ${data.success ? 'deleted successfully' : 'deletion failed'}.`,
        sender: Sender.Bot,
      };
      setMessages(prev => [...prev, deletedMessage]);
    });

    socketService.onArticleContent((data) => {
      const articleMessage: Message = {
        id: Date.now().toString(),
        text: `=== ARTICLE: ${data.filename} ===\n\n${data.content}`,
        sender: Sender.Bot,
      };
      setMessages(prev => [...prev, articleMessage]);
    });

    // Connect to server
    connectToServer();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleSendMessage = useCallback(async (message: string, imageFile: File | null) => {
    if (!isConnected) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "ERROR: Not connected to server. Please check your connection.",
        sender: Sender.Bot,
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: Sender.User,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      socketService.sendMessage(message, imageFile || undefined);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `ERROR: Failed to send message. ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: Sender.Bot,
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  }, [isConnected]);

  const handleSaveLastResponse = useCallback(async () => {
    const lastBotMessage = [...messages].reverse().find(msg => msg.sender === Sender.Bot);
    if (!lastBotMessage) {
      console.warn("No bot message found to save.");
      return;
    }

    const filename = window.prompt("Enter a filename to save the content:", `protocol_${Date.now()}.md`);

    if (filename && filename.trim()) {
      try {
        // Отправляем запрос на сервер для сохранения статьи
        const saveMessage = `Please save the following content as an article with filename "${filename.trim()}":\n\n${lastBotMessage.text}`;
        socketService.sendMessage(saveMessage);
        setIsLoading(true);
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 3).toString(),
          text: `ERROR: Failed to save article. ${error instanceof Error ? error.message : 'Unknown error'}`,
          sender: Sender.Bot,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  }, [messages]);

  const handleSelectArticle = useCallback(async (filename: string) => {
    try {
      socketService.getArticle(filename);
      setIsReadModalOpen(false);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `ERROR: Failed to read article "${filename}". ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: Sender.Bot,
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, []);

  const handleDeleteArticle = useCallback(async () => {
    const filename = window.prompt("Enter the filename to delete:");
    if (filename && filename.trim()) {
      try {
        socketService.deleteArticle(filename.trim());
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `ERROR: Failed to delete article. ${error instanceof Error ? error.message : 'Unknown error'}`,
          sender: Sender.Bot,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  }, []);

  const handleReadFile = useCallback(async () => {
    try {
      socketService.getArticles();
      setIsReadModalOpen(true);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `ERROR: Failed to load articles. ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: Sender.Bot,
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <ConnectionStatus 
        isConnected={isConnected} 
        error={connectionError} 
      />
      <MessageList messages={messages} />
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        messages={messages}
        onSaveLastResponse={handleSaveLastResponse}
        onReadFile={handleReadFile}
        onDeleteArticle={handleDeleteArticle}
        isConnected={isConnected}
      />
      <ArticleListModal
        isOpen={isReadModalOpen}
        onClose={() => setIsReadModalOpen(false)}
        onSelectArticle={handleSelectArticle}
        articles={articles}
      />
    </div>
  );
};

export default ChatWindow;

