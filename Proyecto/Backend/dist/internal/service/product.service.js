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
exports.ProductService = void 0;
class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    getProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield this.productRepository.findById(id);
                if (!product) {
                    throw new Error(`Product with ID ${id} not found`);
                }
                return product;
            }
            catch (error) {
                console.error('Error getProduct:', error);
                throw error;
            }
        });
    }
    getAllProducts(limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.productRepository.findAll(limit, offset);
            }
            catch (error) {
                console.error('Error getAllProducts:', error);
                throw error;
            }
        });
    }
    createProduct(productData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.productRepository.create(productData);
            }
            catch (error) {
                console.error('Error createProduct:', error);
                throw error;
            }
        });
    }
    updateProduct(id, productData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify that product exists
                const existingProduct = yield this.productRepository.findById(id);
                if (!existingProduct) {
                    throw new Error(`Product with ID ${id} not found`);
                }
                const updatedProduct = yield this.productRepository.update(id, productData);
                if (!updatedProduct) {
                    throw new Error(`Error updating product with ID ${id}`);
                }
                return updatedProduct;
            }
            catch (error) {
                console.error('Error updateProduct:', error);
                throw error;
            }
        });
    }
    deleteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify that product exists before deleting
                const exists = yield this.productRepository.existsById(id);
                if (!exists) {
                    throw new Error(`Product with ID ${id} not found`);
                }
                return yield this.productRepository.delete(id);
            }
            catch (error) {
                console.error('Error deleteProduct:', error);
                throw error;
            }
        });
    }
}
exports.ProductService = ProductService;
