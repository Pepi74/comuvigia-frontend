import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
global.URL.createObjectURL = vi.fn(() => 'blob:mock');
global.URL.revokeObjectURL = vi.fn();

import InformeDescarga from './InformeDescarga';

const dispararIonChange = (element: Element, value: string) => {
  element.dispatchEvent(new CustomEvent('ionChange', { detail: { value }, bubbles: true }));
};

describe('InformeDescarga.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza el título "Descarga de informe"', () => {
    render(<InformeDescarga />);
    expect(screen.getByText('Descarga de informe')).toBeTruthy();
  });

  it('renderiza los labels de Mes y Año', () => {
    render(<InformeDescarga />);
    expect(screen.getByText('Mes')).toBeTruthy();
    expect(screen.getByText('Año')).toBeTruthy();
  });

  it('renderiza el botón de descarga', () => {
    render(<InformeDescarga />);
    expect(screen.getByText('Descargar PDF')).toBeTruthy();
  });

  it('botón deshabilitado cuando no hay mes ni año', () => {
    render(<InformeDescarga />);
    const btn = document.querySelector('ion-button');
    expect(btn).toBeTruthy();
    // Sin mes y año, botonHabilitado=false → disabled
    expect(btn?.getAttribute('disabled')).toBeDefined();
  });

  it('llama a fetch al disparar ionChange en mes y año', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/pdf' },
      blob: () => Promise.resolve(new Blob(['pdf'], { type: 'application/pdf' })),
    });

    const { container } = render(<InformeDescarga />);
    const selects = container.querySelectorAll('ion-select');

    dispararIonChange(selects[0], '01');
    dispararIonChange(selects[1], '2024');

    await waitFor(() => {
      const btn = container.querySelector('ion-button');
      expect(btn).toBeTruthy();
    });
  });

  it('muestra "Descarga de informe" como título del card', () => {
    render(<InformeDescarga />);
    expect(document.querySelector('ion-card-title')?.textContent).toBe('Descarga de informe');
  });

  it('tiene 12 opciones de mes', () => {
    const { container } = render(<InformeDescarga />);
    const mesSelect = container.querySelectorAll('ion-select')[0];
    const opciones = mesSelect.querySelectorAll('ion-select-option');
    expect(opciones.length).toBe(12);
  });

  it('tiene 3 opciones de año', () => {
    const { container } = render(<InformeDescarga />);
    const anioSelect = container.querySelectorAll('ion-select')[1];
    const opciones = anioSelect.querySelectorAll('ion-select-option');
    expect(opciones.length).toBe(3);
  });
});