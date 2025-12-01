import { ChatOpenAI } from '@langchain/openai';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - LangChain types issue
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ProductRepositoryInterface } from '../repository/product.repository';
import { ChatbotMessageRepositoryInterface } from '../repository/chatbotMessage.repository';
import ChatbotMessageDTO from '../dto/chatbotMessage.dto';
import { VectorStoreService } from './vectorstore.service';
import * as path from 'path';

export interface RAGServiceInterface {
    generateResponse(sessionId: number, userMessage: string): Promise<string>;
    generateTitle(userMessage: string): Promise<string>;
}

export class RAGService implements RAGServiceInterface {

    private productRepository: ProductRepositoryInterface;
    private chatbotMessageRepository: ChatbotMessageRepositoryInterface;
    private vectorStoreService: VectorStoreService;
    private llm: ChatOpenAI;
    private vectorStorePath: string;

    constructor(
        productRepository: ProductRepositoryInterface,
        chatbotMessageRepository: ChatbotMessageRepositoryInterface
    ) {
        this.productRepository = productRepository;
        this.chatbotMessageRepository = chatbotMessageRepository;
        this.vectorStoreService = new VectorStoreService();
        
        // Initialize OpenAI with GPT-4 (best model)
        this.llm = new ChatOpenAI({
            modelName: 'gpt-4o',
            temperature: 0.7,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        
        // Set vector store path
        this.vectorStorePath = path.join(process.cwd(), 'data', 'vectorstore', 'faiss.index');
    }

    async generateResponse(sessionId: number, userMessage: string): Promise<string> {
        try {
            // 1. Get conversation history (last 15 messages)
            const conversationHistory = await this.chatbotMessageRepository.findBySessionId(sessionId, 15);
            
            // 2. Get or create vector store with products
            const allProducts = await this.productRepository.findAll();
            const vectorStore = await this.vectorStoreService.getOrCreateVectorStore(
                allProducts,
                this.vectorStorePath
            );
            
            // 3. Retrieve relevant documents based on user message using similarity search
            const relevantDocuments = await vectorStore.similaritySearch(userMessage, 5);
            
            // 5. Build context string from retrieved documents
            const contextString = this.buildContextFromDocuments(relevantDocuments);
            
            // 6. Build messages for LangChain
            const systemPrompt = this.getSystemPrompt() + '\n\n' + contextString;
            const messages: (SystemMessage | HumanMessage)[] = [
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
            
            // 7. Generate response using LangChain
            const response = await this.llm.invoke(messages);
            
            return response.content as string;
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }


    public async generateTitle(userMessage: string): Promise<string> {

        try {
            const prompt = `Eres un experto resumiendo intenciones de búsqueda.
            Genera un título MUY CORTO (máximo 5 palabras) que resuma el siguiente mensaje del usuario.
            El título debe ser descriptivo pero conciso.
            No uses comillas, ni puntos finales, ni prefijos como "Título:".
            Ejemplo entrada: "Me duele la cabeza y tengo fiebre" -> "Dolor de cabeza y fiebre"`;

            const response = await this.llm.invoke([
                new SystemMessage(prompt),
                new HumanMessage(userMessage)
            ]);

            let title= response.content.toString().trim();
            title = title.replace(/(^"|"$)/g, '');

            return title
        }

        catch (error) {
            console.error('Error generating title:', error);
            throw error;
        }

    }

    private buildContextFromDocuments(documents: any[]): string {
        let context = '';

        // Add product information from retrieved documents
        if (documents.length > 0) {
            context += 'PRODUCTOS RELEVANTES ENCONTRADOS:\n\n';
            documents.forEach((doc, index) => {
                context += `${index + 1}. ${doc.pageContent}\n\n`;
            });
        } else {
            context += 'No se encontraron productos relevantes para esta consulta.\n';
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
8. Si el usuario pregunta algo que se relacione con productos farmaceuticos o salud, indica que no estás diseñado para responder preguntas de este tipo.

Responde siempre en español y sé conciso pero informativo.`;
    }
}

