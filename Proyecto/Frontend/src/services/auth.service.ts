import apiClient from './api.config';
import { LoginRequest, LoginResponse, User, ApiResponse, UpdateUserDTO, PasswordUpdateDTO } from '@/types/user.types';
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
   * Obtener usuario por ID
   * @param id - ID del usuario
   * @returns Datos del usuario
   */
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        `/users/${id}`
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

  /**
   * Crear nuevo usuario
   * @param userData - Datos del usuario a crear
   * @returns Usuario creado
   */
  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<User> => {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        '/users/',
        userData
      );
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear usuario');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al crear usuario');
    }
  },

  /**
   * Actualizar usuario
   * @param id - ID del usuario
   * @param userData - Datos a actualizar
   * @returns Usuario actualizado
   */
  updateUser: async (id: number, userData: UpdateUserDTO): Promise<User> => {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        `/users/${id}`,
        userData
      );
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al actualizar usuario');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al actualizar usuario');
    }
  },

  /**
   * Cambiar contraseña
   * @param id - ID del usuario
   * @param data - Contraseñas actual y nueva
   */
  updatePassword: async (id: number, data: PasswordUpdateDTO): Promise<void> => {
    try {
      await apiClient.put<ApiResponse<never>>(
        `/users/${id}/password`,
        data
      );
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al cambiar contraseña');
    }
  },

  /**
   * Eliminar usuario
   * @param id - ID del usuario a eliminar
   * @returns true si se eliminó exitosamente
   */
  deleteUser: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete<ApiResponse<never>>(`/users/${id}`);
      return true;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al eliminar usuario');
    }
  },

  /**
   * Verificar email con token
   * @param token - Token de verificación
   */
  verifyUser: async (token: string): Promise<void> => {
    try {
      await apiClient.get<ApiResponse<never>>(
        '/users/verify-email/',
        { params: { token } }
      );
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al verificar email');
    }
  },

  /**
   * Reenviar email de verificación
   * @param email - Email del usuario
   */
  resendVerificationEmail: async (email: string): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<never>>(
        '/users/resend-verification-email/',
        {},
        { params: { email } }
      );
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al reenviar email de verificación');
    }
  },
};

export default authService;
