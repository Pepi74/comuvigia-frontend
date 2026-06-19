import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';

// Mock de Ionic
vi.mock('@ionic/react', () => ({
  IonCard: ({ children, style }: any) => <div style={style}>{children}</div>,
  IonIcon: ({ icon }: any) => <span data-icon={icon} />,
  IonButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  IonText: ({ children }: any) => <span>{children}</span>,
  IonGrid: ({ children }: any) => <div>{children}</div>,
  IonRow: ({ children }: any) => <div>{children}</div>,
  IonCol: ({ children }: any) => <div>{children}</div>,
}));

// Mock de ionicons
vi.mock('ionicons/icons', () => ({
  close: 'close',
  checkmarkCircle: 'checkmarkCircle',
  warning: 'warning',
  alertCircle: 'alertCircle',
  informationCircle: 'informationCircle',
  videocam: 'videocam',
  eye: 'eye',
  checkmark: 'checkmark',
}));

import Aviso from './Aviso';

describe('Aviso', () => {

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(
      <Aviso isOpen={false} type="info" message="Test" onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el mensaje cuando isOpen es true', () => {
    render(
      <Aviso isOpen={true} type="info" message="Mensaje de prueba" onClose={() => {}} />
    );
    expect(screen.getByText('Mensaje de prueba')).toBeDefined();
  });

  it('renderiza estilo simple por defecto', () => {
    render(
      <Aviso isOpen={true} type="success" message="Éxito" onClose={() => {}} />
    );
    expect(screen.getByText('Éxito')).toBeDefined();
  });

  it('renderiza estilo detailed con título', () => {
    render(
      <Aviso
        isOpen={true}
        type="warning"
        title="Título test"
        message="Mensaje detailed"
        style="detailed"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Título test')).toBeDefined();
    expect(screen.getByText('Mensaje detailed')).toBeDefined();
  });

  it('renderiza estilo actionable con acciones', () => {
    const handler = vi.fn();
    render(
      <Aviso
        isOpen={true}
        type="error"
        message="Mensaje actionable"
        style="actionable"
        onClose={() => {}}
        actions={[{ text: 'Confirmar', handler }]}
      />
    );
    expect(screen.getByText('Confirmar')).toBeDefined();
  });

  it('renderiza estilo toast', () => {
    render(
      <Aviso
        isOpen={true}
        type="info"
        message="Mensaje toast"
        style="toast"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Mensaje toast')).toBeDefined();
  });

  it('llama onClose automáticamente después del duration', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <Aviso
        isOpen={true}
        type="info"
        message="Auto close"
        onClose={onClose}
        autoClose={true}
        duration={1000}
      />
    );

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('no llama onClose automáticamente si autoClose es false', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <Aviso
        isOpen={true}
        type="info"
        message="No auto close"
        onClose={onClose}
        autoClose={false}
        duration={1000}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onClose).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

});