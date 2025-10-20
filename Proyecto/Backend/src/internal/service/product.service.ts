import { ProductRepository } from '../repository/product.repository';
import ProductDTO from '../dto/product.dto';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async getProduct(id: number): Promise<ProductDTO> {
    try {
      const product = await this.repository.findById(id);
      return product!;
    } catch (error) {
      console.error('Error getProduct:', error);
      throw error;
    }
  }
}
