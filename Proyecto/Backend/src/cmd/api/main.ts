import { config } from 'dotenv';
import {sequelize} from '../../internal/config/database';

// Set environment variables
config();

import express, { json } from 'express';
import morgan from 'morgan';
import cors from 'cors';

import { createRepository } from '../../internal/repository/repository';
import { createService } from '../../internal/service/service';
import { createHandler } from '../../internal/handler/handler';

const app=express();

//Middleware
app.use(json());
app.use(morgan('common:date[web]'));
app.use(cors());


// Setup architecture
const repository = createRepository();
const service = createService(repository);
const handler = createHandler(service);

// Setup routes
app.use('/products', handler.productHandler.getRouter());

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

