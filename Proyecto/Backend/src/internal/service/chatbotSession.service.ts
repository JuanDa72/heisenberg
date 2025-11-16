import { ChatbotSessionRepositoryInterface } from "../repository/chatbotSession.repository";
import { ChatbotSessionDTO, CreateChatbotSessionDTO, UpdateChatbotSessionDTO } from "../dto/chatbotSession.dto";
import { UserRepositoryInterface } from "../repository/user.repository";

export interface ChatbotSessionServiceInterface {
    createChatbotSession(createChatbotSessionDTO: CreateChatbotSessionDTO): Promise<ChatbotSessionDTO>;
    getChatbotSessionById(id: number): Promise<ChatbotSessionDTO|null>;
    getAllChatbotSessionsByUserId(user_id: number): Promise<ChatbotSessionDTO[]>;
    getAllChatbotSessions(limit?: number, offset?: number): Promise<ChatbotSessionDTO[]>;
    getByActiveSession(user_id: number): Promise<ChatbotSessionDTO[]|null>;
    updateChatbotSession(id: number, updateChatbotSessionDTO: UpdateChatbotSessionDTO): Promise<ChatbotSessionDTO|null>;
    deletechatbotSession(id: number): Promise<boolean>;
}


export class ChatbotSessionService implements ChatbotSessionServiceInterface {

    private chatbotSessionRepository: ChatbotSessionRepositoryInterface;
    private userRepository: UserRepositoryInterface;

    constructor(chatbotSessionRepository: ChatbotSessionRepositoryInterface, userRepository: UserRepositoryInterface) {
        this.chatbotSessionRepository = chatbotSessionRepository;
        this.userRepository = userRepository;
    }

    async createChatbotSession(createChatbotSessionDTO: CreateChatbotSessionDTO): Promise<ChatbotSessionDTO> {

        try {
            const chatbotSession = await this.chatbotSessionRepository.create(createChatbotSessionDTO);
            return chatbotSession;
        }

        catch (error) {
            console.error('Error createChatbotSession:', error);
            throw error;
        }

    }


    async getChatbotSessionById(id: number): Promise<ChatbotSessionDTO|null> {

        try {
            const chatbotSession = await this.chatbotSessionRepository.findById(id);
            
            if(!chatbotSession){
                throw new Error(`ChatbotSession with ID ${id} not found`);
            }

            return chatbotSession;

        }

        catch (error) {
            console.error('Error getChatbotSessionById:', error);
            throw error;
        }
    }
    
    
    async getAllChatbotSessionsByUserId(user_id: number): Promise<ChatbotSessionDTO[]> {

        try {

            const userExists = await this.userRepository.findById(user_id);
            if (!userExists) {
                throw new Error(`User with ID ${user_id} not found`);
            }

            const chatbotSessions = await this.chatbotSessionRepository.findAllByUserId(user_id);
            return chatbotSessions;
        }

        catch (error) {
            console.error('Error getAllChatbotSessionsByUserId:', error);
            throw error;
        }
    }


    async getAllChatbotSessions(limit?: number, offset?: number): Promise<ChatbotSessionDTO[]> {

        try {
            const chatbotSessions = await this.chatbotSessionRepository.findAll(limit, offset);
            return chatbotSessions;
        }

        catch (error) {
            console.error('Error getAllChatbotSessions:', error);
            throw error;
        }
    }


    async getByActiveSession(user_id: number): Promise<ChatbotSessionDTO[]|null> {

        try {

            const userExists = await this.userRepository.findById(user_id);
            if (!userExists) {
                throw new Error(`User with ID ${user_id} not found`);
            }

            const chatbotSessions = await this.chatbotSessionRepository.findByActiveSession(user_id);
            return chatbotSessions;
        }

        catch (error) {
            console.error('Error getByActiveSession:', error);
            throw error;
        }

    }


    async updateChatbotSession(id: number, updateChatbotSessionDTO: UpdateChatbotSessionDTO): Promise<ChatbotSessionDTO|null> {

        try {
            const existingChatbotSession = await this.chatbotSessionRepository.findById(id);

            if (!existingChatbotSession) {
                throw new Error(`ChatbotSession with ID ${id} not found`);
            }

            const updatedChatbotSession = await this.chatbotSessionRepository.update(id, updateChatbotSessionDTO);
            return updatedChatbotSession;

        }

        catch (error) {
            console.error('Error updateChatbotSession:', error);
            throw error;
        }
    }


    async deletechatbotSession(id: number): Promise<boolean> {

        try {
            const exists = await this.chatbotSessionRepository.findById(id);
            if (!exists) {
                throw new Error(`ChatbotSession with ID ${id} not found`);
            }

            return await this.chatbotSessionRepository.delete(id);
        }

        catch (error) {
            console.error('Error deleteChatbotSession:', error);
            throw error;
        }
    }

}