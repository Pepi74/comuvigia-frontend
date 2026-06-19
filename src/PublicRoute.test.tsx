import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route } from 'react-router-dom';

vi.mock('@ionic/react', () => ({
  IonContent: ({ children }: any) => <div>{children}</div>,
  IonSpinner: () => <div data-testid="spinner" />,
}));

vi.mock('./UserContext', () => ({
  useUser: vi.fn(),
}));

import { PublicRoute } from './PublicRoute';
import { useUser } from './UserContext';

describe('PublicRoute', () => {

  it('muestra spinner mientras verifica autenticación', () => {
    (useUser as any).mockReturnValue({ user: null, checkingAuth: true });

    render(
      <MemoryRouter>
        <PublicRoute path="/login">
          <div>Login</div>
        </PublicRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('spinner')).toBeDefined();
  });

  it('redirige a /home si usuario ya está autenticado', () => {
    (useUser as any).mockReturnValue({
      user: { usuario: 'admin', rol: 2, nombre: 'Admin' },
      checkingAuth: false
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <PublicRoute path="/login">
          <div>Login</div>
        </PublicRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Login')).toBeNull();
  });

  it('renderiza children si no hay usuario autenticado', () => {
    (useUser as any).mockReturnValue({ user: null, checkingAuth: false });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <PublicRoute path="/login" exact>
          <div>Formulario de login</div>
        </PublicRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Formulario de login')).toBeDefined();
  });

});