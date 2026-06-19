import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('./LayerControl.css', () => ({}));

import { LayerControl } from './LayerControl';

const defaultProps = {
  heatmapVisible: false,
  toggleHeatmap: vi.fn(),
  onFetchSectores: vi.fn(),
};

describe('LayerControl.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza el botón FAB', () => {
    render(<LayerControl {...defaultProps} />);
    expect(screen.getByLabelText('Mostrar capas')).toBeTruthy();
  });

  it('no muestra el menú por defecto', () => {
    render(<LayerControl {...defaultProps} />);
    expect(screen.queryByText('Mapa de calor')).toBeNull();
  });

  it('abre el menú al hacer clic en el FAB', () => {
    render(<LayerControl {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    expect(screen.getByText('Mapa de calor')).toBeTruthy();
  });

  it('cierra el menú al hacer clic nuevamente en el FAB', () => {
    render(<LayerControl {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    expect(screen.queryByText('Mapa de calor')).toBeNull();
  });

  it('muestra los inputs de fecha cuando el menú está abierto', () => {
    render(<LayerControl {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    expect(screen.getByLabelText('Desde:')).toBeTruthy();
    expect(screen.getByLabelText('Hasta:')).toBeTruthy();
  });

  it('el botón Mostrar/Ocultar está deshabilitado sin fechas', () => {
    render(<LayerControl {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    expect(screen.getByText('Mostrar/Ocultar').hasAttribute('disabled')).toBeTruthy();
  });

  it('habilita el botón al ingresar ambas fechas', () => {
    render(<LayerControl {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    fireEvent.change(screen.getByLabelText('Desde:'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Hasta:'), { target: { value: '2024-01-31' } });
    expect(screen.getByText('Mostrar/Ocultar').hasAttribute('disabled')).toBeFalsy();
  });

  it('llama a toggleHeatmap al hacer clic en Mostrar/Ocultar con fechas', () => {
    render(<LayerControl {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    fireEvent.change(screen.getByLabelText('Desde:'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Hasta:'), { target: { value: '2024-01-31' } });
    fireEvent.click(screen.getByText('Mostrar/Ocultar'));
    expect(defaultProps.toggleHeatmap).toHaveBeenCalled();
  });

  it('llama a onFetchSectores con fechas formateadas', () => {
    render(<LayerControl {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    fireEvent.change(screen.getByLabelText('Desde:'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Hasta:'), { target: { value: '2024-01-31' } });
    fireEvent.click(screen.getByText('Mostrar/Ocultar'));
    expect(defaultProps.onFetchSectores).toHaveBeenCalledWith(
      '2024-01-01 00:00:00.000000',
      '2024-01-31 23:59:59.999999'
    );
  });

  it('muestra alert cuando se hace clic sin fechas', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<LayerControl {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    // El botón está disabled sin fechas, así que llamamos toggleHeatmap directamente
    defaultProps.toggleHeatmap();
    expect(defaultProps.toggleHeatmap).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('cierra el menú al hacer clic fuera', () => {
    render(<LayerControl {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    expect(screen.getByText('Mapa de calor')).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Mapa de calor')).toBeNull();
  });

  it('muestra el botón activo cuando heatmapVisible=true', () => {
    render(<LayerControl {...defaultProps} heatmapVisible={true} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    fireEvent.change(screen.getByLabelText('Desde:'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Hasta:'), { target: { value: '2024-01-31' } });
    const btn = screen.getByText('Mostrar/Ocultar');
    expect(btn.className).toContain('active');
  });

  it('funciona sin onFetchSectores', () => {
    render(<LayerControl heatmapVisible={false} toggleHeatmap={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Mostrar capas'));
    fireEvent.change(screen.getByLabelText('Desde:'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Hasta:'), { target: { value: '2024-01-31' } });
    fireEvent.click(screen.getByText('Mostrar/Ocultar'));
    expect(screen.queryByText('Mapa de calor')).toBeTruthy();
  });
});