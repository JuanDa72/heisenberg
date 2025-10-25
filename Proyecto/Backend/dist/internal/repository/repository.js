"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepository = void 0;
const product_repository_1 = require("./product.repository");
const createRepository = () => {
    return {
        productRepository: new product_repository_1.ProductRepository(),
    };
};
exports.createRepository = createRepository;
