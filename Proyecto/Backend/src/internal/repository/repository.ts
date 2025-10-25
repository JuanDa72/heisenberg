import { ProductRepositoryInterface, ProductRepository } from "./product.repository";

export interface Repository {
    productRepository: ProductRepositoryInterface;
}

export const createRepository = (): Repository => {
    return {
        productRepository: new ProductRepository(),
    };
};