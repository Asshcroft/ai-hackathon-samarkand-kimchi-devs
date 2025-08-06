import React, { useState, useEffect } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import PlotDisplay from './PlotDisplay';
import SchematicDisplay from './SchematicDisplay';
import { soundService } from '../services/ttsService';

interface ChatMessageProps {
  message: Message;
  isLastMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastMessage }) => {
  const isBot = message.sender === Sender.Bot;
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Clean up the object URL to prevent memory leaks
    return () => {
      if (message.imageUrl) {
        URL.revokeObjectURL(message.imageUrl);
      }
    };
  }, [message.imageUrl]);

  useEffect(() => {
    if (isBot && isLastMessage) {
        setIsTyping(true);
        setDisplayedText('');
        let i = 0;
        const textToType = message.text;
        const intervalId = setInterval(() => {
            if (i < textToType.length) {
                setDisplayedText(textToType.substring(0, i + 1));
                i++;
            } else {
                clearInterval(intervalId);
                setIsTyping(false);
            }
        }, 10); // Very fast typing speed
        return () => {
            clearInterval(intervalId);
            setIsTyping(false);
        };
    } else {
        setDisplayedText(message.text);
        setIsTyping(false);
    }
  }, [message.text, isBot, isLastMessage]);


  // A renderer for markdown-style headings and links
  const renderFormattedText = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

    return text.split('\n').map((line, lineIndex) => {
      if (line.startsWith('# ')) {
        return <h1 key={lineIndex} className="text-xl font-bold mt-4 mb-2 text-glow">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={lineIndex} className="text-lg font-bold mt-3 mb-1 text-glow">{line.substring(3)}</h2>;
      }
      if (line.trim() === '') {
        return <div key={lineIndex} style={{ height: '1em' }} />;
      }
      
      // Check for links
      if (!line.includes('](')) {
        return <p key={lineIndex}>{line}</p>;
      }

      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        // Push text before the link
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        // Push the link element
        const linkText = match[1];
        const linkUrl = match[2];
        parts.push(
          <a
            key={`${lineIndex}-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-300 hover:underline transition-colors"
            onClick={() => soundService.playClickSound()}
            onMouseEnter={() => soundService.playHoverSound()}
          >
            {linkText}
          </a>
        );
        lastIndex = linkRegex.lastIndex;
      }
      
      // Push any remaining text after the last link
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return <p key={lineIndex}>{parts}</p>;
    });
  };

  const renderSources = (sources: { uri: string; title: string }[]) => (
    <div className="mt-3 pt-2 border-t border-orange-700/50">
      <h3 className="text-orange-300 font-bold text-sm mb-1">SOURCES:</h3>
      <ul className="list-none pl-2 space-y-1">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-300 hover:underline transition-colors text-sm"
              title={source.title}
              onClick={() => soundService.playClickSound()}
              onMouseEnter={() => soundService.playHoverSound()}
            >
              [{index + 1}] {source.title || new URL(source.uri).hostname}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="w-full">
      {isBot ? (
        <div className="whitespace-pre-wrap text-glow">
          {renderFormattedText(displayedText)}
          {isTyping && <span className="typing-cursor"></span>}
          {!isTyping && message.metadata?.sources && message.metadata.sources.length > 0 && renderSources(message.metadata.sources)}
          {!isTyping && message.plotData && <PlotDisplay plotData={message.plotData} />}
          {!isTyping && message.schematicSvg && <SchematicDisplay svgContent={message.schematicSvg} />}
        </div>
      ) : (
        <div>
            <div className="flex">
                <span className="text-orange-400 mr-2">&gt;</span>
                <p className="text-orange-300 whitespace-pre-wrap flex-1">{message.text}</p>
            </div>
            {message.imageUrl && (
                <div className="mt-2 pl-4">
                    <img 
                        src={message.imageUrl} 
                        alt="User upload" 
                        className="max-w-xs max-h-64 rounded-md border-2 border-orange-500/50"
                    />
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;