import { Router } from 'express';
import { Request, Response } from 'express';
import { ProductService } from '../service/product.service';
import ProductDTO from '../dto/product.dto';
import ResponseDTO from '../dto/response.dto';

const router = Router();

const productService = new ProductService()

router.get('/:id', async (req: Request, res: Response) => {
    let response: ResponseDTO<ProductDTO>;
    try {
        if (!req.params.id || isNaN(parseInt(req.params.id))) {
            response = {
                status: 400,
                message: 'Bad request',
            };
            res.status(400).json(response);
            return;
        }
        const id = parseInt(req.params.id!);
        const product = await productService.getProduct(id);
        response = {
          status: 200,
          message: 'Product found',
          data: product,
        };
        res.status(200).json(response);
    } catch (error) {
      response = {
        status: 500,
        message: 'Internal server error',
      };
      res.status(500).json(response);
    }
});

export default router;
