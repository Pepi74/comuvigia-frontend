import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('@ionic/react', () => ({
  IonModal: ({ children, isOpen }: any) => isOpen ? <div data-testid="modal">{children}</div> : null,
  IonContent: ({ children }: any) => <div>{children}</div>,
  IonHeader: ({ children }: any) => <div>{children}</div>,
  IonToolbar: ({ children }: any) => <div>{children}</div>,
  IonTitle: ({ children }: any) => <h2>{children}</h2>,
  IonButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { CameraModal } from './CameraModal';
import type { Camera } from '../types/Camera';

const cameraConExterno: Camera = {
  id: 1, nombre: 'Cámara Norte', direccion: 'Av. Principal 123',
  estado_camara: true, ultima_conexion: '', total_alertas: 0,
  id_sector: 1, zona_interes: '', posicion: [-33.5, -70.6],
  link_camara: 'rtsp://192.168.1.1/stream',
  link_camara_externo: 'http://192.168.1.1/mjpeg',
};

const cameraSinExterno: Camera = {
  ...cameraConExterno,
  link_camara_externo: '',
};

describe('CameraModal.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('no renderiza nada cuando camera es null', () => {
    render(<CameraModal open={true} onClose={vi.fn()} camera={null} />);
    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('no renderiza nada cuando open=false', () => {
    render(<CameraModal open={false} onClose={vi.fn()} camera={cameraConExterno} />);
    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('renderiza el modal cuando open=true y camera no es null', () => {
    render(<CameraModal open={true} onClose={vi.fn()} camera={cameraConExterno} />);
    expect(screen.getByTestId('modal')).toBeTruthy();
  });

  it('muestra el nombre de la cámara en el título', () => {
    render(<CameraModal open={true} onClose={vi.fn()} camera={cameraConExterno} />);
    expect(screen.getByText('Cámara Norte')).toBeTruthy();
  });

  it('muestra la dirección de la cámara', () => {
    render(<CameraModal open={true} onClose={vi.fn()} camera={cameraConExterno} />);
    expect(screen.getByText('Av. Principal 123')).toBeTruthy();
  });

  it('muestra imagen cuando hay link_camara_externo', () => {
    render(<CameraModal open={true} onClose={vi.fn()} camera={cameraConExterno} />);
    const img = screen.getByAltText('Streaming de cámara');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('http://192.168.1.1/mjpeg');
  });

  it('muestra video cuando no hay link_camara_externo', () => {
    render(<CameraModal open={true} onClose={vi.fn()} camera={cameraSinExterno} />);
    const video = document.querySelector('video');
    expect(video).toBeTruthy();
    expect(video?.getAttribute('src')).toBe('rtsp://192.168.1.1/stream');
  });

  it('muestra botón Cerrar con link externo', () => {
    render(<CameraModal open={true} onClose={vi.fn()} camera={cameraConExterno} />);
    expect(screen.getByText('Cerrar')).toBeTruthy();
  });

  it('muestra botones Revisar y Cerrar sin link externo', () => {
    render(<CameraModal open={true} onClose={vi.fn()} camera={cameraSinExterno} />);
    expect(screen.getByText('Revisar')).toBeTruthy();
    expect(screen.getByText('Cerrar')).toBeTruthy();
  });

  it('llama a onClose al hacer clic en Cerrar (con externo)', () => {
    const onClose = vi.fn();
    render(<CameraModal open={true} onClose={onClose} camera={cameraConExterno} />);
    fireEvent.click(screen.getByText('Cerrar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('llama a onClose al hacer clic en Cerrar (sin externo)', () => {
    const onClose = vi.fn();
    render(<CameraModal open={true} onClose={onClose} camera={cameraSinExterno} />);
    fireEvent.click(screen.getByText('Cerrar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('llama a fetch al hacer clic en Revisar', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    const onClose = vi.fn();
    render(<CameraModal open={true} onClose={onClose} camera={cameraSinExterno} />);
    fireEvent.click(screen.getByText('Revisar'));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/casos_prueba'),
        expect.any(Object)
      );
    });
  });

  it('detecta URL de streaming HTTP en link_camara_externo', () => {
    const cam = { ...cameraConExterno, link_camara_externo: 'http://cam.example.com/live' };
    render(<CameraModal open={true} onClose={vi.fn()} camera={cam} />);
    expect(screen.getByAltText('Streaming de cámara')).toBeTruthy();
  });
});