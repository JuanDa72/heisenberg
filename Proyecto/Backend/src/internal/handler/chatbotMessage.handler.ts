import { Router, Request, Response } from 'express';
import { ChatbotMessageServiceInterface } from '../service/chatbotMessage.service';
import ChatbotMessageDTO, { CreateChatbotMessageDTO, UpdateChatbotMessageDTO } from '../dto/chatbotMessage.dto';
import ResponseDTO from '../dto/response.dto';

const CHATBOTMESSAGE_UPDATE_FIELDS = ['message'];


function invalidFields(providedFields: string[], allowedFields: string[]): string[] {
    return providedFields.filter(
        key => !allowedFields.includes(key)
    );
}

export interface ChatbotMessageHandlerInterface {
    setUpRoutes(): void;
    getRouter(): Router;
    setRAGService(ragService: any): void;
}

export class ChatbotMessageHandler implements ChatbotMessageHandlerInterface {

    private chatbotMessageService: ChatbotMessageServiceInterface;
    private router: Router;
    private ragService: any;

    constructor(chatbotMessageService: ChatbotMessageServiceInterface) {
        this.chatbotMessageService = chatbotMessageService;
        this.router = Router();
    }

    setRAGService(ragService: any): void {
        this.ragService = ragService;
    }

    setUpRoutes(): void {
        this.router.get('/session/:sessionId', this.getMessagesBySessionId.bind(this));
        this.router.get('/:id', this.getChatbotMessageById.bind(this));
        this.router.post('/', this.createChatbotMessage.bind(this));
        this.router.put('/:id/regenerate', this.editMessageAndGenerateResponse.bind(this));
        this.router.put('/:id', this.updateChatbotMessage.bind(this));
        this.router.delete('/:id', this.deleteChatbotMessage.bind(this));
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

    private async updateChatbotMessage(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<ChatbotMessageDTO | null>;

        try {
            const id = parseInt(req.params.id);

            if(isNaN(id) || id <= 0){
                response = {
                    status: 400,
                    message: 'Invalid ID',
                };
                res.status(400).json(response);
                return;
            }

            if(Object.keys(req.body).length === 0){
                response = {
                    status: 400,
                    message: 'No fields provided for update',
                };
                res.status(400).json(response);
                return;
            }

            const invalidUpdateFields = invalidFields(Object.keys(req.body), CHATBOTMESSAGE_UPDATE_FIELDS);
            
            if(invalidUpdateFields.length > 0){ 
                response = {
                    status: 400,
                    message: `Invalid fields for update: ${invalidUpdateFields.join(', ')}`,
                };
                res.status(400).json(response);
                return;
            }

            const updateData: UpdateChatbotMessageDTO = req.body;

            const updatedMessage = await this.chatbotMessageService.updateChatbotMessage(id, updateData);

            response = {
                status: 200,
                message: 'ChatbotMessage updated successfully',
                data: updatedMessage,
            };

            res.status(200).json(response);
        }

        catch (error) {

            if(error instanceof Error && error.message.includes('not found')){
                response = {
                    status: 404,
                    message: error.message,
                };
                res.status(404).json(response);
                return;
            }

            const message = (error instanceof Error) ? error.message : 'Unknown error';
            console.error('Error in updateChatbotMessage handler:', error);
            response = {
                status: 500,
                message: `Error updating ChatbotMessage: ${message}`,
            };
            res.status(500).json(response);
        }

    }


    private async deleteChatbotMessage(req: Request, res: Response): Promise<void> {
        
        let response: ResponseDTO<boolean>;
        try {
            const id = parseInt(req.params.id);
            
            if(isNaN(id) || id <= 0){ 
                response = {
                    status: 400,
                    message: 'Invalid ID',
                };
                res.status(400).json(response);
                return;
            }
            
            const result = await this.chatbotMessageService.deleteChatbotMessage(id);

            response = {
                status: 200,
                message: 'ChatbotMessage deleted successfully',
                data: result,
            };

            res.status(200).json(response);
        } 
        
        catch (error) {
            const message = (error instanceof Error) ? error.message : 'Unknown error';
            console.error('Error in deleteChatbotMessage handler:', error);
            response = {
                status: 500,
                message: `Error deleting ChatbotMessage: ${message}`,
            };
            res.status(500).json(response);
        }
    }

    private async editMessageAndGenerateResponse(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<{message: string, botResponse: string}>;

        try {
            const messageId= parseInt(req.params.id);

            if(isNaN(messageId) || messageId <= 0){
                response = {
                    status: 400,
                    message: 'Invalid message ID',
                };
                res.status(400).json(response);
                return;
            }

            const currentMessage = await this.chatbotMessageService.getChatbotMessageById(messageId);

            if(!currentMessage){
                response = {
                    status: 404,
                    message: 'ChatbotMessage not found',
                };
                res.status(404).json(response);
                return;
            }
            
            console.log('Current Message:', currentMessage); 

            const newMessageContent: string = req.body.message;

            if(!newMessageContent || newMessageContent.trim() === ''){
                response = {
                    status: 400,
                    message: 'New message content is required',
                };
                res.status(400).json(response);
                return;
            }

            console.log('New Message Content:', newMessageContent);

            const updateData: UpdateChatbotMessageDTO = { message: newMessageContent };
            
            const updatedMessage = await this.chatbotMessageService.updateChatbotMessage(messageId, updateData);

            if(!updatedMessage){
                response = {
                    status: 500,
                    message: 'Failed to update ChatbotMessage',
                };
                res.status(500).json(response);
                return;
            }

            console.log("Mensaje actualizado:", updatedMessage);


            //Eliminar todos los mensajes posteriores a este en la sesion
            await this.chatbotMessageService.deleteChatbotMessagesFromDate(
                updatedMessage.session_id,
                new Date(currentMessage.created_at)
            );

            //Llamar al rag
            const botResponse = await this.ragService.generateResponse(
                updatedMessage.session_id,
                newMessageContent
            );

            const newBotResponseMessage: CreateChatbotMessageDTO = {
                session_id: updatedMessage.session_id,
                sender: 'bot',
                message: botResponse,
            };

            console.log("Generando mensaje de respuesta del bot:", newBotResponseMessage);

            await this.chatbotMessageService.createChatbotMessage(newBotResponseMessage);

            response = {
                status: 200,
                message: 'Message updated and bot response generated successfully',
                data: {
                    message: updatedMessage.message,
                    botResponse: botResponse,
                },
            };

            res.status(200).json(response);

        }

        catch (error) {
            const message = (error instanceof Error) ? error.message : 'Unknown error';
            console.error('Error in editMessageAndGenerateResponse handler:', error);
            response = {
                status: 500,
                message: `Error processing request: ${message}`,
            };

            res.status(response.status).json(response);
        }
    }


    public getRouter(): Router {
        return this.router;
    }
}

