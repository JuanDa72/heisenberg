// Tipos para el servicio de Chatbot (basados en DTOs del backend)

export interface ChatbotSession {
  id: number;
  user_id: number;
  is_active: boolean;
  created_at: Date;
}

export interface CreateChatbotSessionRequest {
  user_id: number;
}

export interface UpdateChatbotSessionRequest {
  is_active?: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}
