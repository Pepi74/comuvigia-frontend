import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-leaflet', () => ({
  Polygon: ({ children }: any) => <div data-testid="polygon">{children}</div>,
  LayerGroup: ({ children }: any) => <div data-testid="layer-group">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
}));

vi.mock('leaflet', () => ({}));

import { SectorLayer } from './SectorLayer';

const sectorMock = {
  id: 1,
  nombre_sector: 'Sector Norte',
  coordinates: [[-33.4, -70.6], [-33.5, -70.6], [-33.5, -70.7]] as [number, number][],
  total_alertas: 10,
};

describe('SectorLayer.tsx', () => {
  it('no renderiza nada cuando visible=false', () => {
    render(<SectorLayer sector={sectorMock} visible={false} maxAlertas={20} />);
    expect(screen.queryByTestId('layer-group')).toBeNull();
  });

  it('renderiza el LayerGroup cuando visible=true', () => {
    render(<SectorLayer sector={sectorMock} visible={true} maxAlertas={20} />);
    expect(screen.getByTestId('layer-group')).toBeTruthy();
  });

  it('renderiza el Polygon cuando visible=true', () => {
    render(<SectorLayer sector={sectorMock} visible={true} maxAlertas={20} />);
    expect(screen.getByTestId('polygon')).toBeTruthy();
  });

  it('muestra el nombre del sector y alertas en el Tooltip', () => {
    render(<SectorLayer sector={sectorMock} visible={true} maxAlertas={20} />);
    expect(screen.getByTestId('tooltip').textContent).toContain('Sector Norte');
    expect(screen.getByTestId('tooltip').textContent).toContain('10');
  });

  it('renderiza correctamente con maxAlertas=0 sin división por cero', () => {
    render(<SectorLayer sector={{ ...sectorMock, total_alertas: 0 }} visible={true} maxAlertas={0} />);
    expect(screen.getByTestId('layer-group')).toBeTruthy();
  });

  it('renderiza con alertas al máximo (ratio=1, color rojo)', () => {
    render(<SectorLayer sector={{ ...sectorMock, total_alertas: 20 }} visible={true} maxAlertas={20} />);
    expect(screen.getByTestId('polygon')).toBeTruthy();
  });

  it('renderiza con alertas=0 (ratio=0, color verde)', () => {
    render(<SectorLayer sector={{ ...sectorMock, total_alertas: 0 }} visible={true} maxAlertas={20} />);
    expect(screen.getByTestId('polygon')).toBeTruthy();
  });
});