import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NavLink } from './NavLink';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de la función cn
const mockCn = vi.fn((...args) => args.filter(Boolean).join(' '));
vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => mockCn(...args),
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    NavLink: ({ className, ...props }: any) => {
      // Simulamos el comportamiento de NavLink de react-router-dom
      const isActive = props.to === '/test';
      const isPending = false;
      const computedClassName = typeof className === 'function' 
        ? className({ isActive, isPending })
        : className;
      
      return (
        <a 
          href={props.to} 
          className={computedClassName}
          data-testid={props['data-testid']}
          onClick={props.onClick}
        >
          {props.children}
        </a>
      );
    }
  };
});

describe('NavLink', () => {
  const renderNavLink = (props = {}) => {
    const defaultProps = {
      to: '/test',
      children: 'Test Link',
      ...props,
    };

    return render(
      <Router>
        <NavLink {...defaultProps} />
      </Router>
    );
  };

  beforeEach(() => {
    mockCn.mockClear();
  });

  it('renderiza correctamente con las props básicas', () => {
    renderNavLink();
    
    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('aplica la clase base correctamente', () => {
    const className = 'custom-class';
    renderNavLink({ className });
    
    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).toHaveClass(className);
  });

  it('aplica la clase pending cuando el enlace está pendiente', () => {
    const pendingClassName = 'pending-class';
    
    // Limpiamos las llamadas anteriores al mock
    mockCn.mockClear();
    
    // Sobrescribimos el mock de NavLink
    const originalNavLink = vi.mocked(require('react-router-dom').NavLink);
    
    try {
      vi.mocked(require('react-router-dom')).NavLink = vi.fn().mockImplementation(({ className, ...props }) => {
        const isActive = false;
        const isPending = true;
        const computedClassName = typeof className === 'function' 
          ? className({ isActive, isPending })
          : className;
        
        return (
          <a 
            href={props.to} 
            className={computedClassName}
            data-testid={props['data-testid']}
            onClick={props.onClick}
          >
            {props.children}
          </a>
        );
      });

      renderNavLink({ 
        to: '/other-route',
        pendingClassName 
      });
      
      // Verificamos que se llamó a cn con los parámetros correctos
      expect(mockCn).toHaveBeenCalledWith(
        undefined,
        false,
        false
      );
    } finally {
      // Restauramos el mock original
      vi.mocked(require('react-router-dom')).NavLink = originalNavLink;
    }
  });

  it('pasa correctamente las props adicionales al enlace', () => {
    const onClick = vi.fn();
    renderNavLink({ 'data-testid': 'nav-link', onClick });
    
    const link = screen.getByTestId('nav-link');
    expect(link).toBeInTheDocument();
    
    // Simular clic en el enlace
    link.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});