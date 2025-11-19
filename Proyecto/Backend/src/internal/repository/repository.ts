import { ChatbotSessionRepository, ChatbotSessionRepositoryInterface } from "./chatbotSession.repository";
import { ProductRepositoryInterface, ProductRepository } from "./product.repository";
import { UserRepositoryInterface, UserRepository } from "./user.repository";
import { ChatbotMessageRepository, ChatbotMessageRepositoryInterface } from "./chatbotMessage.repository";

export interface Repository {
    productRepository: ProductRepositoryInterface;
    userRepository: UserRepositoryInterface;
    chatbotSessionRepository: ChatbotSessionRepositoryInterface;
    chatbotMessageRepository: ChatbotMessageRepositoryInterface;
}

export const createRepository = (): Repository => {
    return {
        productRepository: new ProductRepository(),
        userRepository: new UserRepository(),
        chatbotSessionRepository: new ChatbotSessionRepository(),
        chatbotMessageRepository: new ChatbotMessageRepository(),
    };
};