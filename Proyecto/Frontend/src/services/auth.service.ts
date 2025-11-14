import apiClient from './api.config';
import { LoginRequest, LoginResponse, User, ApiResponse } from '@/types/user.types';
import { AxiosError } from 'axios';

/**
 * Servicio para autenticación de usuarios
 */
export const authService = {
  /**
   * Login de usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Datos del usuario autenticado
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/users/login',
        { email, password }
      );
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error en el login');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al conectar con el servidor');
    }
  },

  /**
   * Obtener usuario por email
   * @param email - Email del usuario
   * @returns Datos del usuario
   */
  getUserByEmail: async (email: string): Promise<User> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        `/users/email/`,
        { params: { email } }
      );
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Usuario no encontrado');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener usuario');
    }
  },

  /**
   * Obtener todos los usuarios con paginación
   * @param limit - Límite de resultados (1-100)
   * @param offset - Desplazamiento para paginación
   * @returns Lista de usuarios
   */
  getAllUsers: async (limit?: number, offset?: number): Promise<User[]> => {
    try {
      const params: Record<string, number> = {};
      if (limit !== undefined) params.limit = limit;
      if (offset !== undefined) params.offset = offset;

      const response = await apiClient.get<ApiResponse<User[]>>(
        '/users/',
        { params }
      );
      
      return response.data.data || [];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener usuarios');
    }
  },
};

export default authService;
