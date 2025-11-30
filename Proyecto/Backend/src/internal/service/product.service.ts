import { ProductRepositoryInterface } from '../repository/product.repository'
import ProductDTO, { CreateProductDTO, UpdateProductDTO } from '../dto/product.dto';
import { VectorStoreService } from './vectorstore.service';
import * as path from 'path';

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
  private vectorStoreService: VectorStoreService;
  private vectorStorePath: string;
  
  constructor(productRepository: ProductRepositoryInterface, vectorStoreService?: VectorStoreService) {
    this.productRepository = productRepository;
    this.vectorStoreService = vectorStoreService || new VectorStoreService();
    this.vectorStorePath = path.join(process.cwd(), 'data', 'vectorstore', 'faiss.index');
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
      const newProduct = await this.productRepository.create(productData);
      
      // Update vector store asynchronously (does not block the response)
      this.updateVectorStore().catch(err => 
        console.error('Error updating vector store after creating product:', err)
      );
      
      return newProduct;
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

      // Update vector store asynchronously (does not block the response)
      this.updateVectorStore().catch(err => 
        console.error('Error updating vector store after updating product:', err)
      );

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

      const deleted = await this.productRepository.delete(id);
      
      if (deleted) {
        // Update vector store asynchronously (does not block the response)
        this.updateVectorStore().catch(err => 
          console.error('Error updating vector store after deleting product:', err)
        );
      }

      return deleted;
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

  /**
   * Updates the FAISS vector store with all current products
   * This method runs asynchronously and does not block HTTP operations
   */
  private async updateVectorStore(): Promise<void> {
    try {
      // Get all products
      const allProducts = await this.productRepository.findAll();
      
      // Sync vector store with all products
      const vectorStore = await this.vectorStoreService.syncProductsToVectorStore(allProducts);
      
      // Save vector store to disk
      await this.vectorStoreService.saveVectorStore(vectorStore, this.vectorStorePath);
      
      console.log('FAISS vector store updated successfully');
    } catch (error) {
      // Log the error but don't fail the operation
      console.error('Error updating FAISS vector store:', error);
    }
  }
  
}
