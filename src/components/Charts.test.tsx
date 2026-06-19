import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-chartjs-2', () => ({
  Pie: ({ data }: any) => <div data-testid="pie-chart">{JSON.stringify(data?.labels)}</div>,
  Bar: ({ data, className }: any) => <div data-testid="bar-chart" className={className}>{JSON.stringify(data?.labels)}</div>,
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: class {},
  LinearScale: class {},
  BarElement: class {},
  ArcElement: class {},
  Title: class {},
  Tooltip: class {},
  Legend: class {},
}));

vi.mock('./Charts.css', () => ({}));

import { PieChart, BarChartSector, BarChartTipo } from './Charts';

const dataMock = {
  labels: ['Sector A', 'Sector B'],
  datasets: [{ label: 'Test', data: [10, 5], backgroundColor: ['#fff'] }],
};

describe('Charts.tsx', () => {

  describe('PieChart', () => {
    it('renderiza el gráfico de pie', () => {
      render(<PieChart data={dataMock} />);
      expect(screen.getByTestId('pie-chart')).toBeTruthy();
    });

    it('pasa los datos correctamente', () => {
      render(<PieChart data={dataMock} />);
      expect(screen.getByText(/Sector A/)).toBeTruthy();
    });
  });

  describe('BarChartSector', () => {
    it('renderiza el gráfico de barras de sector', () => {
      render(<BarChartSector data={dataMock} />);
      expect(screen.getByTestId('bar-chart')).toBeTruthy();
    });

    it('pasa los datos correctamente', () => {
      render(<BarChartSector data={dataMock} />);
      expect(screen.getByText(/Sector A/)).toBeTruthy();
    });

    it('aplica la clase bar-chart', () => {
      render(<BarChartSector data={dataMock} />);
      expect(screen.getByTestId('bar-chart').className).toBe('bar-chart');
    });
  });

  describe('BarChartTipo', () => {
    it('renderiza el gráfico de barras de tipo', () => {
      render(<BarChartTipo data={dataMock} />);
      expect(screen.getByTestId('bar-chart')).toBeTruthy();
    });

    it('pasa los datos correctamente', () => {
      render(<BarChartTipo data={dataMock} />);
      expect(screen.getByText(/Sector A/)).toBeTruthy();
    });

    it('aplica la clase bar-chart', () => {
      render(<BarChartTipo data={dataMock} />);
      expect(screen.getByTestId('bar-chart').className).toBe('bar-chart');
    });
  });
});