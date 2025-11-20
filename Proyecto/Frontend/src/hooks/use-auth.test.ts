/**
 * Test unitario para use-auth.ts
 * Prueba: Hook de autenticación
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './use-auth';
import { authService } from '@/services';
import { useToast } from '@/hooks/use-toast';

// Mockear dependencias
vi.mock('@/services');
vi.mock('@/hooks/use-toast');

describe('useAuth Hook - Tests Unitarios', () => {
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock de useToast
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: [],
    });
  });

  /**
   * Test 1: Inicialización con valores por defecto
   */
  it('debe inicializar sin usuario autenticado', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  /**
   * Test 2: Login exitoso
   */
  it('debe hacer login correctamente', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@heisenberg.com',
      role: 'user',
      created_at: new Date('2024-01-01'),
    };

    vi.mocked(authService.login).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@heisenberg.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  /**
   * Test 3: Login fallido
   */
  it('debe manejar errores en login', async () => {
    const errorMessage = 'Credenciales inválidas';
    vi.mocked(authService.login).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('wrong@email.com', 'wrongpass');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isAuthenticated).toBe(false);
  });

  /**
   * Test 4: Logout
   */
  it('debe hacer logout correctamente', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@heisenberg.com',
      role: 'user',
      created_at: new Date('2024-01-01'),
    };

    vi.mocked(authService.login).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    // Login primero
    await act(async () => {
      await result.current.login('test@heisenberg.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('user')).toBeNull();
  });

  /**
   * Test 5: Persistencia desde localStorage
   */
  it('debe cargar usuario desde localStorage', () => {
    const savedUser = {
      id: 2,
      username: 'persisteduser',
      email: 'persisted@heisenberg.com',
      role: 'admin',
      created_at: new Date('2024-01-01'),
    };
    
    localStorage.setItem('user', JSON.stringify(savedUser));

    const { result } = renderHook(() => useAuth());

    // La fecha se deserializa como string desde localStorage
    expect(result.current.user?.id).toBe(2);
    expect(result.current.user?.username).toBe('persisteduser');
    expect(result.current.user?.email).toBe('persisted@heisenberg.com');
    expect(result.current.user?.role).toBe('admin');
    expect(result.current.isAuthenticated).toBe(true);
  });
});
