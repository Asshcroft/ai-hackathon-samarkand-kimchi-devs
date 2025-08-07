import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, imageFile: File | null) => void;
  isLoading: boolean;
  messages: Message[];
  onSaveLastResponse: () => void;
  onReadFile: () => void;
  onDeleteArticle: () => void;
  isConnected: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  messages, 
  onSaveLastResponse, 
  onReadFile, 
  onDeleteArticle,
  isConnected 
}) => {
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
    if ((text.trim() || imageFile) && !isLoading && isConnected) {
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
  const canSave = !isLoading && !!lastBotMessage && isConnected;
  const canRead = !isLoading && isConnected;
  const canDelete = !isLoading && isConnected;

  return (
    <div className="p-2 bg-black border-t-2 border-orange-400/50 flex-shrink-0">
      {imagePreview && (
        <div className="relative inline-block mb-2 ml-8">
            <img src={imagePreview} alt="Preview" className="max-h-24 rounded-md border-2 border-orange-500/50"/>
            <button
                onClick={() => {
                  removeImage();
                }}
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
            placeholder={isConnected ? "Enter your message..." : "Connecting to server..."}
            disabled={isLoading || !isConnected}
            className="flex-1 bg-transparent text-orange-300 placeholder-orange-400/50 border-none outline-none resize-none max-h-40 min-h-[2.5rem] font-mono text-sm"
            rows={1}
          />
          <div className="flex items-center gap-2 ml-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-input"
              disabled={isLoading || !isConnected}
            />
            <label
              htmlFor="image-input"
              className={`cursor-pointer p-2 rounded border border-orange-400/50 hover:bg-orange-700/20 ${
                isLoading || !isConnected ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Attach image"
            >
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </label>
            <button
              type="submit"
              disabled={isLoading || !isConnected || (!text.trim() && !imageFile)}
              className={`px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm`}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="flex gap-2 mt-2 ml-8">
        <button
          onClick={onSaveLastResponse}
          disabled={!canSave}
          className={`px-3 py-1 bg-green-600/20 border border-green-500/50 text-green-300 rounded hover:bg-green-700/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono`}
          title="Save last response as article"
        >
          Save Response
        </button>
        <button
          onClick={onReadFile}
          disabled={!canRead}
          className={`px-3 py-1 bg-blue-600/20 border border-blue-500/50 text-blue-300 rounded hover:bg-blue-700/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono`}
          title="Read articles from server"
        >
          Read Articles
        </button>
        <button
          onClick={onDeleteArticle}
          disabled={!canDelete}
          className={`px-3 py-1 bg-red-600/20 border border-red-500/50 text-red-300 rounded hover:bg-red-700/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono`}
          title="Delete article from server"
        >
          Delete Article
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
