import { ProductServiceInterface, ProductService } from "./product.service";
import { Repository } from "../repository/repository";

export interface Service {
    productService: ProductServiceInterface;
}

export const createService = (repository: Repository): Service => {
    return {
        productService: new ProductService(repository.productRepository),
    };
};
