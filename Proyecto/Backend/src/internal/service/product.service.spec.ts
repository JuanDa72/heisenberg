import { ProductRepositoryInterface } from '../repository/product.repository'
import ProductDTO, { CreateProductDTO } from '../dto/product.dto';
import { ProductService } from './product.service';

/**
 * Mock de ProductRepository
 * Implementa la interfaz ProductRepositoryInterface para testing
 */
class MockProductRepository implements ProductRepositoryInterface {
  findById = jest.fn();
  findAll = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  existsById = jest.fn();
  findByNameLike = jest.fn();
}

describe('ProductService', () => {
  let productService: ProductService;
  let mockRepository: MockProductRepository;

  // Datos de prueba
  const mockProduct: ProductDTO = {
    id: 1,
    name: 'Aspirin',
    type: 'Analgesic',
    use_case: 'Pain relief',
    warnings: 'May cause stomach upset',
    contraindications: 'Allergic to salicylates',
    expiration_date: '2025-12-31',
    price: 5.99,
    stock: 100,
    created_at: new Date('2024-01-01'),
  };

  const mockCreateProductData: CreateProductDTO = {
    name: 'Ibuprofen',
    type: 'NSAID',
    use_case: 'Inflammation and pain relief',
    warnings: 'May cause GI upset',
    contraindications: 'Kidney disease',
    expiration_date: '2025-11-30',
    price: 7.99,
    stock: 50,
  };

  beforeEach(() => {
    mockRepository = new MockProductRepository();
    productService = new ProductService(mockRepository);
    jest.clearAllMocks();
  });

  describe('getProduct', () => {
    it('should throw error when product is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(productService.getProduct(999)).rejects.toThrow(
        'Product with ID 999 not found'
      );
    });

    it('should return product when found', async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.getProduct(1);

      expect(result).toEqual(mockProduct);
    });

    it('should catch and re-throw repository errors', async () => {
      const repositoryError = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(repositoryError);

      await expect(productService.getProduct(1)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('getAllProducts', () => {
    it('should return array of products from repository', async () => {
      const products = [mockProduct, { ...mockProduct, id: 2, name: 'Ibuprofen' }];
      mockRepository.findAll.mockResolvedValue(products);

      const result = await productService.getAllProducts();

      expect(result).toEqual(products);
    });

    it('should catch and re-throw repository errors', async () => {
      const repositoryError = new Error('Database query failed');
      mockRepository.findAll.mockRejectedValue(repositoryError);

      await expect(productService.getAllProducts()).rejects.toThrow(
        'Database query failed'
      );
    });
  });

  describe('createProduct', () => {
    it('should return created product from repository', async () => {
      const createdProduct: ProductDTO = {
        ...mockCreateProductData,
        id: 1,
        created_at: new Date('2024-11-16'),
      };
      mockRepository.create.mockResolvedValue(createdProduct);

      const result = await productService.createProduct(mockCreateProductData);

      expect(result).toEqual(createdProduct);
    });

    it('should catch and re-throw repository errors', async () => {
      const repositoryError = new Error('Duplicate product name');
      mockRepository.create.mockRejectedValue(repositoryError);

      await expect(
        productService.createProduct(mockCreateProductData)
      ).rejects.toThrow('Duplicate product name');
    });
  });
});
