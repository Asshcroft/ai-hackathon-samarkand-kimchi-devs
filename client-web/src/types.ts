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
  id: string;
  text: string;
  sender: 'bot';
  timestamp: string;
  action?: 'CREATE_ARTICLE' | 'UPDATE_ARTICLE' | 'LIST_ARTICLES' | 'DELETE_ARTICLE';
  filename?: string;
  content?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  error?: string;
}

export interface ArticleSavedData {
  filename: string;
  message: string;
  timestamp: string;
}

export interface ArticleContentData {
  filename: string;
  content: string;
  timestamp: string;
}

export interface ArticleDeletedData {
  filename: string;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ArticlesListData {
  articles: string[];
  timestamp: string;
}

export interface ConnectionEstablishedData {
  message: string;
  timestamp: string;
}

