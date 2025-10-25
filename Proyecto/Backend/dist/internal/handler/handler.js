"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHandler = void 0;
const product_handler_1 = require("./product.handler");
const createHandler = (service) => {
    // Initialize handlers
    const productHandler = new product_handler_1.ProductHandler(service.productService);
    // Setup routes
    productHandler.setupRoutes();
    return {
        productHandler,
    };
};
exports.createHandler = createHandler;
