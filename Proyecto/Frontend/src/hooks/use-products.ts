import { useState, useCallback, useEffect } from 'react';
import { productService } from '@/services';
import { Product, CreateProductRequest, UpdateProductRequest } from '@/types/product.types';
import { useToast } from '@/hooks/use-toast';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchResults: Product[];
  searching: boolean;
  loadProducts: (limit?: number, offset?: number) => Promise<void>;
  searchProducts: (name: string) => Promise<void>;
  createProduct: (productData: CreateProductRequest) => Promise<Product | null>;
  updateProduct: (id: number, productData: UpdateProductRequest) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  getProductById: (id: number) => Promise<Product | null>;
}

/**
 * Hook personalizado para manejar productos
 */
export const useProducts = (): UseProductsReturn => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (limit?: number, offset?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productService.getAllProducts(limit, offset);
      setProducts(data);
      setSearchResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const searchProducts = useCallback(async (name: string) => {
    try {
      setSearching(true);
      setError(null);
      
      const results = await productService.searchProductsByName(name);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: 'Sin resultados',
          description: `No se encontraron productos con "${name}"`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar productos';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  }, [toast]);

  const createProduct = useCallback(async (productData: CreateProductRequest): Promise<Product | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      setSearchResults(prev => [...prev, newProduct]);
      
      toast({
        title: 'Producto creado',
        description: `${newProduct.name} ha sido creado exitosamente`,
      });
      
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateProduct = useCallback(async (
    id: number,
    productData: UpdateProductRequest
  ): Promise<Product | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedProduct = await productService.updateProduct(id, productData);
      
      setProducts(prev => 
        prev.map(p => p.id === id ? updatedProduct : p)
      );
      setSearchResults(prev => 
        prev.map(p => p.id === id ? updatedProduct : p)
      );
      
      toast({
        title: 'Producto actualizado',
        description: `${updatedProduct.name} ha sido actualizado exitosamente`,
      });
      
      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await productService.deleteProduct(id);
      
      setProducts(prev => prev.filter(p => p.id !== id));
      setSearchResults(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado exitosamente',
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getProductById = useCallback(async (id: number): Promise<Product | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const product = await productService.getProductById(id);
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener producto';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    searchResults,
    searching,
    loadProducts,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };
};

export default useProducts;
