import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('@ionic/react', () => ({
  IonCard: ({ children }: any) => <div>{children}</div>,
  IonCardHeader: ({ children }: any) => <div>{children}</div>,
  IonCardTitle: ({ children }: any) => <h2>{children}</h2>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
  IonGrid: ({ children }: any) => <div>{children}</div>,
  IonRow: ({ children }: any) => <div>{children}</div>,
  IonCol: ({ children }: any) => <div>{children}</div>,
  IonItem: ({ children }: any) => <div>{children}</div>,
  IonLabel: ({ children }: any) => <label>{children}</label>,
  IonInput: ({ value, onIonInput, type }: any) => (
    <input type={type} value={value} onChange={(e) => onIonInput?.({ target: { value: e.target.value } })} />
  ),
  IonButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  IonSelect: ({ children, value, onIonChange }: any) => (
    <select value={value} onChange={(e) => onIonChange?.({ detail: { value: e.target.value } })}>
      {children}
    </select>
  ),
  IonSelectOption: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

import FiltroPeriodo from './FiltroPeriodo';

const defaultProps = {
  fechaInicio: '2024-01-01',
  fechaFin: '2024-01-31',
  setFechaInicio: vi.fn(),
  setFechaFin: vi.fn(),
  agrupacion: 'day',
  setAgrupacion: vi.fn(),
  onGenerarReporte: vi.fn(),
};

describe('FiltroPeriodo.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza el título', () => {
    render(<FiltroPeriodo {...defaultProps} />);
    expect(screen.getByText('Período del Reporte')).toBeTruthy();
  });

  it('muestra las fechas de inicio y fin', () => {
    render(<FiltroPeriodo {...defaultProps} />);
    const inputs = screen.getAllByDisplayValue('2024-01-01');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('muestra el select de agrupación', () => {
    render(<FiltroPeriodo {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('muestra las opciones de agrupación', () => {
    render(<FiltroPeriodo {...defaultProps} />);
    expect(screen.getByText('Día')).toBeTruthy();
    expect(screen.getByText('Semana')).toBeTruthy();
    expect(screen.getByText('Mes')).toBeTruthy();
  });

  it('llama a onGenerarReporte al hacer clic en el botón', () => {
    render(<FiltroPeriodo {...defaultProps} />);
    fireEvent.click(screen.getByText('Generar Reporte'));
    expect(defaultProps.onGenerarReporte).toHaveBeenCalled();
  });

  it('llama a setAgrupacion al cambiar el select', () => {
    render(<FiltroPeriodo {...defaultProps} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'week' } });
    expect(defaultProps.setAgrupacion).toHaveBeenCalledWith('week');
  });

  it('llama a setFechaInicio al cambiar la fecha inicio', () => {
    render(<FiltroPeriodo {...defaultProps} />);
    const inputs = screen.getAllByDisplayValue('2024-01-01');
    fireEvent.change(inputs[0], { target: { value: '2024-02-01' } });
    expect(defaultProps.setFechaInicio).toHaveBeenCalledWith('2024-02-01');
  });
});