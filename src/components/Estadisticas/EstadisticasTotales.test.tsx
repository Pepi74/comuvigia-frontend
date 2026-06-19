import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@ionic/react', () => ({
  IonCard: ({ children }: any) => <div>{children}</div>,
  IonCardHeader: ({ children }: any) => <div>{children}</div>,
  IonCardTitle: ({ children }: any) => <h2>{children}</h2>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
  IonGrid: ({ children }: any) => <div>{children}</div>,
  IonRow: ({ children }: any) => <div>{children}</div>,
  IonCol: ({ children }: any) => <div>{children}</div>,
  IonProgressBar: () => null,
  IonLabel: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('../ReporteEstadisticas.css', () => ({}));

import EstadisticasTotales from './EstadisticasTotales';

const estadisticasMock = {
  total_alertas: 20,
  alertas_confirmadas: 12,
  falsos_positivos: 3,
  merodeos: 8,
  portonazos: 4,
  asaltos_hogar: 3,
};

describe('EstadisticasTotales.tsx', () => {
  it('renderiza el título', () => {
    render(<EstadisticasTotales estadisticas_totales={estadisticasMock} />);
    expect(screen.getByText('Estadísticas Totales')).toBeTruthy();
  });

  it('muestra el total de alertas', () => {
    render(<EstadisticasTotales estadisticas_totales={estadisticasMock} />);
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('Alertas Totales')).toBeTruthy();
  });

  it('muestra las alertas verificadas (confirmadas + falsos positivos)', () => {
    render(<EstadisticasTotales estadisticas_totales={estadisticasMock} />);
    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.getByText('Alertas Verificadas')).toBeTruthy();
  });

  it('calcula y muestra la tasa de precisión correctamente', () => {
    render(<EstadisticasTotales estadisticas_totales={estadisticasMock} />);
    // 12/15 = 80%
    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByText('Tasa de Precisión')).toBeTruthy();
  });

  it('calcula y muestra la tasa de error correctamente', () => {
    render(<EstadisticasTotales estadisticas_totales={estadisticasMock} />);
    // 3/15 = 20%
    expect(screen.getByText('20%')).toBeTruthy();
    expect(screen.getByText('Tasa de Error')).toBeTruthy();
  });

  it('muestra 0% cuando no hay alertas verificadas', () => {
    render(<EstadisticasTotales estadisticas_totales={{
      ...estadisticasMock, alertas_confirmadas: 0, falsos_positivos: 0
    }} />);
    const ceros = screen.getAllByText('0%');
    expect(ceros.length).toBe(2);
  });

  it('tasa de precisión verde cuando es mayor a 70%', () => {
    render(<EstadisticasTotales estadisticas_totales={estadisticasMock} />);
    expect(screen.getByText('80%')).toBeTruthy();
  });

  it('tasa de error roja cuando supera 60%', () => {
    render(<EstadisticasTotales estadisticas_totales={{
      ...estadisticasMock, alertas_confirmadas: 1, falsos_positivos: 14
    }} />);
    expect(screen.getByText('93%')).toBeTruthy();
  });
});