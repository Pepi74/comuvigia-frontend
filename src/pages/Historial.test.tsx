import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';

// Mock Socket.io
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  }))
}));

// Mock Ionic
vi.mock('@ionic/react', () => ({
  IonContent: ({ children }: any) => <div>{children}</div>,
  IonLabel: ({ children }: any) => <span>{children}</span>,
  IonList: ({ children }: any) => <ul>{children}</ul>,
  IonItem: ({ children }: any) => <li>{children}</li>,
  IonPopover: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null,
  IonButton: ({ children, onClick, disabled }: any) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  IonSpinner: () => <div data-testid="spinner" />,
  IonChip: ({ children }: any) => <span>{children}</span>,
  IonIcon: () => <span />,
  IonTitle: ({ children }: any) => <h2>{children}</h2>,
  IonSelectOption: ({ children, value }: any) => <option value={value}>{children}</option>,
  IonSearchbar: ({ onIonInput, value }: any) => (
    <input
      data-testid="searchbar"
      value={value}
      onChange={(e) => onIonInput({ target: { value: e.target.value } })}
    />
  ),
  IonSelect: ({ children, onIonChange, value }: any) => (
    <select value={value} onChange={(e) => onIonChange({ detail: { value: e.target.value } })}>
      {children}
    </select>
  ),
  IonTextarea: ({ value, onIonChange }: any) => (
    <textarea value={value} onChange={(e) => onIonChange({ detail: { value: e.target.value } })} />
  ),
}));

// Mock ionicons
vi.mock('ionicons/icons', () => ({
  alertCircle: 'alertCircle',
  time: 'time',
  checkmarkCircle: 'checkmarkCircle',
  closeCircleOutline: 'closeCircleOutline',
  create: 'create',
  trash: 'trash',
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock UserContext
vi.mock('../UserContext', () => ({
  useUser: vi.fn(),
}));

// Mock componentes internos
vi.mock('../components/NavBar', () => ({
  Navbar: ({ unseenCount }: any) => <div data-testid="navbar">NavBar {unseenCount}</div>,
}));

vi.mock('../components/Notificaciones', () => ({
  NotificacionesPopover: () => <div>Notificaciones</div>,
}));

vi.mock('../components/HistorialTutorial', () => ({
  default: () => <div>Tutorial</div>,
}));

import Historial from './Historial';
import { useUser } from '../UserContext';
import axios from 'axios';

const userMock = { usuario: 'admin', rol: 2, nombre: 'Admin' };

const camarasMock = [
  { id: 1, nombre: 'Cámara Norte', direccion: 'Av. Principal 123', estado_camara: true, ultima_conexion: '', total_alertas: 2, id_sector: 1, zona_interes: '{}', posicion: [-33.4, -70.6] }
];

const alertasMock = [
  { id: 1, id_camara: 1, mensaje: 'Merodeo detectado', hora_suceso: new Date().toISOString(), score_confianza: 0.85, estado: 0, descripcion_suceso: 'Descripción test', clip: null },
  { id: 2, id_camara: 1, mensaje: 'Portonazo', hora_suceso: new Date().toISOString(), score_confianza: 0.5, estado: 1, descripcion_suceso: '', clip: null },
];

describe('Historial', () => {

  beforeEach(() => {
    (useUser as any).mockReturnValue({ user: userMock });
    (axios.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/camaras/nombre-camaras')) return Promise.resolve({ data: { 1: 'Cámara Norte' } });
      if (url.includes('/api/camaras')) return Promise.resolve({ data: camarasMock });
      if (url.includes('/api/alertas/no-vistas')) return Promise.resolve({ data: [] });
      if (url.includes('/api/alertas')) return Promise.resolve({ data: alertasMock });
      return Promise.resolve({ data: [] });
    });
  });

  it('renderiza el navbar', async () => {
    await act(async () => { render(<Historial />); });
    expect(screen.getByTestId('navbar')).toBeDefined();
  });

  it('muestra las alertas cargadas', async () => {
    await act(async () => { render(<Historial />); });
    await waitFor(() => {
      expect(screen.getByText('Merodeo detectado')).toBeDefined();
    });
  });

  it('muestra el nombre de la cámara', async () => {
    await act(async () => { render(<Historial />); });
    await waitFor(() => {
      expect(screen.getByText('Cámara Norte')).toBeDefined();
    });
  });

  it('muestra mensaje cuando no hay alertas', async () => {
    (axios.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/camaras/nombre-camaras')) return Promise.resolve({ data: {} });
      if (url.includes('/api/camaras')) return Promise.resolve({ data: [] });
      if (url.includes('/api/alertas')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    await act(async () => { render(<Historial />); });
    await waitFor(() => {
      expect(screen.getByText('No hay alertas disponibles')).toBeDefined();
    });
  });

  it('botón limpiar filtros resetea la búsqueda', async () => {
    await act(async () => { render(<Historial />); });
    await waitFor(() => expect(screen.getByText('Limpiar filtros')).toBeDefined());
    fireEvent.click(screen.getByText('Limpiar filtros'));
  });

  it('botón buscar llama al endpoint de filtro', async () => {
    (axios.get as any).mockImplementation((url: string) => {
      if (url.includes('historial-filtro')) return Promise.resolve({ data: alertasMock });
      if (url.includes('/api/camaras/nombre-camaras')) return Promise.resolve({ data: { 1: 'Cámara Norte' } });
      if (url.includes('/api/camaras')) return Promise.resolve({ data: camarasMock });
      if (url.includes('/api/alertas/no-vistas')) return Promise.resolve({ data: [] });
      if (url.includes('/api/alertas')) return Promise.resolve({ data: alertasMock });
      return Promise.resolve({ data: [] });
    });

    await act(async () => { render(<Historial />); });

    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: 'merodeo' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Buscar'));
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('historial-filtro'),
      expect.any(Object)
    );
  });

  it('no carga datos si no hay usuario', async () => {
    (useUser as any).mockReturnValue({ user: null });
    await act(async () => { render(<Historial />); });
    expect(screen.queryByText('Merodeo detectado')).toBeNull();
  });

  it('muestra el panel de detalle al hacer clic en una alerta', async () => {
    await act(async () => { render(<Historial />); });
    await waitFor(() => expect(screen.getByText('Merodeo detectado')).toBeDefined());
    fireEvent.click(screen.getByText('Merodeo detectado'));
    await waitFor(() => {
      expect(screen.getByText('Editar descripción')).toBeDefined();
    });
  });

  it('muestra botones Editar y Eliminar en el panel de detalle', async () => {
    await act(async () => { render(<Historial />); });
    await waitFor(() => expect(screen.getByText('Merodeo detectado')).toBeDefined());
    fireEvent.click(screen.getByText('Merodeo detectado'));
    await waitFor(() => {
      expect(screen.getByText('Editar descripción')).toBeDefined();
      expect(screen.getByText('Eliminar alerta')).toBeDefined();
    });
  });

  it('activa modo edición al hacer clic en Editar descripción', async () => {
    await act(async () => { render(<Historial />); });
    await waitFor(() => expect(screen.getByText('Merodeo detectado')).toBeDefined());
    fireEvent.click(screen.getByText('Merodeo detectado'));
    await waitFor(() => expect(screen.getByText('Editar descripción')).toBeDefined());
    fireEvent.click(screen.getByText('Editar descripción'));
    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeDefined();
      expect(screen.getByText('Cancelar')).toBeDefined();
    });
  });

  it('cancela la edición al hacer clic en Cancelar', async () => {
    await act(async () => { render(<Historial />); });
    await waitFor(() => expect(screen.getByText('Merodeo detectado')).toBeDefined());
    fireEvent.click(screen.getByText('Merodeo detectado'));
    await waitFor(() => expect(screen.getByText('Editar descripción')).toBeDefined());
    fireEvent.click(screen.getByText('Editar descripción'));
    await waitFor(() => expect(screen.getByText('Cancelar')).toBeDefined());
    fireEvent.click(screen.getByText('Cancelar'));
    await waitFor(() => {
      expect(screen.getByText('Editar descripción')).toBeDefined();
    });
  });

  it('llama a axios.put al guardar descripción', async () => {
    (axios.put as any).mockResolvedValue({ data: {} });
    await act(async () => { render(<Historial />); });
    await waitFor(() => expect(screen.getByText('Merodeo detectado')).toBeDefined());
    fireEvent.click(screen.getByText('Merodeo detectado'));
    await waitFor(() => expect(screen.getByText('Editar descripción')).toBeDefined());
    fireEvent.click(screen.getByText('Editar descripción'));
    const textboxes = screen.getAllByRole('textbox');
    const textarea = textboxes[textboxes.length - 1];
    fireEvent.change(textarea, { target: { value: 'Nueva descripción' } });
    await act(async () => { fireEvent.click(screen.getByText('Guardar')); });
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/alertas/1'),
      expect.objectContaining({ descripcion_suceso: 'Nueva descripción' }),
      expect.any(Object)
    );
  });

  it('llama a axios.delete al eliminar alerta', async () => {
    (axios.delete as any).mockResolvedValue({ data: {} });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await act(async () => { render(<Historial />); });
    await waitFor(() => expect(screen.getByText('Merodeo detectado')).toBeDefined());
    fireEvent.click(screen.getByText('Merodeo detectado'));
    await waitFor(() => expect(screen.getByText('Eliminar alerta')).toBeDefined());
    await act(async () => { fireEvent.click(screen.getByText('Eliminar alerta')); });
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/alertas/1'),
      expect.any(Object)
    );
  });

  it('selecciona una cámara al hacer clic en ella', async () => {
    await act(async () => { render(<Historial />); });
    await waitFor(() => expect(screen.getByText('Cámara Norte')).toBeDefined());
    fireEvent.click(screen.getByText('Cámara Norte'));
    await waitFor(() => {
      expect(screen.getByText(/Alertas de Cámara Norte/)).toBeDefined();
    });
  });

});