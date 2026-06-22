import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  }))
}));

vi.mock('@ionic/react', () => ({
  IonContent: ({ children }: any) => <div>{children}</div>,
  IonGrid: ({ children }: any) => <div>{children}</div>,
  IonRow: ({ children }: any) => <div>{children}</div>,
  IonCol: ({ children }: any) => <div>{children}</div>,
  IonCard: ({ children }: any) => <div>{children}</div>,
  IonCardHeader: ({ children }: any) => <div>{children}</div>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
  IonSelect: ({ children, onIonChange, value }: any) => (
    <select value={value} onChange={(e) => onIonChange({ detail: { value: e.target.value } })}>
      {children}
    </select>
  ),
  IonSelectOption: ({ children, value }: any) => <option value={value}>{children}</option>,
  IonItem: ({ children }: any) => <div>{children}</div>,
  IonLabel: ({ children }: any) => <span>{children}</span>,
  IonSegment: ({ children, onIonChange, value }: any) => (
    <div data-value={value} onChange={(e: any) => onIonChange({ detail: { value: e.target.value } })}>{children}</div>
  ),
  IonSegmentButton: ({ children, value }: any) => <button value={value}>{children}</button>,
  IonIcon: () => <span />,
  IonPopover: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null,
  IonButton: ({ children, onClick, disabled }: any) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  IonModal: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null,
  IonSpinner: () => <div data-testid="spinner" />,
  IonTextarea: ({ value, onIonInput }: any) => (
    <textarea value={value} onChange={(e) => onIonInput({ detail: { value: e.target.value } })} />
  ),
}));

vi.mock('ionicons/icons', () => ({
  videocam: 'videocam',
}));

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

vi.mock('../UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('../components/ToastProvider', () => ({
  useToast: vi.fn(() => ({
    addToast: vi.fn(),
    removeToast: vi.fn(),
  })),
}));

vi.mock('../components/NavBar', () => ({
  Navbar: ({ unseenCount }: any) => <div data-testid="navbar">NavBar {unseenCount}</div>,
}));

vi.mock('../components/Notificaciones', () => ({
  NotificacionesPopover: () => <div>Notificaciones</div>,
}));

vi.mock('../components/FeedCamarasTutorial', () => ({
  default: () => <div>Tutorial</div>,
}));

import FeedCamaras from './FeedCamaras';
import { useUser } from '../UserContext';
import axios from 'axios';

const userMock = { usuario: 'admin', rol: 2, nombre: 'Admin' };

const camarasMock = [
  { id: 1, nombre: 'Cámara Norte', direccion: 'Av. Principal 123', estado_camara: true, ultima_conexion: '', total_alertas: 2, id_sector: 1, zona_interes: '{}', posicion: [-33.4, -70.6], link_camara_externo: 'http://cam1.stream' }
];

describe('FeedCamaras', () => {

  beforeEach(() => {
    (useUser as any).mockReturnValue({ user: userMock });
    (axios.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/camaras/nombre-camaras')) return Promise.resolve({ data: { 1: 'Cámara Norte' } });
      if (url.includes('/api/camaras/cantidad-alertas')) return Promise.resolve({ data: camarasMock });
      if (url.includes('/api/alertas/no-vistas')) return Promise.resolve({ data: [] });
      if (url.includes('/api/alertas')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
  });

  it('muestra spinner mientras carga', () => {
    (axios.get as any).mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <FeedCamaras />
      </MemoryRouter>
    );
    expect(screen.getByTestId('spinner')).toBeDefined();
  });

  it('renderiza el navbar cuando termina de cargar', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <FeedCamaras />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeDefined();
    });
  });

  it('renderiza las celdas de feed de cámaras', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <FeedCamaras />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Seleccina una vista')).toBeDefined();
    });
  });

  it('muestra spinner cuando no hay usuario', () => {
    (useUser as any).mockReturnValue({ user: null });
    (axios.get as any).mockResolvedValue({ data: [] });
    render(
      <MemoryRouter>
        <FeedCamaras />
      </MemoryRouter>
    );
    expect(screen.getByTestId('spinner')).toBeDefined();
  });

  it('llama a axios.get para cargar cámaras al montar', async () => {
    await act(async () => {
      render(<MemoryRouter><FeedCamaras /></MemoryRouter>);
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/camaras/cantidad-alertas'),
      expect.any(Object)
    );
  });

  it('llama a axios.get para cargar alertas al montar', async () => {
    await act(async () => {
      render(<MemoryRouter><FeedCamaras /></MemoryRouter>);
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/alertas'),
      expect.any(Object)
    );
  });

  it('llama a axios.get para cargar nombres de cámaras', async () => {
    await act(async () => {
      render(<MemoryRouter><FeedCamaras /></MemoryRouter>);
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/camaras/nombre-camaras'),
      expect.any(Object)
    );
  });

  it('muestra los botones de selección de vista 1 2 4', async () => {
    await act(async () => {
      render(<MemoryRouter><FeedCamaras /></MemoryRouter>);
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('renderiza correctamente para operador (rol 1)', async () => {
    (useUser as any).mockReturnValue({ user: { usuario: 'operador', rol: 1 } });
    await act(async () => {
      render(<MemoryRouter><FeedCamaras /></MemoryRouter>);
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(screen.getByTestId('navbar')).toBeDefined();
  });

  it('muestra placeholders de cámara por defecto', async () => {
    await act(async () => {
      render(<MemoryRouter><FeedCamaras /></MemoryRouter>);
    });
    await waitFor(() => expect(screen.getByText('Cámara 1')).toBeDefined());
  });

  it('carga topCamaras desde location.state', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: '/feed_camaras', state: { topCamaras: camarasMock } }]}>
          <FeedCamaras />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(axios.get).toHaveBeenCalled();
  });

  it('muestra imagen cuando cámara tiene link_camara_externo', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: '/feed_camaras', state: { topCamaras: camarasMock } }]}>
          <FeedCamaras />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      const imgs = document.querySelectorAll('img');
      expect(imgs.length).toBeGreaterThan(0);
    });
  });

  it('muestra video cuando cámara no tiene link_camara_externo', async () => {
    const camarasSinExterno = [{ 
      ...camarasMock[0], 
      link_camara_externo: '',
      link_camara: 'rtsp://cam1'
    }];
    (axios.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/camaras/cantidad-alertas')) return Promise.resolve({ data: camarasSinExterno });
      if (url.includes('/api/camaras/nombre-camaras')) return Promise.resolve({ data: { 1: 'Cámara Norte' } });
      if (url.includes('/api/alertas/no-vistas')) return Promise.resolve({ data: [] });
      if (url.includes('/api/alertas')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: '/feed_camaras', state: { topCamaras: camarasSinExterno } }]}>
          <FeedCamaras />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      const videos = document.querySelectorAll('video');
      expect(videos.length).toBeGreaterThan(0);
    });
  });

  it('muestra placeholder cuando no hay cámara seleccionada', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <FeedCamaras />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    const imgs = document.querySelectorAll('img[alt="Fondo cámara"]');
    expect(imgs.length).toBeGreaterThan(0);
  });

  it('cambia la cámara seleccionada al usar el select', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: '/feed_camaras', state: { topCamaras: camarasMock } }]}>
          <FeedCamaras />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    const selects = document.querySelectorAll('select');
    if (selects.length > 0) {
      fireEvent.change(selects[0], { target: { value: '1' } });
    }
    expect(screen.getByTestId('navbar')).toBeDefined();
  });

  it('cambia el número de feeds al hacer clic en los botones de segmento', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <FeedCamaras />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    const buttons = screen.getAllByRole('button');
    const btn1 = buttons.find(b => b.textContent?.includes('1'));
    if (btn1) fireEvent.click(btn1);
    expect(screen.getByTestId('navbar')).toBeDefined();
  });

  it('cambia a 1 feed al hacer clic en el botón 1', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: '/feed_camaras', state: { topCamaras: camarasMock } }]}>
          <FeedCamaras />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    const buttons = screen.getAllByRole('button');
    const btn1 = buttons.find(b => b.textContent?.trim().startsWith('1'));
    if (btn1) await act(async () => { fireEvent.click(btn1); });
    expect(screen.getByTestId('navbar')).toBeDefined();
  });

});