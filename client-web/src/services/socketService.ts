import { io, Socket } from 'socket.io-client';
import type { Message, ServerResponse, ConnectionStatus } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private errorHandlers: ((error: string) => void)[] = [];
  private connectionHandlers: ((status: ConnectionStatus) => void)[] = [];
  private articleHandlers: ((articles: string[]) => void)[] = [];
  private articleSavedHandlers: ((data: { filename: string; message: string }) => void)[] = [];

  connect(serverUrl: string = 'http://localhost:3001'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
        });

        this.socket.on('connect', () => {
          console.log('Connected to server');
          this.notifyConnectionHandlers({ connected: true });
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from server');
          this.notifyConnectionHandlers({ connected: false });
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.notifyConnectionHandlers({ connected: false, error: error.message });
          reject(error);
        });

        this.socket.on('ai_response', (response: ServerResponse) => {
          const message: Message = {
            id: Date.now().toString(),
            text: response.text,
            sender: 'bot' as any,
            timestamp: new Date(),
          };
          this.notifyMessageHandlers(message);
        });

        this.socket.on('articles_list', (articles: string[]) => {
          this.notifyArticleHandlers(articles);
        });

        this.socket.on('article_saved', (data: { filename: string; message: string }) => {
          this.notifyArticleSavedHandlers(data);
        });

        this.socket.on('error', (data: { message: string }) => {
          this.notifyErrorHandlers(data.message);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message: string, imageFile?: File): void {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to server');
    }

    const data: any = { message };
    
    if (imageFile) {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        data.imageFile = {
          data: base64,
          mimeType: imageFile.type,
        };
        this.socket!.emit('send_message', data);
      };
      reader.readAsDataURL(imageFile);
    } else {
      this.socket.emit('send_message', data);
    }
  }

  onMessage(handler: (message: Message) => void): void {
    this.messageHandlers.push(handler);
  }

  onError(handler: (error: string) => void): void {
    this.errorHandlers.push(handler);
  }

  onConnectionChange(handler: (status: ConnectionStatus) => void): void {
    this.connectionHandlers.push(handler);
  }

  onArticlesList(handler: (articles: string[]) => void): void {
    this.articleHandlers.push(handler);
  }

  onArticleSaved(handler: (data: { filename: string; message: string }) => void): void {
    this.articleSavedHandlers.push(handler);
  }

  private notifyMessageHandlers(message: Message): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyErrorHandlers(error: string): void {
    this.errorHandlers.forEach(handler => handler(error));
  }

  private notifyConnectionHandlers(status: ConnectionStatus): void {
    this.connectionHandlers.forEach(handler => handler(status));
  }

  private notifyArticleHandlers(articles: string[]): void {
    this.articleHandlers.forEach(handler => handler(articles));
  }

  private notifyArticleSavedHandlers(data: { filename: string; message: string }): void {
    this.articleSavedHandlers.forEach(handler => handler(data));
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
