export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp?: Date;
  imageUrl?: string;
}

export interface Article {
  filename: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServerResponse {
  text: string;
  action?: 'CREATE_ARTICLE' | 'UPDATE_ARTICLE' | 'LIST_ARTICLES' | 'DELETE_ARTICLE';
  filename?: string;
  content?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  error?: string;
}
