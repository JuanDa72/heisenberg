import { ChatbotMessageRepositoryInterface } from '../repository/chatbotMessage.repository';
import ChatbotMessageDTO, { CreateChatbotMessageDTO, UpdateChatbotMessageDTO } from '../dto/chatbotMessage.dto';
import { ChatbotSessionRepositoryInterface } from '../repository/chatbotSession.repository';
import { config } from 'dotenv';

config();


export interface ChatbotMessageServiceInterface {
    createChatbotMessage(createChatbotMessageDTO: CreateChatbotMessageDTO): Promise<ChatbotMessageDTO>;
    getChatbotMessageById(id: number): Promise<ChatbotMessageDTO | null>;
    getMessagesBySessionId(sessionId: number, limit?: number): Promise<ChatbotMessageDTO[]>;
    updateChatbotMessage(id: number, updateData: UpdateChatbotMessageDTO): Promise<ChatbotMessageDTO | null>;
    deleteChatbotMessagesFromDate(sessionId: number, date: Date): Promise<number>;
    deleteChatbotMessage(id: number): Promise<boolean>;
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


    async updateChatbotMessage(id: number, updateData: UpdateChatbotMessageDTO): Promise<ChatbotMessageDTO | null> {

        try {
            const updatedMessage = await this.chatbotMessageRepository.update(id, updateData);
            return updatedMessage;
        } catch (error) {
            console.error('Error updateChatbotMessage:', error);
            throw error;
        }

    }


    async deleteChatbotMessagesFromDate(sessionId: number, date: Date): Promise<number> {

        try {

            if(!date || isNaN(date.getTime())){
                throw new Error('Invalid date provided');
            }

            if(date > new Date()){
                throw new Error('Date cannot be in the future');
            }

            // Verify session exists
            const session = await this.chatbotSessionRepository.findById(sessionId);
            if (!session) {
                throw new Error(`ChatbotSession with ID ${sessionId} not found`);
            }

            const deleteCount = await this.chatbotMessageRepository.deleteFromDate(sessionId, date);
            return deleteCount;
        } catch (error) {
            console.error('Error deleteChatbotMessagesFromDate:', error);
            throw error;
        }

    }


    async deleteChatbotMessage(id: number): Promise<boolean> {

        try {
            const exists = await this.chatbotMessageRepository.findById(id);
            if (!exists) {
                throw new Error(`ChatbotMessage with ID ${id} not found`);
            }

            const result = await this.chatbotMessageRepository.delete(id);
            return result;

        } catch (error) {
            console.error('Error deleteChatbotMessage:', error);
            throw error;
        }
    }

}

