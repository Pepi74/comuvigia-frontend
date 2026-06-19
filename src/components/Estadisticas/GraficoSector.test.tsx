import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@ionic/react', () => ({
  IonCard: ({ children }: any) => <div>{children}</div>,
  IonCardHeader: ({ children }: any) => <div>{children}</div>,
  IonCardTitle: ({ children }: any) => <h2>{children}</h2>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('../Charts', () => ({
  BarChartSector: ({ data }: any) => <div data-testid="bar-chart">{JSON.stringify(data?.labels)}</div>,
}));
vi.mock('./DetalleSectores.css', () => ({}));

import GraficoSector from './GraficoSector';

const dataMock = {
  labels: ['Sector Norte', 'Sector Sur'],
  datasets: [{ label: 'Alertas', data: [10, 5], backgroundColor: ['#10dc60'] }],
};

describe('GraficoSector.tsx', () => {
  it('renderiza el título', () => {
    render(<GraficoSector data={dataMock} />);
    expect(screen.getByText('Distribución por Sector')).toBeTruthy();
  });

  it('renderiza el gráfico de barras', () => {
    render(<GraficoSector data={dataMock} />);
    expect(screen.getByTestId('bar-chart')).toBeTruthy();
  });

  it('pasa los datos correctos al gráfico', () => {
    render(<GraficoSector data={dataMock} />);
    expect(screen.getByText(/Sector Norte/)).toBeTruthy();
  });

  it('renderiza con data null sin errores', () => {
    render(<GraficoSector data={null} />);
    expect(screen.getByText('Distribución por Sector')).toBeTruthy();
  });
});