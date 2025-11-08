import { ProductRepositoryInterface } from '../repository/product.repository'
import ProductDTO, { CreateProductDTO, UpdateProductDTO } from '../dto/product.dto';

export interface ProductServiceInterface {
  getProduct(id: number): Promise<ProductDTO>;
  getAllProducts(limit?: number, offset?: number): Promise<ProductDTO[]>;
  createProduct(productData: CreateProductDTO): Promise<ProductDTO>;
  updateProduct(id: number, productData: UpdateProductDTO): Promise<ProductDTO>;
  deleteProduct(id: number): Promise<boolean>;
  findByNameLike(name: string): Promise<ProductDTO[]>;
}

export class ProductService implements ProductServiceInterface {
  
  private productRepository: ProductRepositoryInterface;
  
  constructor(productRepository: ProductRepositoryInterface) {
    this.productRepository = productRepository;
  }

  async getProduct(id: number): Promise<ProductDTO> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      console.error('Error getProduct:', error);
      throw error;
    }
  }

  async getAllProducts(limit?: number, offset?: number): Promise<ProductDTO[]> {
    try {
      return await this.productRepository.findAll(limit, offset);
    } catch (error) {
      console.error('Error getAllProducts:', error);
      throw error;
    }
  }

  async createProduct(productData: CreateProductDTO): Promise<ProductDTO> {
    try {
      return await this.productRepository.create(productData);
    } catch (error) {
      console.error('Error createProduct:', error);
      throw error;
    }
  }

  async updateProduct(id: number, productData: UpdateProductDTO): Promise<ProductDTO> {
    try {
      // Verify that product exists
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new Error(`Product with ID ${id} not found`);
      }

      const updatedProduct = await this.productRepository.update(id, productData);
      if (!updatedProduct) {
        throw new Error(`Error updating product with ID ${id}`);
      }

      return updatedProduct;
    } catch (error) {
      console.error('Error updateProduct:', error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      // Verify that product exists before deleting
      const exists = await this.productRepository.existsById(id);
      if (!exists) {
        throw new Error(`Product with ID ${id} not found`);
      }

      return await this.productRepository.delete(id);
    } catch (error) {
      console.error('Error deleteProduct:', error);
      throw error;
    }
  }


  async findByNameLike(name: string): Promise<ProductDTO[]> {

    try {
      const results = await this.productRepository.findByNameLike(name);
      if (results.length === 0) {
        throw new Error(`Product with name "${name}" not found`);
      }
      return results;
    } catch (error) {
      console.error('Error findByNameLike:', error);
      throw error;
    }
  }

  
}
