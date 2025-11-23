import {Router, Request, Response} from "express";
import { ChatbotSessionServiceInterface } from "../service/chatbotSession.service";
import { ChatbotSessionDTO, CreateChatbotSessionDTO, UpdateChatbotSessionDTO } from "../dto/chatbotSession.dto";
import ResponseDTO from "../dto/response.dto";

const CHATBOTSESSIONS_UPDATE_FIELDS = ['is_active', 'title'];


function invalidFields(providedFields: string[], allowedFields: string[]): string[] {
    return providedFields.filter(
        key => !allowedFields.includes(key)
    );
}


export interface chatbotSessionHandlerInterface {
    setUpRoutes(): void;
    getRouter(): Router;
    setRAGService(ragService: any): void;
    setChatbotMessageService(chatbotMessageService: any): void;
}

export class ChatbotSessionHandler implements chatbotSessionHandlerInterface {

    private chatbotSessionService: ChatbotSessionServiceInterface;
    private router: Router;
    private ragService: any;
    private chatbotMessageService: any;

    constructor(chatbotSessionService: ChatbotSessionServiceInterface) {
        this.chatbotSessionService = chatbotSessionService;
        this.router = Router();
    }

    setRAGService(ragService: any): void {
        this.ragService = ragService;
    }

    setChatbotMessageService(chatbotMessageService: any): void {
        this.chatbotMessageService = chatbotMessageService;
    }

    setUpRoutes(): void {
        this.router.get('/active/:user_id', this.getByActiveSession.bind(this));
        this.router.get('/:id', this.getChatbotSessionById.bind(this));
        this.router.get('/user/:user_id', this.getAllChatbotSessionsByUserId.bind(this));
        this.router.get('/', this.getAllChatbotSessions.bind(this));
        this.router.post('/', this.createChatbotSession.bind(this));
        this.router.put('/:id', this.updateChatbotSession.bind(this));
        this.router.delete('/:id', this.deleteChatbotSession.bind(this));
        this.router.post('/:sessionId/chat', this.chat.bind(this));
    }

    private async createChatbotSession(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<ChatbotSessionDTO>;

        try {
            const createChatbotSessionDTO: CreateChatbotSessionDTO = req.body;

            if(!createChatbotSessionDTO.user_id){
                response = {
                    status: 400,
                    message: "user_id is required",
                };
                res.status(400).json(response);
                return;
            }

            if(isNaN(createChatbotSessionDTO.user_id) || createChatbotSessionDTO.user_id <= 0){

                response = {
                    status: 400,
                    message: "Invalid user_id",
                };
                res.status(400).json(response);
                return;

            }

            const chatbotSession = await this.chatbotSessionService.createChatbotSession(createChatbotSessionDTO);

            response = {
                status: 201,
                message: "ChatbotSession created successfully",
                data: chatbotSession,
            };

            res.status(201).json(response);
        }

        catch (error) {

            const message = (error instanceof Error) ? error.message : 'Unknown error';

            console.error('Error in createChatbotSession handler:', error);
            response = {
                status: 500,
                message: `Error creating ChatbotSession: ${message}`,
            };
            res.status(500).json(response);
        }
    }


    private async getChatbotSessionById(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<ChatbotSessionDTO>;

        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                response = {
                    status: 400,
                    message: "Invalid ID",
                };
                res.status(400).json(response);
                return;
            }

            const chatbotSession = await this.chatbotSessionService.getChatbotSessionById(id);

            response = {
                status: 200,
                message: "ChatbotSession retrieved successfully",
                data: chatbotSession!,
            };
            
            res.status(200).json(response);

        }


        catch (error) {

            if(error instanceof Error && error.message.includes('not found')) {
                response = {
                    status: 404,
                    message: error.message,
                };
                res.status(404).json(response);
                return;
            }

            const message = (error instanceof Error) ? error.message : 'Unknown error';

            console.error('Error in getChatbotSessionById handler:', error);
            response = {
                status: 500,
                message: `Error retrieving ChatbotSession: ${message}`,
            };
            res.status(500).json(response);
        }

    }


    private async getAllChatbotSessionsByUserId(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<ChatbotSessionDTO[]>;

        try {
            const user_id = parseInt(req.params.user_id);
            if (isNaN(user_id) || user_id <= 0) {
                response = {
                    status: 400,
                    message: "ID must be a positive number",
                };
                res.status(400).json(response);
                return;
            }

            const chatbotSessions = await this.chatbotSessionService.getAllChatbotSessionsByUserId(user_id);

            response = {
                status: 200,
                message: "ChatbotSessions retrieved successfully",
                data: chatbotSessions,
            };

            res.status(200).json(response);
        }

        catch (error) {

            if(error instanceof Error && error.message.includes('not found')) {
                response = {
                    status: 404,
                    message: error.message,
                };
                res.status(404).json(response);
                return;
            }

            const message = (error instanceof Error) ? error.message : 'Unknown error';

            console.error('Error in getAllChatbotSessionsByUserId handler:', error);
            response = {
                status: 500,
                message: `Error retrieving ChatbotSessions by user ID: ${message}`,
            };
            res.status(500).json(response);
        }

    }


    private async getAllChatbotSessions(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<ChatbotSessionDTO[]>;

        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

            if ((limit !== undefined && (isNaN(limit) || limit < 0)) ||
                (offset !== undefined && (isNaN(offset) || offset < 0))) {
                response = {
                    status: 400,
                    message: "Limit and offset must be non-negative numbers",
                };
                res.status(400).json(response);
                return;
            }

            const chatbotSessions = await this.chatbotSessionService.getAllChatbotSessions(limit, offset);

            response = {
                status: 200,
                message: "ChatbotSessions retrieved successfully",
                data: chatbotSessions,
            };

            res.status(200).json(response);
        }

        catch (error) {

            const message = (error instanceof Error) ? error.message : 'Unknown error';

            console.error('Error in getAllChatbotSessions handler:', error);
            response = {
                status: 500,
                message: `Error retrieving ChatbotSessions: ${message}`,
            };
            res.status(500).json(response);
        }

    }


    private async getByActiveSession(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<ChatbotSessionDTO[]|null>;

        try {
            const user_id = parseInt(req.params.user_id);
            if (isNaN(user_id) || user_id <= 0) {
                response = {
                    status: 400,
                    message: "ID must be a positive number",
                };
                res.status(400).json(response);
                return;
            }

            const chatbotSessions = await this.chatbotSessionService.getByActiveSession(user_id);

            response = {
                status: 200,
                message: "Active ChatbotSessions retrieved successfully",
                data: chatbotSessions,
            };

            res.status(200).json(response);
        }

        catch (error) {

            if (error instanceof Error && error.message.includes('not found')) {
                response = {
                    status: 404,
                    message: error.message,
                };
                res.status(404).json(response);
                return;
            }

            const message = (error instanceof Error) ? error.message : 'Unknown error';

            console.error('Error in getByActiveSession handler:', error);
            response = {
                status: 500,
                message: `Error retrieving active ChatbotSessions: ${message}`,
            };
            res.status(500).json(response);
        }

    }


    private async updateChatbotSession(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<ChatbotSessionDTO|null>;

        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                response = {
                    status: 400,
                    message: "Invalid ID",
                };
                res.status(400).json(response);
                return;
            }

            if(Object.keys(req.body).length === 0){
                response = {
                    status: 400,
                    message: "Is necessary to provide is_active to update",
                };
                res.status(400).json(response);
                return;
            }

            const providedFields = Object.keys(req.body);
            const invalid = invalidFields(providedFields, CHATBOTSESSIONS_UPDATE_FIELDS);

            if (invalid.length > 0) {
                response = {
                    status: 400,
                    message: `Invalid fields in request body: ${invalid.join(', ')}`,
                };
                res.status(400).json(response);
                return;
            }

            const updateChatbotSessionDTO: UpdateChatbotSessionDTO = req.body;
            
            const updatedChatbotSession = await this.chatbotSessionService.updateChatbotSession(id, updateChatbotSessionDTO);

            response = {
                status: 200,
                message: "ChatbotSession updated successfully",
                data: updatedChatbotSession,
            };

            res.status(200).json(response);
        }

        catch (error) {

            if(error instanceof Error && error.message.includes('not found')) {
                response = {
                    status: 404,
                    message: error.message,
                };
                res.status(404).json(response);
                return;
            }

            const message = (error instanceof Error) ? error.message : 'Unknown error';

            console.error('Error in updateChatbotSession handler:', error);
            response = {
                status: 500,
                message: `Error updating ChatbotSession: ${message}`,
            };
            res.status(500).json(response);
        }    
    }


    private async deleteChatbotSession(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<boolean>;

        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                response = {
                    status: 400,
                    message: "Invalid ID. Must be a positive number.",
                };
                res.status(400).json(response);
                return;
            }

            const deleted = await this.chatbotSessionService.deletechatbotSession(id);

            if(deleted){

                response = {
                    status: 200,
                    message: "ChatbotSession deleted successfully",
                    data: deleted,
                };
                res.status(200).json(response);
            }

            else{
                response = {
                    status: 404,
                    message: "ChatbotSession not found",
                    data: deleted,
                };
                res.status(404).json(response);
            }
    
        }

        catch (error) {

            const message = (error instanceof Error) ? error.message : 'Unknown error';

            response = {
                status: 500,
                message: `Error deleting ChatbotSession: ${message}`,
            };
            res.status(500).json(response);
        }

    }


    private async chat(req: Request, res: Response): Promise<void> {
        let response: ResponseDTO<{ message: string; botResponse: string }>;

        try {
            const sessionId = parseInt(req.params.sessionId);

            if (isNaN(sessionId) || sessionId <= 0) {
                response = {
                    status: 400,
                    message: 'Invalid session_id',
                };
                res.status(400).json(response);
                return;
            }

            const { message } = req.body;

            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                response = {
                    status: 400,
                    message: 'Message is required and must be a non-empty string',
                };
                res.status(400).json(response);
                return;
            }

            // Verify session exists
            const session = await this.chatbotSessionService.getChatbotSessionById(sessionId);
            if (!session) {
                response = {
                    status: 404,
                    message: 'ChatbotSession not found',
                };
                res.status(404).json(response);
                return;
            }

            // Save user message
            const userMessage = await this.chatbotMessageService.createChatbotMessage({
                session_id: sessionId,
                sender: 'user',
                message: message.trim(),
            });

            // Generate bot response using RAG
            const botResponseText = await this.ragService.generateResponse(sessionId, message.trim());

            // Save bot response
            const botMessage = await this.chatbotMessageService.createChatbotMessage({
                session_id: sessionId,
                sender: 'bot',
                message: botResponseText,
            });

            if(!session.title || session.title.trim() === ''){
                const newTitle = await this.ragService.generateTitle(message.trim());
                this.chatbotSessionService.updateChatbotSession(sessionId, {title: newTitle
            })
            .catch((err: any) => console.error("Error generando título en background:", err));
            }

            response = {
                status: 200,
                message: 'Chat response generated successfully',
                data: {
                    message: userMessage.message,
                    botResponse: botMessage.message,
                },
            };

            res.status(200).json(response);
        } catch (error) {
            const message = (error instanceof Error) ? error.message : 'Unknown error';
            console.error('Error in chat handler:', error);
            response = {
                status: 500,
                message: `Error generating chat response: ${message}`,
            };
            res.status(500).json(response);
        }
    }

    public getRouter(): Router {
        return this.router;
    }

}
