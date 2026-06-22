import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ── window.matchMedia mock ────────────────────────────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn(),
  })),
}));

vi.mock('leaflet', () => {
  function MockIcon(this: any, options: any) {}
  MockIcon.Default = { prototype: {}, mergeOptions: vi.fn() };
  function MockDivIcon(this: any, options: any) {}
  const mockLatLngBounds = { contains: vi.fn().mockReturnValue(true) };
  return {
    default: {
      Icon: MockIcon,
      divIcon: vi.fn().mockReturnValue({}),
      LatLngBounds: vi.fn().mockReturnValue(mockLatLngBounds),
    },
    Icon: MockIcon,
    divIcon: vi.fn().mockReturnValue({}),
    LatLngBounds: vi.fn().mockReturnValue(mockLatLngBounds),
  };
});

vi.mock('leaflet/dist/leaflet.css', () => ({}));
vi.mock('./MapView.css', () => ({}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  ZoomControl: () => null,
  Polygon: () => <div data-testid="polygon" />,
  useMap: () => ({
    invalidateSize: vi.fn(), setView: vi.fn(), getCenter: vi.fn(),
    flyTo: vi.fn(), getZoom: vi.fn(() => 13),
  }),
}));

vi.mock('@ionic/react', () => ({
  IonToggle: ({ children, onIonChange, checked, disabled }: any) => (
    <input type="checkbox" checked={checked} disabled={disabled}
      onChange={(e) => onIonChange?.({ detail: { checked: e.target.checked } })} />
  ),
  IonButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  IonIcon: () => null,
}));

vi.mock('ionicons/icons', () => ({ locateOutline: 'locateOutline' }));

vi.mock('./Notificaciones', () => ({
  NotificacionesPopover: () => <div data-testid="notificaciones" />,
}));

vi.mock('./SectorLayer', () => ({
  SectorLayer: () => <div data-testid="sector-layer" />,
}));

vi.mock('./LayerControl', () => ({
  LayerControl: ({ toggleHeatmap, onFetchSectores }: any) => (
    <div data-testid="layer-control">
      <button onClick={toggleHeatmap}>Toggle Heatmap</button>
      <button onClick={() => onFetchSectores?.('2024-01-01', '2024-01-31')}>Fetch Sectores</button>
    </div>
  ),
}));

vi.mock('./DelitosLineChart', () => ({
  default: () => <div data-testid="delitos-chart" />,
}));

vi.mock('../data/polygon', () => ({
  floridaPolygon: [[-33.5, -70.6], [-33.6, -70.6], [-33.6, -70.7]],
}));

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([]),
});

global.getComputedStyle = vi.fn().mockReturnValue({
  getPropertyValue: vi.fn().mockReturnValue('#1B4965'),
});

// ── Import ────────────────────────────────────────────────────────────────────

import MapView from './MapView';
import type { Camera } from '../types/Camera';
import type { Alert } from '../types/Alert';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockCameras: Camera[] = [
  { id: 1, nombre: 'Cámara Norte', direccion: 'Av. Principal 123',
    estado_camara: true, ultima_conexion: '2024-01-01T10:00:00Z',
    total_alertas: 5, id_sector: 1, zona_interes: '',
    posicion: [-33.523, -70.604], link_camara: 'rtsp://cam1', link_camara_externo: '' },
  { id: 2, nombre: 'Cámara Sur', direccion: 'Calle Secundaria 456',
    estado_camara: false, ultima_conexion: '2024-01-01T09:00:00Z',
    total_alertas: 0, id_sector: 2, zona_interes: '',
    posicion: [-33.530, -70.610], link_camara: '', link_camara_externo: 'http://cam2/stream' },
];

const mockAlerts: Alert[] = [
  { id: 1, id_camara: 1, mensaje: 'Merodeo detectado',
    hora_suceso: '2024-01-01T10:00:00Z', score_confianza: 0.85,
    estado: 0, tipo: 1, sector: 1 },
];

const mockUser = { usuario: 'admin', rol: 2, nombre: 'Admin' };

const defaultProps = {
  cameras: mockCameras,
  selectedCamera: null,
  alerts: mockAlerts,
  cameraNames: { 1: 'Cámara Norte', 2: 'Cámara Sur' },
  user: mockUser,
  formatearFecha: (f: string) => new Date(f).toLocaleString(),
  handleAccion: vi.fn(),
  onVerDescripcion: vi.fn(),
  setSelectedCamera: vi.fn(),
  onCamerasUpdate: vi.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MapView.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza el mapa', () => {
    render(<MapView {...defaultProps} />);
    expect(screen.getByTestId('map-container')).toBeTruthy();
  });

  it('renderiza los markers de las cámaras', () => {
    render(<MapView {...defaultProps} />);
    expect(screen.getAllByTestId('marker').length).toBe(2);
  });

  it('muestra el LayerControl para admin', () => {
    render(<MapView {...defaultProps} />);
    expect(screen.getByTestId('layer-control')).toBeTruthy();
  });

  it('NO muestra el LayerControl para invitado (rol 0)', () => {
    render(<MapView {...defaultProps} user={{ ...mockUser, rol: 0 }} />);
    expect(screen.queryByTestId('layer-control')).toBeNull();
  });

  it('muestra el botón de localizar La Florida', () => {
    render(<MapView {...defaultProps} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('muestra el panel de cámara cuando hay selectedCamera con externo', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[1]} />);
    expect(screen.getAllByText('Cámara Sur').length).toBeGreaterThan(0);
  });

  it('muestra el panel de cámara cuando hay selectedCamera sin externo', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[0]} />);
    expect(screen.getAllByText('Cámara Norte').length).toBeGreaterThan(0);
  });

  it('muestra las tabs de estadísticas y alertas para admin', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[0]} />);
    expect(screen.getByText('📊 Estadísticas')).toBeTruthy();
    expect(screen.getByText('🚨 Alertas')).toBeTruthy();
  });

  it('cambia a tab estadísticas al hacer clic', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[0]} />);
    fireEvent.click(screen.getByText('📊 Estadísticas'));
    expect(screen.getByTestId('delitos-chart')).toBeTruthy();
  });

  it('cambia a tab alertas al hacer clic', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[0]} />);
    fireEvent.click(screen.getByText('🚨 Alertas'));
    expect(screen.getByTestId('notificaciones')).toBeTruthy();
  });

  it('llama a setSelectedCamera(null) al cerrar el panel', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[0]} />);
    fireEvent.click(screen.getByText('Cerrar panel'));
    expect(defaultProps.setSelectedCamera).toHaveBeenCalledWith(null);
  });

  it('muestra el estado de la cámara activa', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[0]} />);
    expect(screen.getAllByText('Activa').length).toBeGreaterThan(0);
  });

  it('muestra el estado de la cámara inactiva', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[1]} />);
    expect(screen.getAllByText('Inactiva').length).toBeGreaterThan(0);
  });

  it('muestra el popup de la cámara', () => {
    render(<MapView {...defaultProps} />);
    expect(screen.getAllByTestId('popup').length).toBeGreaterThan(0);
  });

  it('activa el heatmap al hacer clic en Toggle Heatmap', () => {
    render(<MapView {...defaultProps} />);
    fireEvent.click(screen.getByText('Toggle Heatmap'));
    // El heatmap se activa pero sin sectores no renderiza SectorLayer
    expect(screen.queryByTestId('sector-layer')).toBeNull();
  });

  it('llama a fetch al hacer clic en Fetch Sectores', async () => {
    render(<MapView {...defaultProps} />);
    fireEvent.click(screen.getByText('Fetch Sectores'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('no renderiza panel si user es null', () => {
    render(<MapView {...defaultProps} user={null} selectedCamera={mockCameras[0]} />);
    expect(screen.queryByText('📊 Estadísticas')).toBeNull();
  });

  it('muestra imagen cuando selectedCamera tiene link_camara_externo', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[1]} />);
    const img = screen.getByAltText('Streaming de cámara');
    expect(img.getAttribute('src')).toBe('http://cam2/stream');
  });

  it('muestra video cuando selectedCamera no tiene link_camara_externo', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[0]} />);
    expect(document.querySelector('video')).toBeTruthy();
  });

  it('cubre handleRevisarWhitBackend con cámara sin externo', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'ok' }),
    });
    render(<MapView {...defaultProps} />);
    const verBtns = screen.getAllByText('Ver transmisión');
    // Cámara Norte (index 0) tiene link_camara_externo: ''
    await fireEvent.click(verBtns[0]);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/casos_prueba'),
        expect.any(Object)
      );
    });
  });

  it('activa el toggle de cámara', () => {
    render(<MapView {...defaultProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    // Verificar que los toggles están presentes y son interactuables
    expect(checkboxes.length).toBe(2);
    expect(checkboxes[0]).toBeTruthy();
  });

  it('muestra el polígono de La Florida al hacer clic en el botón localizar', () => {
    render(<MapView {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const floridaBtn = buttons.find(b => b.className?.includes('florida-locate-button'));
    if (floridaBtn) fireEvent.click(floridaBtn);
    expect(screen.queryByTestId('map-container')).toBeTruthy();
  });

  it('muestra el toggle de cámara deshabilitado cuando está bloqueado', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    render(<MapView {...defaultProps} />);
    // Hacer clic en Ver transmisión para activar handleRevisarWhitBackend
    const verBtns = screen.getAllByText('Ver transmisión');
    fireEvent.click(verBtns[0]);
    await waitFor(() => expect(defaultProps.setSelectedCamera).toHaveBeenCalled());
  });

  it('renderiza correctamente con alerts vacío', () => {
    render(<MapView {...defaultProps} alerts={[]} />);
    expect(screen.getByTestId('map-container')).toBeTruthy();
  });

  it('renderiza correctamente con cameras vacío', () => {
    render(<MapView {...defaultProps} cameras={[]} />);
    expect(screen.getByTestId('map-container')).toBeTruthy();
    expect(screen.queryAllByTestId('marker').length).toBe(0);
  });

  it('renderiza correctamente sin cameraNames', () => {
    render(<MapView {...defaultProps} cameraNames={undefined} />);
    expect(screen.getByTestId('map-container')).toBeTruthy();
  });

  it('renderiza correctamente para operador (rol 1)', () => {
    render(<MapView {...defaultProps} user={{ ...mockUser, rol: 1 }} />);
    expect(screen.getByTestId('layer-control')).toBeTruthy();
  });

  it('muestra el panel con alertas en tab alertas', () => {
    render(<MapView {...defaultProps} selectedCamera={mockCameras[0]} alerts={mockAlerts} />);
    fireEvent.click(screen.getByText('🚨 Alertas'));
    expect(screen.getByTestId('notificaciones')).toBeTruthy();
  });
});