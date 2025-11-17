import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  // Guardar referencias originales
  const originalInnerWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;

  // Mock para el event listener
  let eventListeners: Record<string, (event: any) => void> = {};

  beforeEach(() => {
    // Limpiar event listeners
    eventListeners = {};

    // Mock de matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: window.innerWidth < 768,
      media: query,
      onchange: null,
      addEventListener: (event: string, callback: (event: any) => void) => {
        eventListeners[event] = callback;
      },
      removeEventListener: (event: string) => {
        delete eventListeners[event];
      },
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    // Restaurar valores originales
    window.innerWidth = originalInnerWidth;
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  it('debería devolver true cuando el ancho de la pantalla es menor que 768px', () => {
    window.innerWidth = 767;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('debería devolver false cuando el ancho de la pantalla es 768px o más', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('debería actualizar el estado cuando cambia el tamaño de la ventana', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    
    // Verificar estado inicial
    expect(result.current).toBe(false);
    
    // Simular cambio a móvil
    act(() => {
      window.innerWidth = 500;
      // Disparar manualmente el evento de cambio
      if (eventListeners.change) {
        eventListeners.change({ matches: true });
      }
    });
    
    // Verificar que el estado se actualizó
    expect(result.current).toBe(true);
  });

  it('debería limpiar el event listener al desmontar', () => {
    const { unmount } = renderHook(() => useIsMobile());
    
    // Verificar que se agregó el event listener
    expect(Object.keys(eventListeners)).toContain('change');
    
    // Desmontar el componente
    unmount();
    
    // Verificar que se eliminó el event listener
    expect(eventListeners.change).toBeUndefined();
  });
});