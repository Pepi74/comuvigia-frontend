import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@ionic/react', () => ({
  IonCard: ({ children }: any) => <div>{children}</div>,
  IonCardHeader: ({ children }: any) => <div>{children}</div>,
  IonCardTitle: ({ children }: any) => <h2>{children}</h2>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }: any) => <div data-testid="bar-chart">{data?.labels?.join(',')}</div>,
}));
vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: class {},
  LinearScale: class {},
  BarElement: class {},
  Title: class {},
  Tooltip: class {},
  Legend: class {},
}));

import GraficoHorarios from './GraficoHorarios';

const horariosMock = [
  { hora: 8, merodeos: 3, portonazos: 1, asaltos_hogar: 0 },
  { hora: 14, merodeos: 1, portonazos: 2, asaltos_hogar: 1 },
  { hora: 22, merodeos: 5, portonazos: 0, asaltos_hogar: 2 },
];

describe('GraficoHorarios.tsx', () => {
  it('renderiza el título', () => {
    render(<GraficoHorarios horarios={horariosMock} />);
    expect(screen.getByText('Distribución horaria por tipo de delito')).toBeTruthy();
  });

  it('renderiza el gráfico de barras', () => {
    render(<GraficoHorarios horarios={horariosMock} />);
    expect(screen.getByTestId('bar-chart')).toBeTruthy();
  });

  it('muestra las horas correctamente formateadas', () => {
    render(<GraficoHorarios horarios={horariosMock} />);
    expect(screen.getAllByText(/08:00/).length).toBeGreaterThan(0);
  });

  it('muestra mensaje cuando no hay datos', () => {
    render(<GraficoHorarios horarios={[]} />);
    expect(screen.getByText('No hay datos de horarios disponibles.')).toBeTruthy();
  });

  it('muestra el top 3 de horarios por tipo', () => {
    render(<GraficoHorarios horarios={horariosMock} />);
    expect(screen.getByText('Top 3 horarios de mayor riesgo por tipo')).toBeTruthy();
  });

  it('muestra "Sin actividad reciente" cuando no hay datos para un tipo', () => {
    const horariosSinPortonazos = [
      { hora: 8, merodeos: 3, portonazos: 0, asaltos_hogar: 0 },
    ];
    render(<GraficoHorarios horarios={horariosSinPortonazos} />);
    expect(screen.getAllByText('Sin actividad reciente').length).toBeGreaterThan(0);
  });
});