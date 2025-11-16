import ChatbotSession  from "../domain/chatbotSession.model";
import { ChatbotSessionDTO, CreateChatbotSessionDTO, UpdateChatbotSessionDTO } from "../dto/chatbotSession.dto";
import { Op, UniqueConstraintError, ValidationError } from "sequelize";

export interface ChatbotSessionRepositoryInterface {
    create(createChatbotSessionDTO: CreateChatbotSessionDTO): Promise<ChatbotSessionDTO>;
    findById(id: number): Promise<ChatbotSessionDTO|null>;
    findAllByUserId(user_id: number): Promise<ChatbotSessionDTO[]>;
    findAll(limit?: number, offset?: number): Promise<ChatbotSessionDTO[]>;
    findByActiveSession(user_id: number): Promise<ChatbotSessionDTO[]|null>;
    update(id: number, updateChatbotSessionDTO: UpdateChatbotSessionDTO): Promise<ChatbotSessionDTO|null>;
    delete(id: number): Promise<boolean>;
}

export class ChatbotSessionRepository implements ChatbotSessionRepositoryInterface {

    async create(createChatbotSessionDTO: CreateChatbotSessionDTO): Promise<ChatbotSessionDTO> {

        try {
            const chatbotSession = await ChatbotSession.create({
                user_id: createChatbotSessionDTO.user_id,
            });

            const plain = chatbotSession.get({plain:true});
            return plain as ChatbotSessionDTO;
        }
        
        catch (error){
            console.error('Error creating ChatbotSession:', error);
            throw error;
        }

    }


    async findById(id: number): Promise<ChatbotSessionDTO | null>{

        try {
            const chatbotSession= await ChatbotSession.findByPk(id);

            if(!chatbotSession){
                return null;
            }

            return chatbotSession.get({plain:true}) as ChatbotSessionDTO;
        }

        catch (error) {
            console.error('Error findByPk', error);
            throw error;
        }

    }

    
    async findAllByUserId(user_id: number): Promise <ChatbotSessionDTO[]> {

        try {
            const sessions= await ChatbotSession.findAll({
                where: {user_id: user_id},
                order: [['created_at', 'DESC']]
            })

            return sessions.map(session => session.get({plain:true}) as ChatbotSessionDTO);

        }

        catch (error) {
            console.error('Error findAllByUserId:', error);
            throw error;
        }

    }


    async findAll(limit ?: number, offset? :number): Promise <ChatbotSessionDTO[]> {

        try {
            const options: any = {
                order: [['created_at', 'DESC']]
            }

            if (limit !== undefined) options.limit = limit;
            if (offset !== undefined) options.offset = offset;

            const sessions= await ChatbotSession.findAll(options);
            
            return sessions.map(session => session.get({plain:true}) as ChatbotSessionDTO);
        }

        catch (error) {
            console.error('Error findAll:', error);
            throw error;
        }

    }


    async findByActiveSession(user_id: number): Promise<ChatbotSessionDTO[] | null> {

        try {
            const sessions= await ChatbotSession.findAll({
                where: {user_id : user_id, is_active: true},
                order: [['created_at', 'DESC']]
            })

            return sessions.map(session => session.get({plain:true}) as ChatbotSessionDTO);

        }

        catch (error) {
            console.error('Error findByActiveSession:', error);
            throw error;
        }

    }


    async update(id: number, updateChatbotSessionDTO: UpdateChatbotSessionDTO): Promise<ChatbotSessionDTO | null> {

        try {

            const chatbotSession= await ChatbotSession.findByPk(id);

            if(!chatbotSession){
                return null;
            }

            await chatbotSession.update({
                is_active: updateChatbotSessionDTO.is_active
            });

            const plain = chatbotSession.get({plain:true});
            return plain as ChatbotSessionDTO;

        }

        catch (error) {
            console.error('Error updating ChatbotSession:', error);
            throw error;
        }

    }


    async delete(id: number): Promise<boolean> {

        try {
            const deletedCount = await ChatbotSession.destroy({
                where: {id: id}
            });

            return deletedCount > 0;
        }

        catch (error) {
            console.error('Error deleting ChatbotSession:', error);
            throw error;
        }

    }

}