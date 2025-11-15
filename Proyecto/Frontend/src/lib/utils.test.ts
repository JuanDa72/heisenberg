/**
 * Tests para funciones utilitarias
 * Valida la función cn (classnames merge con conflictos de Tailwind)
 */

import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Utils - cn function', () => {

  it('debería resolver conflictos de Tailwind y manejar clases condicionales complejas', () => {
    // Arrange: Simular estados dinámicos de un componente UI real
    const isActive = true;
    const isDisabled = false;
    const variant: 'primary' | 'secondary' = 'primary';
    const size = 'large';

    // Caso 1: Resolver conflictos simples de padding (última gana)
    const paddingResult = cn('p-4', 'p-8');
    expect(paddingResult).toBe('p-8');
    expect(paddingResult).not.toContain('p-4');

    // Caso 2: Clases condicionales con valores falsy (caso crítico para UI)
    const conditionalResult = cn(
      'base-button',
      isActive && 'bg-primary text-white',
      isDisabled && 'opacity-50 cursor-not-allowed',
      !isDisabled && 'hover:bg-primary-dark',
      null,
      undefined,
      false // valores falsy deben ser ignorados
    );
    
    expect(conditionalResult).toContain('base-button');
    expect(conditionalResult).toContain('bg-primary'); // isActive es true
    expect(conditionalResult).not.toContain('opacity-50'); // isDisabled es false
    expect(conditionalResult).toContain('hover:bg-primary-dark'); // !isDisabled es true
    expect(conditionalResult).not.toContain('false'); // valores falsy no deben aparecer
    expect(conditionalResult).not.toContain('null');
    expect(conditionalResult).not.toContain('undefined');

    // Caso 3: Combinar arrays, objetos y strings (caso de uso real en componentes)
    const complexResult = cn(
      ['flex', 'items-center'],
      variant === 'primary' && 'bg-blue-500',
      size === 'large' ? 'text-lg px-6 py-3' : 'text-sm px-4 py-2',
      variant === 'secondary' && 'bg-gray-500' // No se aplica
    );
    
    expect(complexResult).toContain('flex');
    expect(complexResult).toContain('items-center');
    expect(complexResult).toContain('bg-blue-500');
    expect(complexResult).toContain('text-lg'); // size es 'large'
    expect(complexResult).toContain('px-6');
    expect(complexResult).not.toContain('text-sm'); // Se aplica text-lg en su lugar
    expect(complexResult).not.toContain('px-4'); // Se aplica px-6 en su lugar
    expect(complexResult).not.toContain('bg-gray-500'); // variant no es 'secondary'

    // Caso 4: Manejo de strings vacíos y solo valores falsy
    const emptyResult = cn('', null, undefined, false);
    expect(emptyResult).toBe('');
    
    // Caso 5: Combinación real de UI - botón con estados
    const buttonResult = cn(
      'btn',
      'rounded-md',
      isActive ? 'bg-blue-600' : 'bg-gray-400',
      !isDisabled && 'cursor-pointer',
      isDisabled && 'cursor-not-allowed'
    );
    
    expect(buttonResult).toContain('btn');
    expect(buttonResult).toContain('rounded-md');
    expect(buttonResult).toContain('bg-blue-600'); // isActive = true
    expect(buttonResult).not.toContain('bg-gray-400');
    expect(buttonResult).toContain('cursor-pointer'); // isDisabled = false
    expect(buttonResult).not.toContain('cursor-not-allowed');
  });
});
