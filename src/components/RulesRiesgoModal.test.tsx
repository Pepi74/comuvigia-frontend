import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [{ id: 1, nombre_sector: 'Sector Norte' }] }),
    post: vi.fn().mockResolvedValue({ data: { id: 99 } }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('@ionic/react', () => {
  const mock = (tag: string) => ({ children, onClick, isOpen, value, onIonChange, disabled, onDidDismiss, ...props }: any) => {
    if (tag === 'IonModal') return isOpen ? <div data-testid="rules-modal">{children}</div> : null;
    if (tag === 'IonButton') return <button onClick={onClick} disabled={disabled}>{children}</button>;
    if (tag === 'IonSelect') return (
      <select value={value} onChange={e => onIonChange?.({ detail: { value: e.target.value } })}>
        {children}
      </select>
    );
    if (tag === 'IonSelectOption') return <option value={props.value}>{children}</option>;
    if (tag === 'IonInput') return (
      <input type={props.type || 'text'} value={value ?? ''} onChange={e => props.onIonChange?.({ detail: { value: e.target.value } })} />
    );
    return <div>{children}</div>;
  };
  return {
    IonButton: mock('IonButton'), IonIcon: () => null, IonItem: mock('IonItem'),
    IonLabel: mock('IonLabel'), IonModal: mock('IonModal'), IonHeader: mock('IonHeader'),
    IonToolbar: mock('IonToolbar'), IonTitle: mock('IonTitle'), IonContent: mock('IonContent'),
    IonFooter: mock('IonFooter'), IonSelect: mock('IonSelect'), IonSelectOption: mock('IonSelectOption'),
    IonInput: mock('IonInput'), IonRange: mock('IonRange'),
  };
});

vi.mock('ionicons/icons', () => ({ settingsOutline: 'settingsOutline', closeOutline: 'closeOutline' }));
vi.mock('./RulesRiesgoModal.css', () => ({}));

import { EditRules } from './RulesRiesgoModal';
import type { RulesType } from './RulesRiesgoModal';
import axios from 'axios';

const reglasMock: RulesType[] = [
  { id: 1, riesgo: 'alto', tipoAlerta: ['1'], horaInicio: '08:00', horaFin: '20:00', score: 60, sector: 1 },
  { id: 2, riesgo: 'bajo', tipoAlerta: ['2'], horaInicio: '00:00', horaFin: '06:00', score: 30, sector: 2 },
];

describe('RulesRiesgoModal.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza el botón de configuración', () => {
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('retorna null cuando reglas está vacío', () => {
    const setReglas = vi.fn();
    (axios.get as any).mockResolvedValueOnce({ data: [] });
    const { container } = render(<EditRules reglas={[]} setReglas={setReglas} />);
    expect(container.firstChild).toBeNull();
  });

  it('abre el modal al hacer clic en el botón de configuración', () => {
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByTestId('rules-modal')).toBeTruthy();
  });

  it('muestra el título del modal', () => {
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('Configurar reglas de riesgo')).toBeTruthy();
  });

  it('muestra los botones Guardar, Eliminar y Cerrar y Guardar', () => {
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('Guardar')).toBeTruthy();
    expect(screen.getByText('Eliminar')).toBeTruthy();
    expect(screen.getByText('Cerrar y Guardar')).toBeTruthy();
  });

  it('muestra el botón Crear Regla', () => {
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('Crear Regla')).toBeTruthy();
  });

  it('alterna a modo creación al hacer clic en Crear Regla', () => {
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Crear Regla'));
    expect(screen.getByText('Cancelar')).toBeTruthy();
    expect(screen.getByText('Guardar Nueva Regla')).toBeTruthy();
  });

  it('vuelve a modo edición al hacer clic en Cancelar', () => {
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Crear Regla'));
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.getByText('Crear Regla')).toBeTruthy();
  });

  it('llama a axios.get para cargar sectores al montar', async () => {
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/reglas/sectores'),
        expect.any(Object)
      );
    });
  });

  it('llama a axios.post al guardar reglas', async () => {
    (axios.post as any).mockResolvedValue({ data: {} });
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    await fireEvent.click(screen.getByText('Guardar'));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });

  it('llama a axios.delete al eliminar regla', async () => {
    (axios.delete as any).mockResolvedValue({ data: {} });
    const setReglas = vi.fn();
    render(<EditRules reglas={reglasMock} setReglas={setReglas} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    await fireEvent.click(screen.getByText('Eliminar'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
  });
});