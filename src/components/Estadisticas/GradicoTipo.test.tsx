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
  BarChartTipo: ({ data }: any) => <div data-testid="bar-chart-tipo">{JSON.stringify(data?.labels)}</div>,
}));

import GraficoTipo from './GraficoTipo';

const dataMock = {
  labels: ['Merodeos', 'Portonazos', 'Asaltos Hogar', 'Falsos positivos'],
  datasets: [{ label: '', data: [3, 2, 1, 2], backgroundColor: ['#10dc60'] }],
};

describe('GraficoTipo.tsx', () => {
  it('renderiza el título', () => {
    render(<GraficoTipo data={dataMock} />);
    expect(screen.getByText('Distribución por Tipo')).toBeTruthy();
  });

  it('renderiza el gráfico', () => {
    render(<GraficoTipo data={dataMock} />);
    expect(screen.getByTestId('bar-chart-tipo')).toBeTruthy();
  });

  it('pasa los datos correctos al gráfico', () => {
    render(<GraficoTipo data={dataMock} />);
    expect(screen.getByText(/Merodeos/)).toBeTruthy();
  });

  it('renderiza con data null sin errores', () => {
    render(<GraficoTipo data={null} />);
    expect(screen.getByText('Distribución por Tipo')).toBeTruthy();
  });
});