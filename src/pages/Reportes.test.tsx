import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

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
  IonPopover: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null,
  IonButton: ({ children, onClick, disabled }: any) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  IonSpinner: () => <div data-testid="spinner" />,
  IonModal: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null,
  IonTextarea: ({ value, onIonInput }: any) => (
    <textarea value={value} onChange={(e) => onIonInput({ detail: { value: e.target.value } })} />
  ),
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

vi.mock('../components/ReportesTutorial', () => ({
  default: () => <div>Tutorial</div>,
}));

vi.mock('../components/Estadisticas/FiltroPeriodo', () => ({
  default: () => <div data-testid="filtro">FiltroPeriodo</div>,
}));

vi.mock('../components/Estadisticas/EstadisticasTotales', () => ({
  default: () => <div data-testid="estadisticas">EstadisticasTotales</div>,
}));

vi.mock('../components/Estadisticas/GraficoSector', () => ({
  default: () => <div data-testid="grafico-sector">GraficoSector</div>,
}));

vi.mock('../components/Estadisticas/GraficoTipo', () => ({
  default: () => <div data-testid="grafico-tipo">GraficoTipo</div>,
}));

vi.mock('../components/Estadisticas/GraficoHorarios', () => ({
  default: () => <div data-testid="grafico-horarios">GraficoHorarios</div>,
}));

vi.mock('../components/Estadisticas/RankingCamaras', () => ({
  default: () => <div data-testid="ranking">Ranking</div>,
}));

vi.mock('../components/Estadisticas/DetalleSectores', () => ({
  default: () => <div data-testid="detalle-sectores">DetalleSectores</div>,
}));

vi.mock('../components/InformeDescarga', () => ({
  default: () => <div data-testid="informe-descarga">InformeDescarga</div>,
}));

import Reportes from './Reportes';
import { useUser } from '../UserContext';
import axios from 'axios';

const userMock = { usuario: 'admin', rol: 2, nombre: 'Admin' };

const dataMock = {
  success: true,
  estadisticas_totales: {
    total_alertas: 10,
    alertas_confirmadas: 5,
    falsos_positivos: 2,
    merodeos: 3,
    portonazos: 2,
    asaltos_hogar: 1,
  },
  sectores: [
    { id_sector: 1, nombre_sector: 'Sector Norte', total_alertas: 5 }
  ],
  horarios: [
    { hora: 8, merodeos: 2, portonazos: 1, asaltos_hogar: 0 }
  ]
};

describe('Reportes', () => {

  beforeEach(() => {
    (useUser as any).mockReturnValue({ user: userMock });

    // Mock de fetch para estadisticas-totales
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dataMock)
    });

    (axios.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/camaras/nombre-camaras')) return Promise.resolve({ data: { 1: 'Cámara Norte' } });
      if (url.includes('/api/camaras/cantidad-alertas')) return Promise.resolve({ data: [] });
      if (url.includes('/api/alertas/no-vistas')) return Promise.resolve({ data: [] });
      if (url.includes('/api/alertas')) return Promise.resolve({ data: [] });
      if (url.includes('/api/usuarios')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
  });

  it('muestra spinner mientras carga', () => {
    (axios.get as any).mockImplementation(() => new Promise(() => {}));
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    render(<Reportes />);
    expect(screen.getByTestId('spinner')).toBeDefined();
  });

  it('renderiza el navbar cuando termina de cargar', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeDefined();
    });
  });

  it('renderiza los componentes de estadísticas', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByTestId('filtro')).toBeDefined();
      expect(screen.getByTestId('estadisticas')).toBeDefined();
    });
  });

  it('muestra spinner cuando no hay usuario', () => {
    (useUser as any).mockReturnValue({ user: null });
    render(<Reportes />);
    expect(screen.getByTestId('spinner')).toBeDefined();
  });

  it('muestra error cuando falla la carga de datos', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({})
    });

    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los datos')).toBeDefined();
    });
  });

  it('llama a fetch para cargar estadísticas al montar', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/alertas/estadisticas-totales'),
      expect.any(Object)
    );
  });

  it('llama a axios.get para cargar alertas al montar', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/alertas'),
      expect.any(Object)
    );
  });

  it('llama a axios.get para cargar cámaras al montar', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/camaras/cantidad-alertas'),
      expect.any(Object)
    );
  });

  it('llama a axios.get para cargar nombres de cámaras', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/camaras/nombre-camaras'),
      expect.any(Object)
    );
  });

  it('renderiza gráfico de sector cuando hay datos', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByTestId('grafico-sector')).toBeDefined();
    });
  });

  it('renderiza gráfico de tipo cuando hay datos', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByTestId('grafico-tipo')).toBeDefined();
    });
  });

  it('renderiza detalle de sectores cuando hay datos', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByTestId('detalle-sectores')).toBeDefined();
    });
  });

  it('renderiza InformeDescarga cuando hay datos', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByTestId('informe-descarga')).toBeDefined();
    });
  });

  it('renderiza ranking de cámaras cuando hay datos', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByTestId('ranking')).toBeDefined();
    });
  });

  it('renderiza gráfico de horarios cuando hay datos de horarios', async () => {
    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByTestId('grafico-horarios')).toBeDefined();
    });
  });

  it('renderiza correctamente para operador (rol 1)', async () => {
    (useUser as any).mockReturnValue({ user: { usuario: 'operador', rol: 1 } });
    await act(async () => { render(<Reportes />); });
    await waitFor(() => expect(screen.getByTestId('navbar')).toBeDefined());
    expect(screen.getByTestId('navbar')).toBeDefined();
  });

  it('muestra mensaje cuando fetch retorna datos nulos', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null)
    });
    await act(async () => { render(<Reportes />); });
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los datos')).toBeDefined();
    });
  });

});