import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError } from 'axios';
import { authService } from './auth.service';
import apiClient from './api.config';
import { AxiosError } from 'axios';

// Mock de la API
vi.mock('./api.config');

// Datos de prueba
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('login', () => {
    it('debe hacer login exitosamente con credenciales válidas', async () => {
      // Configurar el mock para simular respuesta exitosa
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          status: 200,
          message: 'Login exitoso',
          data: mockUser,
        },
      });

      const result = await authService.login('test@example.com', 'password123');
      
      // Verificar que se llamó a la API con los parámetros correctos
      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/login',
        { email: 'test@example.com', password: 'password123' }
      );
      
      // Verificar que se devuelven los datos del usuario
      expect(result).toEqual(mockUser);
    });


    it('debe manejar errores de red', async () => {
      // Simular un error de red
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Error de red'));

      await expect(authService.login('test@example.com', 'password123'))
        .rejects
        .toThrow('Error al conectar con el servidor');
    });
  });

  describe('getUserByEmail', () => {
    it('debe obtener un usuario por email', async () => {
      // Configurar el mock para simular respuesta exitosa
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          status: 200,
          message: 'Usuario encontrado',
          data: mockUser,
        },
      });

      const result = await authService.getUserByEmail('test@example.com');
      
      // Verificar que se llamó a la API con los parámetros correctos
      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/email/',
        { params: { email: 'test@example.com' } }
      );
      
      // Verificar que se devuelven los datos del usuario
      expect(result).toEqual(mockUser);
    });

    it('debe lanzar un error si el usuario no existe', async () => {
      // Configurar el mock para simular que el usuario no existe
      const errorResponse = {
        response: {
          data: {
            message: 'Error al obtener usuario',
          },
        },
      };
      
      vi.mocked(apiClient.get).mockRejectedValueOnce(errorResponse);

      // Verificar que se lanza el error correcto
      await expect(authService.getUserByEmail('nonexistent@example.com'))
        .rejects
        .toThrow('Error al obtener usuario');
    });
  });

  describe('getAllUsers', () => {
    it('debe obtener todos los usuarios con paginación', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 2, email: 'test2@example.com' }];
      
      // Configurar el mock para simular respuesta exitosa
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          status: 200,
          message: 'Usuarios obtenidos',
          data: mockUsers,
        },
      });

      const result = await authService.getAllUsers(10, 0);
      
      // Verificar que se llamó a la API con los parámetros correctos
      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/',
        { params: { limit: 10, offset: 0 } }
      );
      
      // Verificar que se devuelven los usuarios
      expect(result).toEqual(mockUsers);
    });

    it('debe manejar la paginación por defecto', async () => {
      // Configurar el mock para simular respuesta exitosa
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          status: 200,
          message: 'Usuarios obtenidos',
          data: [mockUser],
        },
      });

      await authService.getAllUsers();
      
      // Verificar que se usan los valores por defecto
      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/',
        { params: { limit: undefined, offset: undefined } }
      );
    });
  });

  it('debe lanzar error cuando las credenciales son incorrectas', async () => {
    // Simular respuesta del backend indicando credenciales inválidas
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        status: 401,
        message: 'Credenciales inválidas',
        data: null,
      },
    });

    await expect(
      authService.login('noexiste@heisenberg.com', 'badpassword')
    ).rejects.toThrow('Credenciales inválidas');
  });

  it('debe lanzar error cuando hay fallo de conexión al servidor', async () => {
    // Simular un AxiosError sin response (p. ej. network error)
    vi.mocked(apiClient.post).mockRejectedValueOnce(new AxiosError('Network Error'));

    await expect(
      authService.login('admin@heisenberg.com', 'password123')
    ).rejects.toThrow('Error al conectar con el servidor');
  });
});
