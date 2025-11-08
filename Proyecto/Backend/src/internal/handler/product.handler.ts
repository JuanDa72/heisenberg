import { Router, Request, Response } from 'express';
import { ProductServiceInterface } from '../service/product.service';
import ProductDTO, { CreateProductDTO, UpdateProductDTO } from '../dto/product.dto';
import ResponseDTO from '../dto/response.dto';

export interface ProductHandlerInterface {
  setupRoutes(): void;
  getRouter(): Router;
}

export class ProductHandler implements ProductHandlerInterface {
  
  private productService: ProductServiceInterface;
  private router: Router;
  
  constructor(productService: ProductServiceInterface) {
    this.productService = productService;
    this.router = Router();
  }

  public setupRoutes(): void {
    this.router.get('/search/', this.getProductsByName.bind(this));
    this.router.get('/', this.getAllProducts.bind(this));
    this.router.get('/:id', this.getProductById.bind(this));
    this.router.post('/', this.createProduct.bind(this));
    this.router.put('/:id', this.updateProduct.bind(this));
    this.router.delete('/:id', this.deleteProduct.bind(this));
  }

  // GET /products - Get all products with pagination
  private async getAllProducts(req: Request, res: Response): Promise<void> {
    let response: ResponseDTO<ProductDTO[]>;
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      // Validate pagination
      if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
        response = {
          status: 400,
          message: 'Limit parameter must be a number between 1 and 100',
        };
        res.status(400).json(response);
        return;
      }
      
      if (offset !== undefined && (isNaN(offset) || offset < 0)) {
        response = {
          status: 400,
          message: 'Offset parameter must be a number greater than or equal to 0',
        };
        res.status(400).json(response);
        return;
      }
      
      const products = await this.productService.getAllProducts(limit, offset);

      response = {
        status: 200,
        message: `Products found: ${products.length}`,
        data: products,
      };
      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response = {
        status: 500,
        message: `Error getting products: ${errorMessage}`,
      };
      res.status(500).json(response);
    }
  }

  // GET /products/:id - Get product by ID
  private async getProductById(req: Request, res: Response): Promise<void> {
    let response: ResponseDTO<ProductDTO>;
    try {
      const id = parseInt(req.params.id!);
      
      // Validate ID
      if (isNaN(id) || id <= 0) {
        response = {
          status: 400,
          message: 'Invalid ID. Must be a positive integer',
        };
        res.status(400).json(response);
        return;
      }
      
      const product = await this.productService.getProduct(id);
      
      response = {
        status: 200,
        message: 'Product found',
        data: product,
      };
      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // If error is "not found", return 404
      if (errorMessage.includes('not found')) {
        response = {
          status: 404,
          message: errorMessage,
        };
        res.status(404).json(response);
        return;
      }
      
      response = {
        status: 500,
        message: `Error getting product: ${errorMessage}`,
      };
      res.status(500).json(response);
    }
  }

  // POST /products - Create a new product
  private async createProduct(req: Request, res: Response): Promise<void> {
    let response: ResponseDTO<ProductDTO>;
    try {
      const productData: CreateProductDTO = req.body;
      const newProduct = await this.productService.createProduct(productData);
      
      response = {
        status: 201,
        message: 'Product created successfully',
        data: newProduct,
      };
      res.status(201).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // If error is business validation, return 400
      if (errorMessage.includes('already exists') || 
          errorMessage.includes('cannot exceed') ||
          errorMessage.includes('cannot be before')) {
        response = {
          status: 400,
          message: errorMessage,
        };
        res.status(400).json(response);
        return;
      }
      
      response = {
        status: 500,
        message: `Error creating product: ${errorMessage}`,
      };
      res.status(500).json(response);
    }
  }

  // PUT /products/:id - Update an existing product
  private async updateProduct(req: Request, res: Response): Promise<void> {
    let response: ResponseDTO<ProductDTO>;
    try {
      const id = parseInt(req.params.id!);
      
      // Validate ID
      if (isNaN(id) || id <= 0) {
        response = {
          status: 400,
          message: 'Invalid ID. Must be a positive integer',
        };
        res.status(400).json(response);
        return;
      }
      
      // Validate at least one field is provided
      if (Object.keys(req.body).length === 0) {
        response = {
          status: 400,
          message: 'Must provide at least one field to update',
        };
        res.status(400).json(response);
        return;
      }
      
      const productData: UpdateProductDTO = req.body;
      const updatedProduct = await this.productService.updateProduct(id, productData);
      
      response = {
        status: 200,
        message: 'Product updated successfully',
        data: updatedProduct,
      };
      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // If error is "not found", return 404
      if (errorMessage.includes('not found')) {
        response = {
          status: 404,
          message: errorMessage,
        };
        res.status(404).json(response);
        return;
      }
      
      // If error is business validation, return 400
      if (errorMessage.includes('already exists') || 
          errorMessage.includes('cannot exceed') ||
          errorMessage.includes('cannot be before')) {
        response = {
          status: 400,
          message: errorMessage,
        };
        res.status(400).json(response);
        return;
      }
      
      response = {
        status: 500,
        message: `Error updating product: ${errorMessage}`,
      };
      res.status(500).json(response);
    }
  }

  // DELETE /products/:id - Delete a product
  private async deleteProduct(req: Request, res: Response): Promise<void> {
    let response: ResponseDTO<never>;
    try {
      const id = parseInt(req.params.id!);
      
      // Validate ID
      if (isNaN(id) || id <= 0) {
        response = {
          status: 400,
          message: 'Invalid ID. Must be a positive integer',
        };
        res.status(400).json(response);
        return;
      }
      
      const deleted = await this.productService.deleteProduct(id);
      
      if (deleted) {
        response = {
          status: 200,
          message: 'Product deleted successfully',
        };
        res.status(200).json(response);
      } else {
        response = {
          status: 404,
          message: `Product with ID ${id} not found`,
        };
        res.status(404).json(response);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // If error is "not found", return 404
      if (errorMessage.includes('not found')) {
        response = {
          status: 404,
          message: errorMessage,
        };
        res.status(404).json(response);
        return;
      }
      
      response = {
        status: 500,
        message: `Error deleting product: ${errorMessage}`,
      };
      res.status(500).json(response);
    }
  }  


  // GET /products/:name - Get a product by name
  
  private async getProductsByName(req: Request, res: Response): Promise<void> {

    let response: ResponseDTO<ProductDTO[]>;
    try {

       const name = req.query.name as string;
      

      //validate name
      if (!name || name.trim() === '') {
        response = {
          status: 400,
          message: 'Invalid name. Must be a non-empty string',
        };
        res.status(400).json(response);
        return;
      }

      const results= await this.productService.findByNameLike(name);

      response = {
        status: 200,
        message: `Products found: ${results.length}`,
        data: results,
      };
      res.status(200).json(response);
    }

    catch (error) {

      const consoleMessage = error instanceof Error ? error.message : 'Unknown error';
      //If error is "not found", return 404
      if (consoleMessage.includes('not found')) {
        response = {
          status: 404,
          message: consoleMessage,
        };
        res.status(404).json(response);
        return;
      }

      response = {
        status: 500,
        message: `Error getting products: ${consoleMessage}`,
      };
      res.status(500).json(response);
      


    }

  }
  


  // Get router (encapsulation)
  public getRouter(): Router {
    return this.router;
  }

}
