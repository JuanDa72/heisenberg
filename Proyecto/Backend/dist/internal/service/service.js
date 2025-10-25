"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createService = void 0;
const product_service_1 = require("./product.service");
const createService = (repository) => {
    return {
        productService: new product_service_1.ProductService(repository.productRepository),
    };
};
exports.createService = createService;
