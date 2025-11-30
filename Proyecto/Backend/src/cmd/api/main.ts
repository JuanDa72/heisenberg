import { config } from 'dotenv';
import {sequelize} from '../../internal/config/database';

// Set environment variables
config();

import express, { json } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import '../../internal/config/passport';

import { createRepository } from '../../internal/repository/repository';
import { createService } from '../../internal/service/service';
import { createHandler } from '../../internal/handler/handler';
import { VectorStoreService } from '../../internal/service/vectorstore.service';
import * as path from 'path';

const app=express();

//Middleware
app.use(json());
app.use(morgan('common:date[web]'));
app.use(cors());
app.use(passport.initialize());


// Setup architecture
const repository = createRepository();
const service = createService(repository);
const handler = createHandler(service);

// Setup routes
app.use('/products', handler.productHandler.getRouter());
app.use('/users', handler.userHandler.getRouter());
app.use('/chatbot-sessions', handler.chatbotSessionHandler.getRouter());
app.use('/chatbot-messages', handler.chatbotMessageHandler.getRouter());

/**
 * Initializes the FAISS vector store with all products when the server starts
 */
async function initializeVectorStore(): Promise<void> {
    try {
        console.log('Initializing FAISS vector store...');
        
        // Get all products
        const allProducts = await service.productService.getAllProducts();
        
        // Skip initialization if there are no products
        if (allProducts.length === 0) {
            console.log('No products found. Vector store initialization skipped. It will be created when products are added.');
            return;
        }
        
        // Create VectorStoreService instance
        const vectorStoreService = new VectorStoreService();
        const vectorStorePath = path.join(process.cwd(), 'data', 'vectorstore', 'faiss.index');
        
        // Sync vector store with all products
        const vectorStore = await vectorStoreService.syncProductsToVectorStore(allProducts);
        
        // Save vector store to disk
        await vectorStoreService.saveVectorStore(vectorStore, vectorStorePath);
        
        console.log(`FAISS vector store initialized successfully with ${allProducts.length} products`);
    } catch (error) {
        // Log the error but allow the server to start
        console.error('Error initializing FAISS vector store:', error);
        console.log('Server will continue starting, but vector store was not updated');
    }
}

// Start server
async function main():Promise<void>{
    try {
        await sequelize.sync();
        await initializeVectorStore();
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server running on port ${process.env.PORT || 3000}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

main();