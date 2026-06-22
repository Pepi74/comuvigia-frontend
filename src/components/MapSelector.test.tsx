import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      status: 200,
      data: {
        address: {
          road: 'Av. Principal',
          house_number: '123',
          suburb: 'La Florida',
          city: 'Santiago',
          state: 'Región Metropolitana',
          postcode: '8240000',
          country: 'Chile',
        },
      },
    }),
  },
}));

vi.mock('@ionic/react', () => ({
  IonModal: ({ children, isOpen }: any) => isOpen ? <div data-testid="map-selector-modal">{children}</div> : null,
  IonHeader: ({ children }: any) => <div>{children}</div>,
  IonToolbar: ({ children }: any) => <div>{children}</div>,
  IonTitle: ({ children }: any) => <h2>{children}</h2>,
  IonContent: ({ children }: any) => <div>{children}</div>,
  IonButtons: ({ children }: any) => <div>{children}</div>,
  IonButton: ({ children, onClick, expand, ...props }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: () => <div data-testid="marker" />,
  useMapEvents: (handlers: any) => {
    // Exponer el handler de click para tests
    (global as any).__mapClickHandler = handlers.click;
    return null;
  },
  useMap: () => ({
    setMaxBounds: vi.fn(),
    setView: vi.fn(),
    getZoom: vi.fn(() => 13),
    on: vi.fn(),
    off: vi.fn(),
    invalidateSize: vi.fn(),
    panInsideBounds: vi.fn(),
    getCenter: vi.fn(() => ({ lat: -33.523, lng: -70.604 })),
  }),
  ZoomControl: () => null,
}));

vi.mock('leaflet', () => {
  const mockLatLngBounds = {
    contains: vi.fn().mockReturnValue(true),
  };

  function MockIcon(this: any, options: any) {}
  MockIcon.Default = {
    prototype: { _getIconUrl: undefined },
    mergeOptions: vi.fn(),
  };

  const mockL = {
    Icon: MockIcon,
    LatLngBounds: vi.fn().mockReturnValue(mockLatLngBounds),
  };

  return {
    default: mockL,
    LatLngBounds: vi.fn().mockReturnValue(mockLatLngBounds),
    Icon: MockIcon,
  };
});

vi.mock('leaflet/dist/leaflet.css', () => ({}));

// ── Import ────────────────────────────────────────────────────────────────────

import MapSelector from './MapSelector';
import axios from 'axios';

// ── Tests ─────────────────────────────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onPositionSelect: vi.fn(),
  initialPosition: [-33.523, -70.604] as [number, number],
};

describe('MapSelector.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('no renderiza nada cuando isOpen=false', () => {
    render(<MapSelector {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('map-selector-modal')).toBeNull();
  });

  it('renderiza el modal cuando isOpen=true', () => {
    render(<MapSelector {...defaultProps} />);
    expect(screen.getByTestId('map-selector-modal')).toBeTruthy();
  });

  it('muestra el título correcto', () => {
    render(<MapSelector {...defaultProps} />);
    expect(screen.getByText('Seleccionar Ubicación en Santiago')).toBeTruthy();
  });

  it('renderiza el mapa', () => {
    render(<MapSelector {...defaultProps} />);
    expect(screen.getByTestId('map-container')).toBeTruthy();
  });

  it('muestra el botón Cancelar', () => {
    render(<MapSelector {...defaultProps} />);
    expect(screen.getByText('Cancelar')).toBeTruthy();
  });

  it('muestra el botón Confirmar Ubicación', () => {
    render(<MapSelector {...defaultProps} />);
    expect(screen.getByText('Confirmar Ubicación')).toBeTruthy();
  });

  it('muestra las coordenadas iniciales', () => {
    render(<MapSelector {...defaultProps} />);
    expect(screen.getByText(/Lat:/)).toBeTruthy();
    expect(screen.getByText(/Lng:/)).toBeTruthy();
  });

  it('llama a onClose al hacer clic en Cancelar', () => {
    render(<MapSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('llama a axios.get y onPositionSelect al confirmar', async () => {
    render(<MapSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirmar Ubicación'));
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org/reverse'),
      );
    });
    await waitFor(() => {
      expect(defaultProps.onPositionSelect).toHaveBeenCalled();
    });
  });

  it('llama a onClose al confirmar ubicación', async () => {
    render(<MapSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirmar Ubicación'));
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('renderiza el marker en la posición inicial', () => {
    render(<MapSelector {...defaultProps} />);
    expect(screen.getByTestId('marker')).toBeTruthy();
  });

  it('muestra coordenadas formateadas correctamente', () => {
    render(<MapSelector {...defaultProps} />);
    expect(screen.getByText('-33.523000')).toBeTruthy();
    expect(screen.getByText('-70.604000')).toBeTruthy();
  });
});