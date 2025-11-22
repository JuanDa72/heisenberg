import { ProductHandlerInterface, ProductHandler } from "./product.handler";
import { Service } from "../service/service";
import { UserHandler, userHandlerInterface } from "./user.handler";
import { ChatbotSessionHandler, chatbotSessionHandlerInterface } from "./chatbotSession.handler";

export interface Handler {
    productHandler: ProductHandlerInterface;
    userHandler: userHandlerInterface;
    chatbotSessionHandler: chatbotSessionHandlerInterface;
}

export const createHandler = (service: Service): Handler => {

    // Initialize handlers
    const productHandler = new ProductHandler(service.productService);
    const userHandler = new UserHandler(service.userService);
    const chatbotSessionHandler = new ChatbotSessionHandler(service.chatbotSessionService);

    // Setup routes
    productHandler.setupRoutes();
    userHandler.setUpRoutes();
    chatbotSessionHandler.setUpRoutes();
    
    return {
        productHandler,
        userHandler,
        chatbotSessionHandler,
    };
};
