import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import * as db from '../services/databaseService';
import { soundService } from '../services/ttsService';

interface ChatInputProps {
  onSendMessage: (message: string, imageFile: File | null) => void;
  isLoading: boolean;
  messages: Message[];
  onSaveLastResponse: () => void;
  onReadFile: () => void;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  onOpenEngineeringTools: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, messages, onSaveLastResponse, onReadFile, isTtsEnabled, onToggleTts, onOpenEngineeringTools }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // Corresponds to max-h-40
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [text]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || imageFile) && !isLoading) {
      soundService.playClickSound();
      onSendMessage(text, imageFile);
      setText('');
      removeImage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const lastBotMessage = [...messages].reverse().find(m => m.sender === Sender.Bot);
  const canSave = !isLoading && !!lastBotMessage;
  const canRead = !isLoading && db.listArticles().length > 0;

  return (
    <div className="p-2 bg-black border-t-2 border-orange-400/50 flex-shrink-0">
      {imagePreview && (
        <div className="relative inline-block mb-2 ml-8">
            <img src={imagePreview} alt="Preview" className="max-h-24 rounded-md border-2 border-orange-500/50"/>
            <button
                onClick={() => {
                  soundService.playClickSound();
                  removeImage();
                }}
                onMouseEnter={() => soundService.playHoverSound()}
                className="absolute -top-2 -right-2 bg-black text-orange-400 rounded-full h-6 w-6 flex items-center justify-center border border-orange-500 text-glow hover:bg-orange-700/80"
                aria-label="Remove image"
            >
                &times;
            </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <form onSubmit={handleSubmit} className="flex items-start w-full">
          <label htmlFor="chat-input" className="text-orange-400 mr-2 pt-2">&gt;</label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ENTER COMMAND OR ATTACH IMAGE..."
            rows={1}
            className="flex-grow bg-transparent text-orange-300 placeholder-orange-700 resize-none focus:outline-none w-full caret-orange-400 p-2 disabled:opacity-50 max-h-40"
            disabled={isLoading}
            autoFocus
          />
        </form>
        <div className="flex items-center gap-1 pb-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
          <button
            onClick={() => {
              soundService.playClickSound();
              fileInputRef.current?.click();
            }}
            onMouseEnter={() => soundService.playHoverSound()}
            disabled={isLoading}
            className="p-2 rounded-md text-orange-400 hover:bg-orange-700/50 disabled:text-orange-900/80 disabled:cursor-not-allowed transition-colors text-glow"
            title="Attach image"
            aria-label="Attach image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a1 1 0 112 0v4a5 5 0 01-10 0V7a5 5 0 0110 0v4a1 1 0 11-2 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => {
              soundService.playClickSound();
              onSaveLastResponse();
            }}
            onMouseEnter={() => soundService.playHoverSound()}
            disabled={!canSave}
            className="p-2 rounded-md text-orange-400 hover:bg-orange-700/50 disabled:text-orange-900/80 disabled:cursor-not-allowed transition-colors text-glow"
            title="Save last IPA response"
            aria-label="Save last IPA response"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => {
              soundService.playClickSound();
              onOpenEngineeringTools();
            }}
            onMouseEnter={() => soundService.playHoverSound()}
            className="p-2 rounded-md text-orange-400 hover:bg-orange-700/50 transition-colors text-glow"
            title="Open Engineering Tools"
            aria-label="Open Engineering Tools"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => {
              soundService.playClickSound();
              onToggleTts();
            }}
            onMouseEnter={() => soundService.playHoverSound()}
            className="p-2 rounded-md text-orange-400 hover:bg-orange-700/50 transition-colors text-glow"
            title={isTtsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
            aria-label={isTtsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
          >
            {isTtsEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.828 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.414-1.414A3.986 3.986 0 0013 10a3.986 3.986 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;