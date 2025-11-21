import { Router, Request, Response } from 'express';
import { ChatbotMessageServiceInterface } from '../service/chatbotMessage.service';
import ChatbotMessageDTO, { CreateChatbotMessageDTO } from '../dto/chatbotMessage.dto';
import ResponseDTO from '../dto/response.dto';

export interface ChatbotMessageHandlerInterface {
    setUpRoutes(): void;
    getRouter(): Router;
}

export class ChatbotMessageHandler implements ChatbotMessageHandlerInterface {

    private chatbotMessageService: ChatbotMessageServiceInterface;
    private router: Router;

    constructor(chatbotMessageService: ChatbotMessageServiceInterface) {
        this.chatbotMessageService = chatbotMessageService;
        this.router = Router();
    }

    setUpRoutes(): void {
        this.router.get('/session/:sessionId', this.getMessagesBySessionId.bind(this));
        this.router.get('/:id', this.getChatbotMessageById.bind(this));
        this.router.post('/', this.createChatbotMessage.bind(this));
    }

    private async createChatbotMessage(req: Request, res: Response): Promise<void> {
        let response: ResponseDTO<ChatbotMessageDTO>;

        try {
            const createChatbotMessageDTO: CreateChatbotMessageDTO = req.body;

            if (!createChatbotMessageDTO.session_id || !createChatbotMessageDTO.sender || !createChatbotMessageDTO.message) {
                response = {
                    status: 400,
                    message: 'session_id, sender, and message are required',
                };
                res.status(400).json(response);
                return;
            }

            if (isNaN(createChatbotMessageDTO.session_id) || createChatbotMessageDTO.session_id <= 0) {
                response = {
                    status: 400,
                    message: 'Invalid session_id',
                };
                res.status(400).json(response);
                return;
            }

            const chatbotMessage = await this.chatbotMessageService.createChatbotMessage(createChatbotMessageDTO);

            response = {
                status: 201,
                message: 'ChatbotMessage created successfully',
                data: chatbotMessage,
            };

            res.status(201).json(response);
        } catch (error) {
            const message = (error instanceof Error) ? error.message : 'Unknown error';
            console.error('Error in createChatbotMessage handler:', error);
            response = {
                status: 500,
                message: `Error creating ChatbotMessage: ${message}`,
            };
            res.status(500).json(response);
        }
    }

    private async getChatbotMessageById(req: Request, res: Response): Promise<void> {
        let response: ResponseDTO<ChatbotMessageDTO>;

        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                response = {
                    status: 400,
                    message: 'Invalid ID',
                };
                res.status(400).json(response);
                return;
            }

            const chatbotMessage = await this.chatbotMessageService.getChatbotMessageById(id);

            if (!chatbotMessage) {
                response = {
                    status: 404,
                    message: 'ChatbotMessage not found',
                };
                res.status(404).json(response);
                return;
            }

            response = {
                status: 200,
                message: 'ChatbotMessage retrieved successfully',
                data: chatbotMessage,
            };

            res.status(200).json(response);
        } catch (error) {
            const message = (error instanceof Error) ? error.message : 'Unknown error';
            console.error('Error in getChatbotMessageById handler:', error);
            response = {
                status: 500,
                message: `Error retrieving ChatbotMessage: ${message}`,
            };
            res.status(500).json(response);
        }
    }

    private async getMessagesBySessionId(req: Request, res: Response): Promise<void> {
        let response: ResponseDTO<ChatbotMessageDTO[]>;

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

            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            if (limit !== undefined && (isNaN(limit) || limit < 0)) {
                response = {
                    status: 400,
                    message: 'Limit must be a non-negative number',
                };
                res.status(400).json(response);
                return;
            }

            const messages = await this.chatbotMessageService.getMessagesBySessionId(sessionId, limit);

            response = {
                status: 200,
                message: 'Messages retrieved successfully',
                data: messages,
            };

            res.status(200).json(response);
        } catch (error) {
            const message = (error instanceof Error) ? error.message : 'Unknown error';
            console.error('Error in getMessagesBySessionId handler:', error);
            response = {
                status: 500,
                message: `Error retrieving messages: ${message}`,
            };
            res.status(500).json(response);
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}

