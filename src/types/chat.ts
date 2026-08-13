export type MessageRole = 'user' | 'assistant';

export type MessageStatus = 'sending' | 'sent' | 'error';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  errorDetails?: string;
}

export interface ConversationHistoryItem {
  role: MessageRole;
  content: string;
}

export interface ChatApiRequest {
  message: string;
  sessionId: string;
  history: ConversationHistoryItem[];
}

export interface ChatApiResponse {
  success: boolean;
  reply?: string;
  error?: string;
  details?: string;
}

export interface SavedConversation {
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'no_webhook';
