import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('axios', () => ({
  default: { get: vi.fn() },
}));

vi.mock('@ionic/react', () => ({
  IonSpinner: () => <div data-testid="spinner" />,
  IonTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock('../hooks/useAviso', () => ({
  useAviso: () => ({
    alertState: { isOpen: false, type: 'error', title: '', message: '', style: 'simple', duration: 3000 },
    showError: vi.fn(),
    closeAlert: vi.fn(),
  }),
}));

vi.mock('../components/Aviso', () => ({
  default: () => null,
}));

vi.mock('./BuscadorGrabaciones.css', () => ({}));

const mockFetch = vi.fn();
global.fetch = mockFetch;
global.URL.createObjectURL = vi.fn(() => 'blob:mock');
global.URL.revokeObjectURL = vi.fn();

import { BuscadorGrabaciones } from './BuscadorGrabaciones';
import axios from 'axios';

const camarasMock = [
  { id: 1, nombre: 'Cámara Norte', direccion: 'Av. Principal', estado_camara: true,
    ultima_conexion: '', total_alertas: 0, id_sector: 1, zona_interes: '',
    posicion: [-33.5, -70.6], link_camara: '', link_camara_externo: '' },
];

describe('BuscadorGrabaciones.tsx', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    (axios.get as any).mockResolvedValue({ data: camarasMock });
  });

  it('renderiza el título', async () => {
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByText('Buscador de grabaciones por cámara')).toBeTruthy());
  });

  it('renderiza el select de cámara', async () => {
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByLabelText('Cámara')).toBeTruthy());
  });

  it('renderiza el input de fecha inicio', async () => {
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByLabelText('Fecha de inicio')).toBeTruthy());
  });

  it('renderiza el select de rango horario', async () => {
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByLabelText('Rango horario')).toBeTruthy());
  });

  it('renderiza el botón Buscar', async () => {
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByText('Buscar')).toBeTruthy());
  });

  it('muestra las cámaras en el select después de cargar', async () => {
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByText('Cámara Norte')).toBeTruthy());
  });

  it('muestra "No hay grabaciones disponibles" por defecto', async () => {
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByText('No hay grabaciones disponibles')).toBeTruthy());
  });

  it('llama a fetch al hacer clic en Buscar', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ videos: [], pagination: { total: 0 } }),
    });
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByText('Buscar')).toBeTruthy());
    fireEvent.click(screen.getByText('Buscar'));
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
  });

  it('muestra error cuando la búsqueda falla', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByText('Buscar')).toBeTruthy());
    fireEvent.click(screen.getByText('Buscar'));
    await waitFor(() => {
      // Después del error, no hay grabaciones y el spinner desaparece
      expect(screen.queryByTestId('spinner')).toBeNull();
      expect(screen.getByText('No hay grabaciones disponibles')).toBeTruthy();
    });
  });

  it('cambia el rango horario al seleccionar una opción', async () => {
    render(<BuscadorGrabaciones />);
    await waitFor(() => expect(screen.getByLabelText('Rango horario')).toBeTruthy());
    fireEvent.change(screen.getByLabelText('Rango horario'), { target: { value: 'mañana' } });
    expect((screen.getByLabelText('Rango horario') as HTMLSelectElement).value).toBe('mañana');
  });

  it('carga las cámaras desde el backend al montar', async () => {
    render(<BuscadorGrabaciones />);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/camaras'),
        expect.any(Object)
      );
    });
  });
});