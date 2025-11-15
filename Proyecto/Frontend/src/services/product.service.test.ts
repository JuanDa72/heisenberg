/**
 * Test para product.service.ts
 * Prueba: Obtener lista de productos del backend
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from './product.service';
import apiClient from './api.config';

vi.mock('./api.config');

describe('ProductService - Obtener Productos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Obtener todos los productos desde el backend
   * 
   * ¿Qué prueba?
   * - Que el servicio llame correctamente a la API
   * - Que retorne un array de productos
   * - Que cada producto tenga los campos necesarios
   * 
   * Caso límite: ¿Qué pasa si no hay productos? Retorna array vacío
   */
  it('debe obtener lista de productos del backend', async () => {
    // Simular respuesta del backend
    const productosDelBackend = [
      {
        id: 1,
        name: 'Paracetamol 500mg',
        type: 'Analgésico',
        price: 5000,
        stock: 100,
      },
      {
        id: 2,
        name: 'Ibuprofeno 400mg',
        type: 'Antiinflamatorio',
        price: 8000,
        stock: 50,
      },
    ];

    // Configurar el mock para que retorne estos productos
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { 
        status: 200, 
        data: productosDelBackend 
      },
    });

    // Llamar al servicio
    const resultado = await productService.getAllProducts();

    // Verificar que funcionó correctamente
    expect(resultado).toHaveLength(2); // Debe tener 2 productos
    expect(resultado[0].name).toBe('Paracetamol 500mg'); // Primer producto
    expect(resultado[1].price).toBe(8000); // Precio del segundo
  });
});
