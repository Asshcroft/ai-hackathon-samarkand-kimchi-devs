
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { createChatSession } from '../services/geminiService';
import * as db from '../services/databaseService';
import { ttsService, soundService } from '../services/ttsService';
import ArticleListModal from './ArticleListModal';
import EngineeringToolsModal from './EngineeringToolsModal';
import { processMathRequest } from '../services/mathService';
import type { Chat, GenerateContentResponse, Part } from '@google/genai';


const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};


export interface ChatWindowRef {
  handleArticleSelect: (filename: string, content: string) => void;
}

const ChatWindow = forwardRef<ChatWindowRef>((props, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      text: "IPA v1.3 ONLINE. ENGINEERING & EMERGENCY PROTOCOLS LOADED. YOU CAN NOW ATTACH IMAGES FOR ANALYSIS. AWAITING COMMAND.",
      sender: Sender.Bot,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isEngineeringToolsOpen, setIsEngineeringToolsOpen] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Initialize audio context on the first user interaction to comply with browser policies.
    const initAudio = () => {
        soundService.initialize();
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    
    if (process.env.API_KEY) {
        chatSessionRef.current = createChatSession();
    } else {
        const errorMsg: Message = {
            id: 'api-key-error',
            text: 'SYSTEM ERROR: API_KEY is not configured. Please set the API_KEY environment variable to use this application.',
            sender: Sender.Bot,
        };
        setMessages(prev => [...prev, errorMsg]);
    }

    return () => {
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const handleToggleTts = useCallback(() => {
    setIsTtsEnabled(prev => {
      const newState = !prev;
      if (!newState) {
        ttsService.cancel(); // Stop speaking if disabled
      }
      const confirmationMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `SYSTEM: Text-to-speech ${newState ? 'enabled' : 'disabled'}.`,
        sender: Sender.Bot,
      };
      setMessages(prevMsgs => [...prevMsgs, confirmationMessage]);
      return newState;
    });
  }, []);

  const handleSaveLastResponse = useCallback(() => {
    const lastBotMessage = [...messages].reverse().find(msg => msg.sender === Sender.Bot);
    if (!lastBotMessage) {
      console.warn("No bot message found to save.");
      return;
    }

    const filename = window.prompt("Enter a filename to save the content:", `protocol_${Date.now()}.md`);

    if (filename && filename.trim()) {
      db.saveArticle(filename.trim(), lastBotMessage.text);
      const confirmationMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `SYSTEM: Copied last response to database as "${filename.trim()}".`,
        sender: Sender.Bot,
      };
      setMessages(prev => [...prev, confirmationMessage]);
    }
  }, [messages]);

  const handleOpenReadModal = useCallback(() => {
    setIsReadModalOpen(true);
  }, []);

  const handleOpenEngineeringTools = useCallback(() => {
    setIsEngineeringToolsOpen(true);
  }, []);

  const handleSelectArticle = useCallback((filename: string) => {
    const content = db.getArticle(filename);
    const text = content !== null 
        ? `--- START OF FILE: ${filename} ---\n\n${content}\n\n--- END OF FILE ---`
        : `SYSTEM ERROR: File not found in database: "${filename}"`;
        
    const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: text,
        sender: Sender.Bot,
    };
    setMessages(prev => [...prev, botMessage]);

    if (isTtsEnabled) {
      const speechContent = content || `Error, file not found: ${filename}`;
      ttsService.speak(speechContent);
    }
  }, [isTtsEnabled]);

  const handleArticleSelectFromDatabase = useCallback((filename: string, content: string) => {
    const text = `--- LOADED FROM DATABASE: ${filename} ---\n\n${content}\n\n--- END OF FILE ---`;
        
    const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: text,
        sender: Sender.Bot,
    };
    setMessages(prev => [...prev, botMessage]);

    if (isTtsEnabled) {
      ttsService.speak(content);
    }
  }, [isTtsEnabled]);

  useImperativeHandle(ref, () => ({
    handleArticleSelect: handleArticleSelectFromDatabase,
  }));


  const handleSendMessage = useCallback(async (text: string, imageFile: File | null = null) => {
    if ((!text.trim() && !imageFile) || !chatSessionRef.current) return;
    
    ttsService.cancel();

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: Sender.User,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Moved declaration before use
    const allArticles = db.listArticles();

    // Client-side optimization: if user types an exact filename, read it directly.
    if (!imageFile && allArticles.includes(text.trim())) {
      const articleContent = db.getArticle(text.trim());
      const fileText = `--- START OF FILE: ${text.trim()} ---\n\n${articleContent || `ERROR: Could not read ${text.trim()}`}\n\n--- END OF FILE ---`;
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fileText,
        sender: Sender.Bot,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      if (isTtsEnabled) {
        ttsService.speak(articleContent || `Error reading ${text.trim()}`);
      }
      return;
    }
    
    setIsLoading(true);

    let promptForGemini = text;
    // Don't add context for image prompts.
    if (!imageFile) {
        const editMatch = text.match(/^(?:edit|update|add to) (?:the |an )?article on (.+)/i);
        if (editMatch) {
          const topic = editMatch[1];
          const inferredFilename = topic.trim().replace(/ /g, '_') + '.md';
          const content = db.getArticle(inferredFilename);
          if (content) {
            promptForGemini = `[EXISTING ARTICLE: '${inferredFilename}']\n\n${content}\n\n[USER QUESTION: '${text}']`;
          }
        }
    }
    
    try {
        let response: GenerateContentResponse;
        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            const textPart = { text: promptForGemini };
            const parts = [textPart, imagePart];
            response = await chatSessionRef.current.sendMessage({ message: parts });
        } else {
            response = await chatSessionRef.current.sendMessage({ message: promptForGemini });
        }
      
      const jsonText = response.text.trim();
      let actionData;
      try {
        actionData = JSON.parse(jsonText);
      } catch (e) {
        console.error('Invalid JSON response from AI:', jsonText);
        
        // Fallback for non-JSON responses, which can happen with simple multimodal queries.
        if (jsonText) {
            actionData = { action: 'CHAT', responseText: jsonText };
        } else {
            throw new Error(`Invalid or empty response from AI.`);
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: actionData.responseText || "SYSTEM ERROR: NO RESPONSE TEXT.",
        sender: Sender.Bot,
        plotData: actionData.plotData,
        schematicSvg: actionData.schematicSvg,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      
      if (isTtsEnabled && actionData.responseText) {
          ttsService.speak(actionData.responseText);
      }
      
      switch (actionData.action) {
        case 'CREATE_ARTICLE':
        case 'UPDATE_ARTICLE':
          if (actionData.filename && actionData.content) {
            await db.saveArticle(actionData.filename, actionData.content);
            const confirmMessage: Message = {
              id: (Date.now() + 3).toString(),
              text: `SYSTEM: Article "${actionData.filename}" has been saved to database.`,
              sender: Sender.Bot,
            };
            setMessages(prev => [...prev, confirmMessage]);
          }
          break;
        case 'DELETE_ARTICLE':
          if (actionData.filename) {
            const success = db.deleteArticle(actionData.filename);
            const confirmMessage: Message = {
              id: (Date.now() + 3).toString(),
              text: success 
                ? `SYSTEM: Article "${actionData.filename}" has been deleted from database.`
                : `SYSTEM ERROR: Failed to delete article "${actionData.filename}".`,
              sender: Sender.Bot,
            };
            setMessages(prev => [...prev, confirmMessage]);
          }
          break;
        case 'READ_ARTICLE':
          if (actionData.filename) {
            const content = db.getArticle(actionData.filename);
            const articleMessage: Message = {
              id: (Date.now() + 3).toString(),
              text: content 
                ? `--- START OF FILE: ${actionData.filename} ---\n\n${content}\n\n--- END OF FILE ---`
                : `SYSTEM ERROR: Article "${actionData.filename}" not found in database.`,
              sender: Sender.Bot,
            };
            setMessages(prev => [...prev, articleMessage]);
            if (isTtsEnabled && content) {
              ttsService.speak(content);
            }
          }
          break;
        case 'SEARCH_ARTICLES':
          if (actionData.searchQuery) {
            const results = db.searchArticles(actionData.searchQuery);
            const resultText = results.length > 0
              ? `Search results for "${actionData.searchQuery}":\n\n` + 
                results.map((r, i) => `${i + 1}. ${r.filename} (${r.matches} matches)`).join('\n')
              : `No articles found matching "${actionData.searchQuery}".`;
            
            const searchMessage: Message = {
              id: (Date.now() + 3).toString(),
              text: resultText,
              sender: Sender.Bot,
            };
            setMessages(prev => [...prev, searchMessage]);
          }
          break;
        case 'LIST_ARTICLES':
          setTimeout(() => {
              setIsReadModalOpen(true);
          }, 300);
          break;
        case 'ENABLE_TTS':
          setIsTtsEnabled(true);
          break;
        case 'DISABLE_TTS':
          setIsTtsEnabled(false);
          ttsService.cancel();
          break;
        case 'OPEN_ENGINEERING_TOOLS':
          setIsEngineeringToolsOpen(true);
          break;
        case 'LOCAL_MATH_CALCULATION':
          if (actionData.mathExpression) {
            const mathResult = processMathRequest(actionData.mathExpression);
            if (mathResult) {
              let resultText = `**Локальное вычисление:** ${mathResult.expression}\n\n`;
              resultText += `**Результат:** ${mathResult.result}\n\n`;
              
              if (mathResult.steps && mathResult.steps.length > 0) {
                resultText += `**Пошаговое решение:**\n`;
                mathResult.steps.forEach((step, index) => {
                  resultText += `${index + 1}. ${step}\n`;
                });
              }
              
              if (mathResult.error) {
                resultText += `\n**Ошибка:** ${mathResult.error}`;
              }
              
              const mathMessage: Message = {
                id: (Date.now() + 3).toString(),
                text: resultText,
                sender: Sender.Bot,
              };
              setMessages(prev => [...prev, mathMessage]);
              if (isTtsEnabled) {
                ttsService.speak(resultText);
              }
            } else {
              const errorMessage: Message = {
                id: (Date.now() + 3).toString(),
                text: `Не удалось обработать математическое выражение: "${actionData.mathExpression}"`,
                sender: Sender.Bot,
              };
              setMessages(prev => [...prev, errorMessage]);
            }
          }
          break;
        case 'OPEN_BROWSER':
          if (actionData.url) {
            window.open(actionData.url, '_blank', 'noopener,noreferrer');
          } else {
            console.warn('OPEN_BROWSER action received without a URL.');
          }
          break;
        case 'GET_WEATHER':
          if (actionData.location) {
            const weatherResponse = await fetch(`https://wttr.in/${encodeURIComponent(actionData.location)}?format=j1`);
            if (!weatherResponse.ok) {
              throw new Error(`Could not retrieve weather for ${actionData.location}. Location may be invalid.`);
            }
            const weatherData = await weatherResponse.json();
            const current = weatherData.current_condition[0];
            const weatherReport = `Current weather in ${weatherData.nearest_area[0].areaName[0].value}:\n- Temperature: ${current.temp_C}°C (Feels like ${current.FeelsLikeC}°C)\n- Conditions: ${current.weatherDesc[0].value}`;
            
            const weatherMessage: Message = {
              id: (Date.now() + 3).toString(),
              text: weatherReport,
              sender: Sender.Bot,
            };
            setMessages(prev => [...prev, weatherMessage]);
            if (isTtsEnabled) {
              ttsService.speak(weatherReport);
            }
          } else {
             throw new Error('GET_WEATHER action received without a location specified.');
          }
          break;
      }
    } catch (error) {
      console.error('Error processing response:', error);
      const errorText = `SYSTEM ERROR. FAILED TO PROCESS COMMAND. ${error instanceof Error ? error.message : ''}`;
      const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: errorText,
          sender: Sender.Bot
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      if (isTtsEnabled) {
        ttsService.speak(errorText);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isTtsEnabled]);

  return (
    <div className="flex flex-col h-full">
       <ArticleListModal
        isOpen={isReadModalOpen}
        onClose={() => setIsReadModalOpen(false)}
        onSelectArticle={handleSelectArticle}
        articles={db.listArticles()}
      />
      <EngineeringToolsModal
        isOpen={isEngineeringToolsOpen}
        onClose={() => setIsEngineeringToolsOpen(false)}
      />
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        messages={messages}
        onSaveLastResponse={handleSaveLastResponse}
        onReadFile={handleOpenReadModal}
        isTtsEnabled={isTtsEnabled}
        onToggleTts={handleToggleTts}
        onOpenEngineeringTools={handleOpenEngineeringTools}
      />
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;