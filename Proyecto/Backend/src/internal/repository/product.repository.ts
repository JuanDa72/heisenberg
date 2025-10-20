import Product from '../domain/product.model';
import ProductDTO from '../dto/product.dto';

export class ProductRepository {

  async findById(id: number): Promise<ProductDTO | null> {
    try {
      const product = await Product.findByPk(id);
      return product?.get({ plain: true }) as ProductDTO;
    } catch (error) {
      console.error('Error findById:', error);
      throw error;
    }
  }

}
