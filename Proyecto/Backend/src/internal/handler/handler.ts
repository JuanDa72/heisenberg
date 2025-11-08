import { ProductHandlerInterface, ProductHandler } from "./product.handler";
import { Service } from "../service/service";
import { UserHandler, userHandlerInterface } from "./user.handler";

export interface Handler {
    productHandler: ProductHandlerInterface;
    userHandler: userHandlerInterface;
}

export const createHandler = (service: Service): Handler => {

    // Initialize handlers
    const productHandler = new ProductHandler(service.productService);
    const userHandler = new UserHandler(service.userService);

    // Setup routes
    productHandler.setupRoutes();
    userHandler.setUpRoutes();

    return {
        productHandler,
        userHandler,
    };
};
