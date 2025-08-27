/**
 * 💬 CHAT MODELS - Professional chat interface models
 */

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  sender: string;
  content: string;
  code?: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContext {
  editorBuffers?: any;
  chatHistory?: ChatMessage[];
  userPreferences?: any;
  timestamp: string;
}
