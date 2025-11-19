import { ChatbotMessageRepositoryInterface } from '../repository/chatbotMessage.repository';
import ChatbotMessageDTO, { CreateChatbotMessageDTO } from '../dto/chatbotMessage.dto';
import { ChatbotSessionRepositoryInterface } from '../repository/chatbotSession.repository';

export interface ChatbotMessageServiceInterface {
    createChatbotMessage(createChatbotMessageDTO: CreateChatbotMessageDTO): Promise<ChatbotMessageDTO>;
    getChatbotMessageById(id: number): Promise<ChatbotMessageDTO | null>;
    getMessagesBySessionId(sessionId: number, limit?: number): Promise<ChatbotMessageDTO[]>;
}

export class ChatbotMessageService implements ChatbotMessageServiceInterface {

    private chatbotMessageRepository: ChatbotMessageRepositoryInterface;
    private chatbotSessionRepository: ChatbotSessionRepositoryInterface;

    constructor(
        chatbotMessageRepository: ChatbotMessageRepositoryInterface,
        chatbotSessionRepository: ChatbotSessionRepositoryInterface
    ) {
        this.chatbotMessageRepository = chatbotMessageRepository;
        this.chatbotSessionRepository = chatbotSessionRepository;
    }

    async createChatbotMessage(createChatbotMessageDTO: CreateChatbotMessageDTO): Promise<ChatbotMessageDTO> {
        try {
            // Verify session exists
            const session = await this.chatbotSessionRepository.findById(createChatbotMessageDTO.session_id);
            if (!session) {
                throw new Error(`ChatbotSession with ID ${createChatbotMessageDTO.session_id} not found`);
            }

            const chatbotMessage = await this.chatbotMessageRepository.create(createChatbotMessageDTO);
            return chatbotMessage;
        } catch (error) {
            console.error('Error createChatbotMessage:', error);
            throw error;
        }
    }

    async getChatbotMessageById(id: number): Promise<ChatbotMessageDTO | null> {
        try {
            const chatbotMessage = await this.chatbotMessageRepository.findById(id);
            return chatbotMessage;
        } catch (error) {
            console.error('Error getChatbotMessageById:', error);
            throw error;
        }
    }

    async getMessagesBySessionId(sessionId: number, limit?: number): Promise<ChatbotMessageDTO[]> {
        try {
            // Verify session exists
            const session = await this.chatbotSessionRepository.findById(sessionId);
            if (!session) {
                throw new Error(`ChatbotSession with ID ${sessionId} not found`);
            }

            const messages = await this.chatbotMessageRepository.findBySessionId(sessionId, limit);
            return messages;
        } catch (error) {
            console.error('Error getMessagesBySessionId:', error);
            throw error;
        }
    }
}

