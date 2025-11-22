import Product from '../domain/product.model';
import ProductDTO from '../dto/product.dto';
import { Op, UniqueConstraintError, ValidationError, FindOptions, CreationAttributes} from 'sequelize';

export interface ProductRepositoryInterface {
    findById(id: number): Promise<ProductDTO | null>;
    findAll(limit?: number, offset?: number): Promise<ProductDTO[]>;
    create(productData: Omit<ProductDTO, 'id' | 'created_at'>): Promise<ProductDTO>;
    update(id: number, productData: Partial<Omit<ProductDTO, 'id' | 'created_at'>>): Promise<ProductDTO | null>;
    delete(id: number): Promise<boolean>;
    existsById(id: number): Promise<boolean>;
    findByNameLike(name: string): Promise<ProductDTO[]>;
}

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

  async findAll(limit?: number, offset?: number): Promise<ProductDTO[]> {
    try {
      const options: FindOptions = {
        order: [['created_at', 'DESC']]
      };
      if (limit !== undefined) options.limit = limit;
      if (offset !== undefined) options.offset = offset;
      
      const products = await Product.findAll(options);
      return products.map(p => p.get({ plain: true }) as ProductDTO);
    } catch (error) {
      console.error('Error findAll:', error);
      throw error;
    }
  }

  async findByNameLike(name: string): Promise<ProductDTO[]> {
    try {
      const products = await Product.findAll({
        where: { name: { [Op.like]: `%${name}%` } }
      });
      return products.map(p => p.get({ plain: true }) as ProductDTO);
    } catch (error) {
      console.error('Error findByNameLike:', error);
      throw error;
    }
  }

  async create(productData: Omit<ProductDTO, 'id' | 'created_at'>): Promise<ProductDTO> {
    try {
      const product = await Product.create(productData as CreationAttributes< InstanceType<typeof Product>>);
      return product.get({ plain: true }) as ProductDTO;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error(`Product with name "${productData.name}" already exists in database`);
      }
      if (error instanceof ValidationError) {
        throw new Error(`Database validation error: ${error.message}`);
      }
      console.error('Error create:', error);
      throw new Error('Error creating product in database');
    }
  }

  async update(id: number, productData: Partial<Omit<ProductDTO, 'id' | 'created_at'>>): Promise<ProductDTO | null> {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        return null;
      }
      
      await product.update(productData as Partial<InstanceType<typeof Product>>);
      return product.get({ plain: true }) as ProductDTO;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error(`Another product with that name already exists`);
      }
      if (error instanceof ValidationError) {
        throw new Error(`Database validation error: ${error.message}`);
      }
      console.error('Error update:', error);
      throw new Error('Error updating product in database');
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const deletedCount = await Product.destroy({
        where: { id }
      });
      return deletedCount > 0;
    } catch (error) {
      console.error('Error delete:', error);
      throw new Error('Error deleting product from database');
    }
  }

  async count(): Promise<number> {
    try {
      return await Product.count();
    } catch (error) {
      console.error('Error count:', error);
      throw error;
    }
  }

  async existsById(id: number): Promise<boolean> {
    try {
      const count = await Product.count({ where: { id } });
      return count > 0;
    } catch (error) {
      console.error('Error existsById:', error);
      throw error;
    }
  }
}
