import { ProductHandlerInterface, ProductHandler } from "./product.handler";
import { Service } from "../service/service";
import { UserHandler, userHandlerInterface } from "./user.handler";
import { ChatbotSessionHandler, chatbotSessionHandlerInterface } from "./chatbotSession.handler";
import { ChatbotMessageHandler, ChatbotMessageHandlerInterface } from "./chatbotMessage.handler";

export interface Handler {
    productHandler: ProductHandlerInterface;
    userHandler: userHandlerInterface;
    chatbotSessionHandler: chatbotSessionHandlerInterface;
    chatbotMessageHandler: ChatbotMessageHandlerInterface;
}

export const createHandler = (service: Service): Handler => {

    // Initialize handlers
    const productHandler = new ProductHandler(service.productService);
    const userHandler = new UserHandler(service.userService);
    const chatbotSessionHandler = new ChatbotSessionHandler(service.chatbotSessionService);
    const chatbotMessageHandler = new ChatbotMessageHandler(service.chatbotMessageService);

    // Setup RAG and message services for chatbot session handler
    chatbotSessionHandler.setRAGService(service.ragService);
    chatbotSessionHandler.setChatbotMessageService(service.chatbotMessageService);

    chatbotMessageHandler.setRAGService(service.ragService);

    // Setup routes
    productHandler.setupRoutes();
    userHandler.setUpRoutes();
    chatbotSessionHandler.setUpRoutes();
    chatbotMessageHandler.setUpRoutes();
    
    return {
        productHandler,
        userHandler,
        chatbotSessionHandler,
        chatbotMessageHandler,
    };
};
