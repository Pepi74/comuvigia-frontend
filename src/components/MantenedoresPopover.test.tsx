import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('../UserContext', () => ({ useUser: vi.fn() }));

vi.mock('@ionic/react', () => ({
  IonList: ({ children }: any) => <div>{children}</div>,
  IonItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
  IonLabel: ({ children }: any) => <div>{children}</div>,
  IonIcon: () => null,
}));

vi.mock('ionicons/icons', () => ({ people: 'people', videocam: 'videocam' }));
vi.mock('./Notificaciones.css', () => ({}));
vi.mock('./MantenedoresPopover.css', () => ({}));
vi.mock('./Cameras', () => ({ default: () => null }));

import { MantenedoresPopover } from './MantenedoresPopover';
import { useUser } from '../UserContext';

const defaultProps = {
  cameras: [],
  nombreMantenedor: 'Cámaras',
  tipoMantenedor: 1,
  formatearFecha: vi.fn(),
  onOpenModal: vi.fn(),
  onClose: vi.fn(),
};

const renderAdmin = (props = {}) => {
  vi.mocked(useUser).mockReturnValue({ user: { rol: 2 } } as any);
  return render(<MantenedoresPopover {...defaultProps} {...props} />);
};

const renderOperador = (props = {}) => {
  vi.mocked(useUser).mockReturnValue({ user: { rol: 1 } } as any);
  return render(<MantenedoresPopover {...defaultProps} {...props} />);
};

describe('MantenedoresPopover.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('muestra el título Mantenedores', () => {
    renderAdmin();
    expect(screen.getByText('Mantenedores')).toBeTruthy();
  });

  it('muestra la opción Cámaras siempre', () => {
    renderAdmin();
    expect(screen.getByText('Cámaras')).toBeTruthy();
  });

  it('muestra la opción Usuarios solo para admin (rol 2)', () => {
    renderAdmin();
    expect(screen.getByText('Usuarios')).toBeTruthy();
  });

  it('NO muestra la opción Usuarios para operador (rol 1)', () => {
    renderOperador();
    expect(screen.queryByText('Usuarios')).toBeNull();
  });

  it('llama a onClose y onOpenModal("cameras") al hacer clic en Cámaras', () => {
    const onOpenModal = vi.fn();
    const onClose = vi.fn();
    renderAdmin({ onOpenModal, onClose });
    fireEvent.click(screen.getByText('Cámaras'));
    expect(onClose).toHaveBeenCalled();
    expect(onOpenModal).toHaveBeenCalledWith('cameras');
  });

  it('llama a onClose y onOpenModal("users") al hacer clic en Usuarios', () => {
    const onOpenModal = vi.fn();
    const onClose = vi.fn();
    renderAdmin({ onOpenModal, onClose });
    fireEvent.click(screen.getByText('Usuarios'));
    expect(onClose).toHaveBeenCalled();
    expect(onOpenModal).toHaveBeenCalledWith('users');
  });

  it('no llama a onClose si no se pasa la prop', () => {
    const onOpenModal = vi.fn();
    renderAdmin({ onOpenModal, onClose: undefined });
    fireEvent.click(screen.getByText('Cámaras'));
    expect(onOpenModal).toHaveBeenCalledWith('cameras');
  });
});