import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('./DelitosLineChart.css', () => ({}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const dataMock = {
  success: true,
  estadisticas_totales: { falsos_positivos: 2, alertas_confirmadas: 8, total_alertas: 15 },
  periodos: [
    { periodo: new Date().toISOString(), merodeos: 3, portonazos: 1, asaltos_hogar: 0, no_especificados: 1 },
  ],
};

import DelitosLineChart from './DelitosLineChart';

describe('DelitosLineChart.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('muestra loading mientras carga', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<DelitosLineChart idCamara={1} />);
    expect(screen.getByText('Cargando datos...')).toBeTruthy();
  });

  it('muestra el gráfico cuando los datos cargan correctamente', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(dataMock),
    });
    render(<DelitosLineChart idCamara={1} />);
    await waitFor(() => expect(screen.getByTestId('line-chart')).toBeTruthy());
  });

  it('muestra el título con el id de cámara', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(dataMock),
    });
    render(<DelitosLineChart idCamara={1} />);
    await waitFor(() => expect(screen.getByText(/Evolución de delitos - Cámara 1/)).toBeTruthy());
  });

  it('muestra error cuando la API responde con error', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: 'Error de servidor' }),
    });
    render(<DelitosLineChart idCamara={1} />);
    await waitFor(() => expect(screen.getByText(/Error:/)).toBeTruthy());
  });

  it('muestra el gráfico incluso con periodos vacíos (datos en cero)', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        success: true, 
        estadisticas_totales: { falsos_positivos: 0, alertas_confirmadas: 0, total_alertas: 0 }, 
        periodos: [] 
      }),
    });
    render(<DelitosLineChart idCamara={1} />);
    await waitFor(() => expect(screen.getByTestId('line-chart')).toBeTruthy());
  });

  it('muestra las estadísticas totales', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(dataMock),
    });
    render(<DelitosLineChart idCamara={1} />);
    await waitFor(() => {
      expect(screen.getByText('Falsos positivos')).toBeTruthy();
      expect(screen.getByText('Positivos')).toBeTruthy();
      expect(screen.getByText('Sin revisar')).toBeTruthy();
    });
  });

  it('cambia el período al hacer clic en 1 Semana', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(dataMock),
    });
    render(<DelitosLineChart idCamara={1} />);
    await waitFor(() => expect(screen.getByText('1 Semana')).toBeTruthy());
    fireEvent.click(screen.getByText('1 Semana'));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  it('cambia el período al hacer clic en 6 Meses', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(dataMock),
    });
    render(<DelitosLineChart idCamara={1} />);
    await waitFor(() => expect(screen.getByText('6 Meses')).toBeTruthy());
    fireEvent.click(screen.getByText('6 Meses'));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  it('cambia el período al hacer clic en 1 Año', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(dataMock),
    });
    render(<DelitosLineChart idCamara={1} />);
    await waitFor(() => expect(screen.getByText('1 Año')).toBeTruthy());
    fireEvent.click(screen.getByText('1 Año'));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  it('no hace fetch cuando idCamara es 0', () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve(dataMock) });
    render(<DelitosLineChart idCamara={0} />);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});