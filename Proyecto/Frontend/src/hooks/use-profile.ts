import { useState, useCallback } from 'react';
import { authService } from '@/services';
import type { User, UpdateUserDTO, PasswordUpdateDTO } from '@/types/user.types';

export interface UseProfileState {
  user: User | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
}

export const useProfile = (initialUser: User | null = null) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene los datos del usuario por ID
   */
  const fetchUser = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.getUserById(userId);
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener usuario';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza el perfil del usuario
   */
  const updateProfile = useCallback(async (userId: number, data: UpdateUserDTO) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedUser = await authService.updateUser(userId, data);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  /**
   * Actualiza la contraseña del usuario
   */
  const updatePassword = useCallback(async (userId: number, data: PasswordUpdateDTO) => {
    try {
      setUpdating(true);
      setError(null);
      await authService.updatePassword(userId, data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar contraseña';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  /**
   * Verifica el email del usuario
   */
  const verifyEmail = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.verifyUser(token);
      // Actualizar estado del usuario si es necesario
      if (user) {
        setUser({ ...user, is_verified: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al verificar email';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Reenvía email de verificación
   */
  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resendVerificationEmail(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al reenviar email de verificación';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina la cuenta del usuario
   */
  const deleteAccount = useCallback(async (userId: number) => {
    try {
      setUpdating(true);
      setError(null);
      await authService.deleteUser(userId);
      setUser(null);
      // Limpiar localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar cuenta';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  /**
   * Limpia el estado de error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Resetea el hook al estado inicial
   */
  const reset = useCallback(() => {
    setUser(initialUser);
    setLoading(false);
    setUpdating(false);
    setError(null);
  }, [initialUser]);

  return {
    user,
    loading,
    updating,
    error,
    fetchUser,
    updateProfile,
    updatePassword,
    verifyEmail,
    resendVerificationEmail,
    deleteAccount,
    clearError,
    reset,
  };
};
