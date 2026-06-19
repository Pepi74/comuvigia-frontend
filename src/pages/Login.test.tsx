import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@ionic/react', () => ({
  IonPage: ({ children }: any) => <div>{children}</div>,
  IonContent: ({ children }: any) => <div>{children}</div>,
  IonItem: ({ children, className }: any) => <div className={className}>{children}</div>,
  IonLabel: ({ children }: any) => <label>{children}</label>,
  IonInput: ({ value, onIonInput }: any) => (
    <input
      value={value}
      onChange={(e) => onIonInput({ detail: { value: e.target.value } })}
    />
  ),
  IonButton: ({ children, onClick, type }: any) => (
    <button type={type} onClick={onClick}>{children}</button>
  ),
  IonToast: ({ isOpen, message }: any) => (
    isOpen ? <div data-testid="toast">{message}</div> : null
  ),
}));

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  }
}));

vi.mock('../UserContext', () => ({
  useUser: vi.fn(),
}));

import Login from './Login';
import { useUser } from '../UserContext';
import axios from 'axios';

describe('Login', () => {

  beforeEach(() => {
    (useUser as any).mockReturnValue({
      user: null,
      setUser: vi.fn(),
      checkingAuth: false
    });
  });

  it('renderiza el formulario de login', () => {
    render(<Login />);
    expect(screen.getByText('Usuario')).toBeDefined();
    expect(screen.getByText('Contraseña')).toBeDefined();
    expect(screen.getByText('Entrar')).toBeDefined();
  });

  it('renderiza el logo', () => {
    render(<Login />);
    const logo = document.querySelector('img[alt="Logo"]');
    expect(logo).toBeDefined();
  });

  it('login exitoso llama a setUser con los datos del usuario', async () => {
    const setUser = vi.fn();
    (useUser as any).mockReturnValue({ user: null, setUser, checkingAuth: false });

    (axios.post as any).mockResolvedValue({});
    (axios.get as any).mockResolvedValue({
      data: { usuario: 'admin', rol: 2, nombre: 'Admin' }
    });

    render(<Login />);

    const inputs = document.querySelectorAll('input');
    fireEvent.change(inputs[0], { target: { value: 'admin' } });
    fireEvent.change(inputs[1], { target: { value: '123' } });

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(setUser).toHaveBeenCalledWith({ usuario: 'admin', rol: 2, nombre: 'Admin' });
    });
  });

  it('login fallido muestra toast con mensaje de error', async () => {
    (axios.post as any).mockRejectedValue(new Error('Unauthorized'));

    render(<Login />);

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByTestId('toast')).toBeDefined();
      expect(screen.getByText('Usuario o contraseña incorrecta')).toBeDefined();
    });
  });

  it('renderiza copyright al pie', () => {
    render(<Login />);
    expect(screen.getByText(/Comuvigia/)).toBeDefined();
  });

});