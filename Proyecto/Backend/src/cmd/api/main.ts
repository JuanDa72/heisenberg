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

// Start server
async function main():Promise<void>{
    try {
        await sequelize.sync({ alter: true});
        app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on port ${process.env.PORT || 3000}`);
        });

    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }

}

main();

