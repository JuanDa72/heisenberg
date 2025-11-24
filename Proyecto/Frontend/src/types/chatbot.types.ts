// Tipos para el servicio de Chatbot (basados en DTOs del backend)

export interface ChatbotSession {
  id: number;
  user_id: number;
  is_active: boolean;
  title?: string;
  created_at: Date;
}

export interface ChatbotMessage {
  id: number;
  session_id: number;
  sender: 'user' | 'bot';
  message: string;
  created_at: Date;
}

export interface CreateChatbotSessionRequest {
  user_id: number;
}

export interface UpdateChatbotSessionRequest {
  is_active?: boolean;
  title?: string;
}

export interface CreateChatbotMessageRequest {
  session_id: number;
  sender: 'user' | 'bot';
  message: string;
}

export interface UpdateChatbotMessageRequest {
  message: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}
