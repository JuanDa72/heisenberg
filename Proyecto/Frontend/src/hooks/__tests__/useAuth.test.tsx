import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../use-auth';
import { authService } from '@/services';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { User } from '@/types/user.types';

// Mock del servicio de autenticación
vi.mock('@/services/auth.service');

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAuth', () => {
  // Datos de prueba
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    created_at: "2023-01-01T00:00:00.000Z",  // Cambiado a string
  };
    
  // Datos para localStorage (necesita ser serializable)
  const mockUserString = JSON.stringify({
    ...mockUser,
    created_at: mockUser.created_at,
  });

  // Limpiar localStorage antes de cada prueba
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('debe inicializar con usuario nulo si no hay sesión guardada', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('debe inicializar con el usuario guardado en localStorage', () => {
    // Configurar localStorage con un usuario
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  describe('login', () => {
    it('debe iniciar sesión correctamente', async () => {
      // Configurar el mock para simular un inicio de sesión exitoso
      vi.mocked(authService.login).mockResolvedValueOnce(mockUser);
      
      const { result } = renderHook(() => useAuth());
      
      // Llamar a la función de login
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });
      
      // Verificar que se llamó al servicio con los parámetros correctos
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      
      // Verificar que el estado se actualizó correctamente
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
      
      // Verificar que se guardó en localStorage
      expect(localStorage.getItem('user')).toEqual(mockUserString);
    });
    
    it('debe manejar errores de autenticación', async () => {
      // Configurar el mock para simular un error de autenticación
      const errorMessage = 'Credenciales inválidas';
      vi.mocked(authService.login).mockRejectedValueOnce(new Error(errorMessage));
      
      const { result } = renderHook(() => useAuth());
      
      // Llamar a la función de login
      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });
      
      // Verificar que se actualizó el estado de error
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('debe cerrar la sesión correctamente', async () => {
      // Configurar un usuario autenticado
      localStorage.setItem('user', mockUserString);
      
      const { result } = renderHook(() => useAuth());
      
      // Verificar que el usuario está autenticado
      expect(result.current.isAuthenticated).toBe(true);
      
      // Llamar a la función de logout
      act(() => {
        result.current.logout();
      });
      
      // Verificar que se cerró la sesión
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      
      // Verificar que se eliminó del localStorage
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
