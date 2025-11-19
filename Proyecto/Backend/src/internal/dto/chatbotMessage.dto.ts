// ChatbotMessage DTO interfaces
export interface CreateChatbotMessageDTO {
  session_id: number;
  sender: string;
  message: string;
}

export default interface ChatbotMessageDTO {
  id: number;
  session_id: number;
  sender: string;
  message: string;
  created_at: Date;
}

