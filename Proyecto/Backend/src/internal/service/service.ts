import { ProductServiceInterface, ProductService } from "./product.service";
import { Repository } from "../repository/repository";
import { UserService, UserServiceInterface } from "./user.service";
import { ChatbotSessionService, ChatbotSessionServiceInterface } from "./chatbotSession.service";
import { ChatbotMessageService, ChatbotMessageServiceInterface } from "./chatbotMessage.service";
import { RAGService, RAGServiceInterface } from "./rag.service";
import { VectorStoreService } from "./vectorstore.service";

export interface Service {
    productService: ProductServiceInterface;
    userService: UserServiceInterface;
    chatbotSessionService: ChatbotSessionServiceInterface;
    chatbotMessageService: ChatbotMessageServiceInterface;
    ragService: RAGServiceInterface;
}

export const createService = (repository: Repository): Service => {
    // Crear instancia compartida de VectorStoreService
    const vectorStoreService = new VectorStoreService();
    
    return {
        productService: new ProductService(repository.productRepository, vectorStoreService),
        userService: new UserService(repository.userRepository),
        chatbotSessionService: new ChatbotSessionService(repository.chatbotSessionRepository, repository.userRepository),
        chatbotMessageService: new ChatbotMessageService(repository.chatbotMessageRepository, repository.chatbotSessionRepository),
        ragService: new RAGService(repository.productRepository, repository.chatbotMessageRepository),
    };
};
