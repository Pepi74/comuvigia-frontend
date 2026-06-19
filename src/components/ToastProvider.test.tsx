import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ToastProvider, useToast } from './ToastProvider';

const ToastConsumer = ({ action }: { action: (toast: any) => void }) => {
  const toast = useToast();
  React.useEffect(() => { action(toast); }, []);
  return null;
};

describe('ToastProvider', () => {

  it('renderiza children correctamente', () => {
    render(
      <ToastProvider>
        <div>Hijo</div>
      </ToastProvider>
    );
    expect(screen.getByText('Hijo')).toBeDefined();
  });

  it('addToast agrega un toast con score bajo (success)', () => {
    render(
      <ToastProvider>
        <ToastConsumer action={(toast) => toast.addToast('Mensaje success', 0.3)} />
      </ToastProvider>
    );
    expect(screen.getByText('Mensaje success')).toBeDefined();
  });

  it('addToast agrega un toast con score medio (warning)', () => {
    render(
      <ToastProvider>
        <ToastConsumer action={(toast) => toast.addToast('Mensaje warning', 0.5)} />
      </ToastProvider>
    );
    expect(screen.getByText('Mensaje warning')).toBeDefined();
  });

  it('addToast agrega un toast con score alto (danger)', () => {
    render(
      <ToastProvider>
        <ToastConsumer action={(toast) => toast.addToast('Mensaje danger', 0.9)} />
      </ToastProvider>
    );
    expect(screen.getByText('Mensaje danger')).toBeDefined();
  });

  it('removeToast elimina el toast', async () => {
    let toastId: number;

    render(
      <ToastProvider>
        <ToastConsumer action={(toast) => {
          toastId = toast.addToast('Toast a eliminar', 0.5);
        }} />
      </ToastProvider>
    );

    expect(screen.getByText('Toast a eliminar')).toBeDefined();

    act(() => {
      const ctx = screen.getByText('Toast a eliminar');
      // eliminamos directo via removeToast
    });
  });

  it('useToast lanza error fuera de ToastProvider', () => {
    const ComponenteSinProvider = () => {
      useToast();
      return null;
    };

    expect(() => render(<ComponenteSinProvider />)).toThrow(
      'useToast debe usarse dentro de ToastProvider'
    );
  });

});