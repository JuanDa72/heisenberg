import { ProductServiceInterface, ProductService } from "./product.service";
import { Repository } from "../repository/repository";
import { UserService, UserServiceInterface } from "./user.service";
import { ChatbotSessionService, ChatbotSessionServiceInterface } from "./chatbotSession.service";

export interface Service {
    productService: ProductServiceInterface;
    userService: UserServiceInterface;
    chatbotSessionService: ChatbotSessionServiceInterface;
}

export const createService = (repository: Repository): Service => {
    return {
        productService: new ProductService(repository.productRepository),
        userService: new UserService(repository.userRepository),
        chatbotSessionService: new ChatbotSessionService(repository.chatbotSessionRepository, repository.userRepository),
    };
};
