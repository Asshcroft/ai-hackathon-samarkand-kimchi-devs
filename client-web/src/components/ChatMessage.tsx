import React from 'react';
import type { Message } from '../types';
import { Sender } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === Sender.Bot;
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-lg p-4 ${
          isBot
            ? 'bg-black/50 border border-orange-400/30 text-orange-300'
            : 'bg-orange-600/20 border border-orange-500/50 text-orange-200'
        }`}
      >
        {message.imageUrl && (
          <div className="mb-3">
            <img
              src={message.imageUrl}
              alt="Attached"
              className="max-w-full h-auto rounded border border-orange-400/30"
            />
          </div>
        )}
        <div className="whitespace-pre-wrap font-mono text-sm">
          {message.text}
        </div>
        {message.timestamp && (
          <div className="text-xs text-orange-400/60 mt-2">
            {message.timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

