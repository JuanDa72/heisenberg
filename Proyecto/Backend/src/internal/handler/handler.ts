import { ProductHandlerInterface, ProductHandler } from "./product.handler";
import { Service } from "../service/service";

export interface Handler {
    productHandler: ProductHandlerInterface;
}

export const createHandler = (service: Service): Handler => {

    // Initialize handlers
    const productHandler = new ProductHandler(service.productService);

    // Setup routes
    productHandler.setupRoutes();
    
    return {
        productHandler,
    };
};
