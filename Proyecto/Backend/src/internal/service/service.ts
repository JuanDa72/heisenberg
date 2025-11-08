import { ProductServiceInterface, ProductService } from "./product.service";
import { Repository } from "../repository/repository";
import { UserService, UserServiceInterface } from "./user.service";

export interface Service {
    productService: ProductServiceInterface;
    userService: UserServiceInterface;
}

export const createService = (repository: Repository): Service => {
    return {
        productService: new ProductService(repository.productRepository),
        userService: new UserService(repository.userRepository)
    };
};
