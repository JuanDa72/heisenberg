import { ProductRepositoryInterface, ProductRepository } from "./product.repository";
import { UserRepositoryInterface, UserRepository } from "./user.repository";

export interface Repository {
    productRepository: ProductRepositoryInterface;
    userRepository: UserRepositoryInterface;
}

export const createRepository = (): Repository => {
    return {
        productRepository: new ProductRepository(),
        userRepository: new UserRepository(),
    };
};