import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@ionic/react', () => ({
  IonContent: ({ children }: any) => <div>{children}</div>,
  IonSpinner: () => <div data-testid="spinner" />,
}));

vi.mock('./UserContext', () => ({
  useUser: vi.fn(),
}));

import { ProtectedRoute } from './ProtectedRoute';
import { useUser } from './UserContext';

describe('ProtectedRoute', () => {

  it('muestra spinner mientras verifica autenticación', () => {
    (useUser as any).mockReturnValue({ user: null, checkingAuth: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('spinner')).toBeDefined();
  });

  it('redirige a /login si no hay usuario', () => {
    (useUser as any).mockReturnValue({ user: null, checkingAuth: false });

    const { container } = render(
      <MemoryRouter initialEntries={['/home']}>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(container.querySelector('div')).toBeDefined();
    expect(screen.queryByText('Contenido protegido')).toBeNull();
  });

  it('renderiza children si hay usuario autenticado', () => {
    (useUser as any).mockReturnValue({
      user: { usuario: 'admin', rol: 2, nombre: 'Admin' },
      checkingAuth: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido protegido')).toBeDefined();
  });

  it('redirige a /home si rol no está permitido', () => {
    (useUser as any).mockReturnValue({
      user: { usuario: 'operador', rol: 1, nombre: 'Operador' },
      checkingAuth: false
    });

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={[2]}>
          <div>Solo admin</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Solo admin')).toBeNull();
  });

  it('renderiza children si rol está en allowedRoles', () => {
    (useUser as any).mockReturnValue({
      user: { usuario: 'admin', rol: 2, nombre: 'Admin' },
      checkingAuth: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={[1, 2]}>
          <div>Contenido permitido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido permitido')).toBeDefined();
  });

});