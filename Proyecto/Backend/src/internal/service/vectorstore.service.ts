import { OpenAIEmbeddings } from '@langchain/openai';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { Document } from '@langchain/core/documents';
import * as fs from 'fs';
import * as path from 'path';
import ProductDTO from '../dto/product.dto';
import { DocumentService } from './document.service';

export interface VectorStoreServiceInterface {
    initializeVectorStore(documents: Document[]): Promise<FaissStore>;
    loadVectorStore(vectorStorePath: string): Promise<FaissStore | null>;
    saveVectorStore(vectorStore: FaissStore, vectorStorePath: string): Promise<void>;
    syncProductsToVectorStore(products: ProductDTO[]): Promise<FaissStore>;
    getOrCreateVectorStore(products: ProductDTO[], vectorStorePath: string): Promise<FaissStore>;
}

export class VectorStoreService implements VectorStoreServiceInterface {
    private embeddings: OpenAIEmbeddings;
    private documentService: DocumentService;
    
    constructor() {
        // Initialize OpenAI embeddings with text-embedding-3-small model
        this.embeddings = new OpenAIEmbeddings({
            modelName: 'text-embedding-3-small',
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        this.documentService = new DocumentService();
    }
    
    /**
     * Initialize a new FAISS vector store from documents
     */
    async initializeVectorStore(documents: Document[]): Promise<FaissStore> {
        if (documents.length === 0) {
            throw new Error('Cannot initialize vector store with empty documents');
        }
        
        // Create FAISS vector store from documents
        const vectorStore = await FaissStore.fromDocuments(documents, this.embeddings);
        return vectorStore;
    }
    
    /**
     * Load an existing FAISS vector store from disk
     */
    async loadVectorStore(vectorStorePath: string): Promise<FaissStore | null> {
        try {
            // Check if the directory exists
            const dir = path.dirname(vectorStorePath);
            if (!fs.existsSync(dir)) {
                return null;
            }
            
            // Check if the index file exists
            const indexPath = vectorStorePath;
            if (!fs.existsSync(indexPath)) {
                return null;
            }
            
            // Load the vector store
            const vectorStore = await FaissStore.load(vectorStorePath, this.embeddings);
            return vectorStore;
        } catch (error) {
            console.error('Error loading vector store:', error);
            return null;
        }
    }
    
    /**
     * Save a FAISS vector store to disk
     */
    async saveVectorStore(vectorStore: FaissStore, vectorStorePath: string): Promise<void> {
        try {
            // Ensure directory exists
            const dir = path.dirname(vectorStorePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Save the vector store
            await vectorStore.save(vectorStorePath);
        } catch (error) {
            console.error('Error saving vector store:', error);
            throw error;
        }
    }
    
    /**
     * Sync products from MySQL to vector store
     * Transforms products to documents, creates/updates vector store
     */
    async syncProductsToVectorStore(products: ProductDTO[]): Promise<FaissStore> {
        // Transform products to documents
        const documents = this.documentService.transformProductsToDocuments(products);
        
        // Create new vector store from documents
        const vectorStore = await this.initializeVectorStore(documents);
        
        return vectorStore;
    }
    
    /**
     * Get existing vector store or create new one from products
     */
    async getOrCreateVectorStore(products: ProductDTO[], vectorStorePath: string): Promise<FaissStore> {
        // Try to load existing vector store
        const existingVectorStore = await this.loadVectorStore(vectorStorePath);
        
        if (existingVectorStore) {
            return existingVectorStore;
        }
        
        // If not found, create new one from products
        console.log('Vector store not found, creating new one from products...');
        const newVectorStore = await this.syncProductsToVectorStore(products);
        
        // Save it for future use
        await this.saveVectorStore(newVectorStore, vectorStorePath);
        
        return newVectorStore;
    }
}

