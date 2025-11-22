import ChatbotMessage from '../domain/chatbotMessage.model';
import ChatbotMessageDTO, { CreateChatbotMessageDTO, UpdateChatbotMessageDTO } from '../dto/chatbotMessage.dto';
import { FindOptions, Op} from 'sequelize';

export interface ChatbotMessageRepositoryInterface {
    create(createChatbotMessageDTO: CreateChatbotMessageDTO): Promise<ChatbotMessageDTO>;
    findById(id: number): Promise<ChatbotMessageDTO | null>;
    findBySessionId(sessionId: number, limit?: number): Promise<ChatbotMessageDTO[]>;
    update(id: number, updateData: UpdateChatbotMessageDTO): Promise<ChatbotMessageDTO | null>;
    deleteFromDate(sessionId: number, date: Date): Promise<number>;
    delete(id: number): Promise<boolean>;
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


    async update(id: number, updateData: UpdateChatbotMessageDTO): Promise<ChatbotMessageDTO | null> {

        try {
            const currentChatbotMessage = await ChatbotMessage.findByPk(id);

            if (!currentChatbotMessage) {
                return null;
            }

            await currentChatbotMessage.update(updateData);

            const plain = currentChatbotMessage.get({ plain: true });

            return plain as ChatbotMessageDTO;

        }

        catch (error) {
            console.error('Error updating ChatbotMessage:', error);
            throw error;
        }

    }


    async deleteFromDate(sessionId: number, date: Date): Promise<number> {

        try {
            const deleteCount = await ChatbotMessage.destroy({
                where: {
                    session_id: sessionId,
                    created_at: {
                        [Op.gt]: date
                    }
                }
            });

            return deleteCount;
        }

        catch (error) {
            console.error('Error deleting ChatbotMessages from date:', error);
            throw error;
        }

    }


    async delete(id: number): Promise<boolean> {

        try {
            const deletedCount = await ChatbotMessage.destroy({
                where: { id: id }
            });

            return deletedCount > 0;
        }

        catch (error) {
            console.error('Error deleting ChatbotMessage:', error);
            throw error;
        }

    }


}

