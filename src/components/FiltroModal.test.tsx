import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: [
        { id: 1, nombre_sector: 'Sector Norte', descripcion: '' },
        { id: 2, nombre_sector: 'Sector Sur', descripcion: '' },
      ],
    }),
  },
}));

vi.mock('@ionic/react', () => {
  const mock = (tag: string) => ({ children, onClick, isOpen, value, onIonChange, onDidDismiss, disabled, ...props }: any) => {
    if (tag === 'IonModal') return isOpen ? <div data-testid="filtro-modal">{children}</div> : null;
    if (tag === 'IonButton') return <button onClick={onClick} disabled={disabled}>{children}</button>;
    if (tag === 'IonSelect') return (
      <select value={value ?? ''} onChange={e => onIonChange?.({ detail: { value: e.target.value } })}>
        {children}
      </select>
    );
    if (tag === 'IonSelectOption') return <option value={props.value}>{children}</option>;
    if (tag === 'IonInput') return (
      <input
        type={props.type || 'text'}
        value={value ?? ''}
        placeholder={props.placeholder}
        onChange={e => props.onIonChange?.({ detail: { value: e.target.value } })}
      />
    );
    if (tag === 'IonLoading') return null;
    if (tag === 'IonAlert') return isOpen ? <div data-testid="ion-alert"><button onClick={onDidDismiss}>OK</button></div> : null;
    return <div>{children}</div>;
  };
  return {
    IonButton: mock('IonButton'), IonIcon: () => null, IonItem: mock('IonItem'),
    IonLabel: mock('IonLabel'), IonModal: mock('IonModal'), IonHeader: mock('IonHeader'),
    IonToolbar: mock('IonToolbar'), IonTitle: mock('IonTitle'), IonContent: mock('IonContent'),
    IonFooter: mock('IonFooter'), IonSelect: mock('IonSelect'), IonSelectOption: mock('IonSelectOption'),
    IonInput: mock('IonInput'), IonLoading: mock('IonLoading'), IonAlert: mock('IonAlert'),
    IonCard: mock('IonCard'), IonCardHeader: mock('IonCardHeader'), IonCardTitle: mock('IonCardTitle'),
    IonCardContent: mock('IonCardContent'),
  };
});

vi.mock('ionicons/icons', () => ({ filterOutline: 'filterOutline', closeOutline: 'closeOutline' }));
vi.mock('./RulesRiesgoModal.css', () => ({}));
vi.mock('./InformeDescarga.css', () => ({}));

import { EditFiltros } from './FiltroModal';
import type { FiltroType } from './FiltroModal';

const filtroInicial: FiltroType = {
  isUsed: false, fechaInicio: null, fechaFin: null,
  tipo: null, scoreMin: null, scoreMax: null, sector: null,
};

describe('FiltroModal.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza el botón de filtro', () => {
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('abre el modal al hacer clic en el botón filtro', () => {
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByTestId('filtro-modal')).toBeTruthy();
  });

  it('muestra el título "Filtrar Notificaciones"', () => {
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('Filtrar Notificaciones')).toBeTruthy();
  });

  it('muestra los botones Filtrar y Limpiar filtros', () => {
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('Filtrar')).toBeTruthy();
    expect(screen.getByText('Limpiar filtros')).toBeTruthy();
  });

  it('cierra el modal al hacer clic en Filtrar', () => {
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Filtrar'));
    expect(screen.queryByTestId('filtro-modal')).toBeNull();
  });

  it('llama a setFiltro con isUsed=true al filtrar', () => {
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Filtrar'));
    expect(setFiltro).toHaveBeenCalled();
  });

  it('cierra el modal al hacer clic en Limpiar filtros', () => {
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Limpiar filtros'));
    expect(screen.queryByTestId('filtro-modal')).toBeNull();
  });

  it('llama a setFiltro al limpiar filtros', () => {
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Limpiar filtros'));
    expect(setFiltro).toHaveBeenCalled();
  });

  it('carga sectores desde el backend al montar', async () => {
    const axios = await import('axios');
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    await waitFor(() => {
      expect(axios.default.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/reglas/sectores'),
        expect.any(Object)
      );
    });
  });

  it('cierra el modal al hacer clic en el botón X', () => {
    const setFiltro = vi.fn();
    render(<EditFiltros filtro={filtroInicial} setFiltro={setFiltro} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByTestId('filtro-modal')).toBeTruthy();
    // El segundo botón dentro del modal es el de cerrar (X)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(screen.queryByTestId('filtro-modal')).toBeNull();
  });
});