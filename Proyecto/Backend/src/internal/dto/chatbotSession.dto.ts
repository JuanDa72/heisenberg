//Chatbot DTO interfaces

export interface ChatbotSessionDTO{
    id: number;
    user_id: number;
    is_active: boolean;
    created_at: Date;
    title: string | null;
}


export interface CreateChatbotSessionDTO{
    user_id: number;
} 

export interface UpdateChatbotSessionDTO{
    is_active?: boolean;
    title?: string | null;
}

