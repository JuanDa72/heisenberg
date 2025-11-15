/**
 * Test para auth.service.ts
 * Prueba: Login de usuario
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import apiClient from './api.config';

vi.mock('./api.config');

describe('AuthService - Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Hacer login con email y contraseña
   * 
   * ¿Qué prueba?
   * - Que el servicio envíe las credenciales al backend
   * - Que retorne los datos del usuario si el login es exitoso
   * - Que incluya el rol del usuario (admin o user)
   * 
   * Caso límite: ¿Qué pasa si las credenciales son incorrectas? 
   * El backend retorna error
   */
  it('debe hacer login y retornar datos del usuario', async () => {
    // Simular respuesta exitosa del backend
    const usuarioAutenticado = {
      id: 1,
      username: 'admin',
      email: 'admin@heisenberg.com',
      role: 'admin',
    };

    // Configurar el mock
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        status: 200,
        message: 'Login successful',
        data: usuarioAutenticado,
      },
    });

    // Intentar hacer login
    const resultado = await authService.login(
      'admin@heisenberg.com',
      'password123'
    );

    // Verificar que retornó los datos correctos
    expect(resultado.username).toBe('admin');
    expect(resultado.role).toBe('admin');
    expect(resultado.email).toBe('admin@heisenberg.com');
  });
});
