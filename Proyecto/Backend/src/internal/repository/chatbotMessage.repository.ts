import ChatbotMessage from '../domain/chatbotMessage.model';
import ChatbotMessageDTO, { CreateChatbotMessageDTO } from '../dto/chatbotMessage.dto';
import { FindOptions, Op } from 'sequelize';

export interface ChatbotMessageRepositoryInterface {
    create(createChatbotMessageDTO: CreateChatbotMessageDTO): Promise<ChatbotMessageDTO>;
    findById(id: number): Promise<ChatbotMessageDTO | null>;
    findBySessionId(sessionId: number, limit?: number): Promise<ChatbotMessageDTO[]>;
}

export class ChatbotMessageRepository implements ChatbotMessageRepositoryInterface {

    async create(createChatbotMessageDTO: CreateChatbotMessageDTO): Promise<ChatbotMessageDTO> {
        try {
            const chatbotMessage = await ChatbotMessage.create({
                session_id: createChatbotMessageDTO.session_id,
                sender: createChatbotMessageDTO.sender,
                message: createChatbotMessageDTO.message,
            });

            return chatbotMessage.get({ plain: true }) as ChatbotMessageDTO;
        } catch (error) {
            console.error('Error creating ChatbotMessage:', error);
            throw error;
        }
    }

    async findById(id: number): Promise<ChatbotMessageDTO | null> {
        try {
            const chatbotMessage = await ChatbotMessage.findByPk(id);
            if (!chatbotMessage) {
                return null;
            }
            return chatbotMessage.get({ plain: true }) as ChatbotMessageDTO;
        } catch (error) {
            console.error('Error findById:', error);
            throw error;
        }
    }

    async findBySessionId(sessionId: number, limit?: number): Promise<ChatbotMessageDTO[]> {
        try {
            const options: FindOptions = {
                where: { session_id: sessionId },
                order: [['created_at', 'ASC']],
            };
            
            if (limit !== undefined) {
                options.limit = limit;
            }

            const messages = await ChatbotMessage.findAll(options);
            return messages.map(msg => msg.get({ plain: true }) as ChatbotMessageDTO);
        } catch (error) {
            console.error('Error findBySessionId:', error);
            throw error;
        }
    }
}

