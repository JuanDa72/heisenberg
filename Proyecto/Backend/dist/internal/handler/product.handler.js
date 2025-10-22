"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductHandler = void 0;
const express_1 = require("express");
class ProductHandler {
    constructor(productService) {
        this.productService = productService;
        this.router = (0, express_1.Router)();
    }
    setupRoutes() {
        this.router.get('/', this.getAllProducts.bind(this));
        this.router.get('/:id', this.getProductById.bind(this));
        this.router.post('/', this.createProduct.bind(this));
        this.router.put('/:id', this.updateProduct.bind(this));
        this.router.delete('/:id', this.deleteProduct.bind(this));
    }
    // GET /products - Get all products with pagination
    getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            try {
                const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
                const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
                // Validate pagination
                if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
                    response = {
                        status: 400,
                        message: 'Limit parameter must be a number between 1 and 100',
                    };
                    res.status(400).json(response);
                    return;
                }
                if (offset !== undefined && (isNaN(offset) || offset < 0)) {
                    response = {
                        status: 400,
                        message: 'Offset parameter must be a number greater than or equal to 0',
                    };
                    res.status(400).json(response);
                    return;
                }
                const products = yield this.productService.getAllProducts(limit, offset);
                response = {
                    status: 200,
                    message: `Products found: ${products.length}`,
                    data: products,
                };
                res.status(200).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                response = {
                    status: 500,
                    message: `Error getting products: ${errorMessage}`,
                };
                res.status(500).json(response);
            }
        });
    }
    // GET /products/:id - Get product by ID
    getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            try {
                const id = parseInt(req.params.id);
                // Validate ID
                if (isNaN(id) || id <= 0) {
                    response = {
                        status: 400,
                        message: 'Invalid ID. Must be a positive integer',
                    };
                    res.status(400).json(response);
                    return;
                }
                const product = yield this.productService.getProduct(id);
                response = {
                    status: 200,
                    message: 'Product found',
                    data: product,
                };
                res.status(200).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                // If error is "not found", return 404
                if (errorMessage.includes('not found')) {
                    response = {
                        status: 404,
                        message: errorMessage,
                    };
                    res.status(404).json(response);
                    return;
                }
                response = {
                    status: 500,
                    message: `Error getting product: ${errorMessage}`,
                };
                res.status(500).json(response);
            }
        });
    }
    // POST /products - Create a new product
    createProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            try {
                const productData = req.body;
                const newProduct = yield this.productService.createProduct(productData);
                response = {
                    status: 201,
                    message: 'Product created successfully',
                    data: newProduct,
                };
                res.status(201).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                // If error is business validation, return 400
                if (errorMessage.includes('already exists') ||
                    errorMessage.includes('cannot exceed') ||
                    errorMessage.includes('cannot be before')) {
                    response = {
                        status: 400,
                        message: errorMessage,
                    };
                    res.status(400).json(response);
                    return;
                }
                response = {
                    status: 500,
                    message: `Error creating product: ${errorMessage}`,
                };
                res.status(500).json(response);
            }
        });
    }
    // PUT /products/:id - Update an existing product
    updateProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            try {
                const id = parseInt(req.params.id);
                // Validate ID
                if (isNaN(id) || id <= 0) {
                    response = {
                        status: 400,
                        message: 'Invalid ID. Must be a positive integer',
                    };
                    res.status(400).json(response);
                    return;
                }
                // Validate at least one field is provided
                if (Object.keys(req.body).length === 0) {
                    response = {
                        status: 400,
                        message: 'Must provide at least one field to update',
                    };
                    res.status(400).json(response);
                    return;
                }
                const productData = req.body;
                const updatedProduct = yield this.productService.updateProduct(id, productData);
                response = {
                    status: 200,
                    message: 'Product updated successfully',
                    data: updatedProduct,
                };
                res.status(200).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                // If error is "not found", return 404
                if (errorMessage.includes('not found')) {
                    response = {
                        status: 404,
                        message: errorMessage,
                    };
                    res.status(404).json(response);
                    return;
                }
                // If error is business validation, return 400
                if (errorMessage.includes('already exists') ||
                    errorMessage.includes('cannot exceed') ||
                    errorMessage.includes('cannot be before')) {
                    response = {
                        status: 400,
                        message: errorMessage,
                    };
                    res.status(400).json(response);
                    return;
                }
                response = {
                    status: 500,
                    message: `Error updating product: ${errorMessage}`,
                };
                res.status(500).json(response);
            }
        });
    }
    // DELETE /products/:id - Delete a product
    deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            try {
                const id = parseInt(req.params.id);
                // Validate ID
                if (isNaN(id) || id <= 0) {
                    response = {
                        status: 400,
                        message: 'Invalid ID. Must be a positive integer',
                    };
                    res.status(400).json(response);
                    return;
                }
                const deleted = yield this.productService.deleteProduct(id);
                if (deleted) {
                    response = {
                        status: 200,
                        message: 'Product deleted successfully',
                    };
                    res.status(200).json(response);
                }
                else {
                    response = {
                        status: 404,
                        message: `Product with ID ${id} not found`,
                    };
                    res.status(404).json(response);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                // If error is "not found", return 404
                if (errorMessage.includes('not found')) {
                    response = {
                        status: 404,
                        message: errorMessage,
                    };
                    res.status(404).json(response);
                    return;
                }
                response = {
                    status: 500,
                    message: `Error deleting product: ${errorMessage}`,
                };
                res.status(500).json(response);
            }
        });
    }
    // Get router (encapsulation)
    getRouter() {
        return this.router;
    }
}
exports.ProductHandler = ProductHandler;
