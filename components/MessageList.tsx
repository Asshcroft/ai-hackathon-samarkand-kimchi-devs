import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto">
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          isLastMessage={index === messages.length - 1 && message.sender === Sender.Bot && !isLoading}
        />
      ))}
      {isLoading && (
        <div className="flex items-end">
            <TypingIndicator />
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageList;