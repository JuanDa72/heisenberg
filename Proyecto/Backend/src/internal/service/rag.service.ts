import { ChatOpenAI } from '@langchain/openai';
// @ts-ignore - LangChain types issue
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ProductRepositoryInterface } from '../repository/product.repository';
import { ChatbotMessageRepositoryInterface } from '../repository/chatbotMessage.repository';
import ProductDTO from '../dto/product.dto';
import ChatbotMessageDTO from '../dto/chatbotMessage.dto';
import { Op } from 'sequelize';

export interface RAGServiceInterface {
    generateResponse(sessionId: number, userMessage: string): Promise<string>;
}

export class RAGService implements RAGServiceInterface {

    private productRepository: ProductRepositoryInterface;
    private chatbotMessageRepository: ChatbotMessageRepositoryInterface;
    private llm: ChatOpenAI;

    constructor(
        productRepository: ProductRepositoryInterface,
        chatbotMessageRepository: ChatbotMessageRepositoryInterface
    ) {
        this.productRepository = productRepository;
        this.chatbotMessageRepository = chatbotMessageRepository;
        
        // Initialize OpenAI with GPT-4 (best model)
        this.llm = new ChatOpenAI({
            modelName: 'gpt-4o',
            temperature: 0.7,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateResponse(sessionId: number, userMessage: string): Promise<string> {
        try {
            // 1. Get conversation history (last 15 messages)
            const conversationHistory = await this.chatbotMessageRepository.findBySessionId(sessionId, 15);
            
            // 2. Extract keywords from user message for product search
            const keywords = this.extractKeywords(userMessage);
            
            // 3. Search for relevant products
            const relevantProducts = await this.searchRelevantProducts(keywords);
            
            // 4. Build context string
            const contextString = this.buildContextString(conversationHistory, relevantProducts);
            
            // 5. Build messages for LangChain
            const systemPrompt = this.getSystemPrompt() + '\n\n' + contextString;
            const messages = [
                new SystemMessage(systemPrompt),
            ];
            
            // Add conversation history
            conversationHistory.forEach(msg => {
                if (msg.sender === 'user') {
                    messages.push(new HumanMessage(msg.message));
                } else {
                    messages.push(new HumanMessage(`Asistente: ${msg.message}`));
                }
            });
            
            // Add current user message
            messages.push(new HumanMessage(userMessage));
            
            // 6. Generate response using LangChain
            const response = await this.llm.invoke(messages);
            
            return response.content as string;
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    private extractKeywords(message: string): string[] {
        // Simple keyword extraction - split by spaces and filter common words
        const commonWords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'para', 'con', 'por', 'que', 'es', 'son', 'estoy', 'tengo', 'necesito', 'quiero', 'busco', 'me', 'te', 'le', 'nos', 'os', 'les'];
        const words = message.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.includes(word));
        
        return [...new Set(words)]; // Remove duplicates
    }

    private async searchRelevantProducts(keywords: string[]): Promise<ProductDTO[]> {
        if (keywords.length === 0) {
            // If no keywords, return all products (limited)
            return await this.productRepository.findAll(10);
        }

        // Search products by name, type, or use_case
        const allProducts: ProductDTO[] = [];
        const seenIds = new Set<number>();

        for (const keyword of keywords) {
            // Search by name
            const byName = await this.productRepository.findByNameLike(keyword);
            for (const product of byName) {
                if (!seenIds.has(product.id)) {
                    allProducts.push(product);
                    seenIds.add(product.id);
                }
            }
        }

        // If no products found, return all products (limited)
        if (allProducts.length === 0) {
            return await this.productRepository.findAll(10);
        }

        // Limit to 10 most relevant products
        return allProducts.slice(0, 10);
    }

    private buildContextString(history: ChatbotMessageDTO[], products: ProductDTO[]): string {
        let context = '';

        // Add product information
        if (products.length > 0) {
            context += 'PRODUCTOS DISPONIBLES:\n';
            products.forEach(product => {
                context += `- ${product.name} (${product.type})\n`;
                context += `  Uso: ${product.use_case}\n`;
                context += `  Advertencias: ${product.warnings}\n`;
                context += `  Contraindicaciones: ${product.contraindications}\n`;
                context += `  Precio: $${product.price}\n`;
                context += `  Stock: ${product.stock}\n\n`;
            });
        }

        return context;
    }


    private getSystemPrompt(): string {
        return `Eres un asistente farmacéutico experto. Tu función es ayudar a los usuarios a encontrar productos farmacéuticos adecuados para sus necesidades.

INSTRUCCIONES:
1. Usa el contexto de productos proporcionado para hacer recomendaciones específicas.
2. Siempre menciona el nombre exacto del producto cuando recomiendes algo.
3. Incluye información relevante sobre uso, advertencias y contraindicaciones cuando sea apropiado.
4. Si un usuario pregunta sobre algo que no está en los productos disponibles, sé honesto y sugiere que consulten con un profesional de la salud.
5. Mantén un tono profesional pero amigable.
6. Si hay contexto de conversación previa, úsalo para dar respuestas más contextuales.
7. Cuando recomiendes productos, menciona el precio y disponibilidad si es relevante.

Responde siempre en español y sé conciso pero informativo.`;
    }
}

