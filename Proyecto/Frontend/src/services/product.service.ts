import apiClient from './api.config';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ApiResponse,
} from '@/types/product.types';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
}

/**
 * Servicio para gestión de productos
 */
export const productService = {
  /**
   * Obtener todos los productos con paginación
   * @param limit - Límite de resultados (1-100)
   * @param offset - Desplazamiento para paginación
   * @returns Lista de productos
   */
  getAllProducts: async (limit?: number, offset?: number): Promise<Product[]> => {
    try {
      const params: Record<string, number> = {};
      if (limit !== undefined) params.limit = limit;
      if (offset !== undefined) params.offset = offset;

      const response = await apiClient.get<ApiResponse<Product[]>>(
        '/products/',
        { params }
      );
      
      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al obtener productos');
    }
  },

  /**
   * Obtener un producto por ID
   * @param id - ID del producto
   * @returns Datos del producto
   */
  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(
        `/products/${id}`
      );
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Producto no encontrado');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al obtener producto');
    }
  },

  /**
   * Buscar productos por nombre
   * @param name - Nombre o parte del nombre del producto
   * @returns Lista de productos que coinciden
   */
  searchProductsByName: async (name: string): Promise<Product[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Product[]>>(
        '/products/search/',
        { params: { name } }
      );
      
      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al buscar productos');
    }
  },

  /**
   * Crear un nuevo producto
   * @param productData - Datos del producto a crear
   * @returns Producto creado
   */
  createProduct: async (productData: CreateProductRequest): Promise<Product> => {
    try {
      const response = await apiClient.post<ApiResponse<Product>>(
        '/products/',
        productData
      );
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear producto');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al crear producto');
    }
  },

  /**
   * Actualizar un producto existente
   * @param id - ID del producto
   * @param productData - Datos a actualizar
   * @returns Producto actualizado
   */
  updateProduct: async (
    id: number,
    productData: UpdateProductRequest
  ): Promise<Product> => {
    try {
      const response = await apiClient.put<ApiResponse<Product>>(
        `/products/${id}`,
        productData
      );
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al actualizar producto');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al actualizar producto');
    }
  },

  /**
   * Eliminar un producto
   * @param id - ID del producto a eliminar
   * @returns true si se eliminó exitosamente
   */
  deleteProduct: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete<ApiResponse<never>>(`/products/${id}`);
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al eliminar producto');
    }
  },
};

export default productService;
