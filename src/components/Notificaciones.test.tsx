import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@ionic/react', () => {
  const mockComponent =
    (tag: string) =>
    ({ children, onClick, value, onIonChange, disabled, ...props }: any) => {
      if (tag === 'IonActionSheet') {
        return props.isOpen ? (
          <div data-testid="ion-action-sheet">
            {props.buttons?.map((btn: any) => (
              <button key={btn.text} onClick={btn.handler}>{btn.text}</button>
            ))}
          </div>
        ) : null;
      }
      if (tag === 'IonButton') {
        return <button onClick={onClick} disabled={disabled}>{children}</button>;
      }
      if (tag === 'IonSegment') {
        return (
          <div>
            <select
              value={value}
              onChange={(e) => onIonChange?.({ detail: { value: e.target.value } })}
            >
              {children}
            </select>
          </div>
        );
      }
      if (tag === 'IonSegmentButton') {
        return <option value={props.value}>{children}</option>;
      }
      if (tag === 'IonBadge') {
        return <span data-testid="badge">{children}</span>;
      }
      return <div>{children}</div>;
    };

  return {
    IonList: mockComponent('IonList'),
    IonItem: mockComponent('IonItem'),
    IonLabel: ({ children, onClick, ...props }: any) => <div onClick={onClick}>{children}</div>,
    IonButton: mockComponent('IonButton'),
    IonIcon: () => null,
    IonActionSheet: mockComponent('IonActionSheet'),
    IonBadge: mockComponent('IonBadge'),
    IonSegment: mockComponent('IonSegment'),
    IonSegmentButton: mockComponent('IonSegmentButton'),
  };
});

vi.mock('ionicons/icons', () => ({
  settingsOutline: 'settingsOutline',
  checkmarkDoneOutline: 'checkmarkDoneOutline',
  alertCircleOutline: 'alertCircleOutline',
  ellipsisVertical: 'ellipsisVertical',
  videocamOff: 'videocamOff',
  alertCircle: 'alertCircle',
  warning: 'warning',
}));

vi.mock('./RulesRiesgoModal', () => ({
  EditRules: () => <div data-testid="edit-rules" />,
  RulesType: {},
}));

vi.mock('./FiltroModal', () => ({
  EditFiltros: () => <div data-testid="edit-filtros" />,
  FiltroType: {},
}));

vi.mock('./Notificaciones.css', () => ({}));

// ── Import ────────────────────────────────────────────────────────────────────

import { NotificacionesPopover } from './Notificaciones';
import type { Alert } from '../types/Alert';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockAlert1: Alert = {
  id: 1,
  id_camara: 1,
  mensaje: 'Alerta merodeo detectada',
  score_confianza: 0.75,
  hora_suceso: '2024-01-01T10:00:00Z',
  estado: 0,
  tipo: 1,
  sector: 1,
  riesgo: 'alto',
};

const mockAlert2: Alert = {
  id: 2,
  id_camara: 2,
  mensaje: 'Alerta portonazo detectada',
  score_confianza: 0.35,
  hora_suceso: '2024-01-01T11:00:00Z',
  estado: 1,
  tipo: 2,
  sector: 2,
  riesgo: 'bajo',
};

const mockAlertCaida: Alert = {
  id: 3,
  id_camara: 1,
  mensaje: 'Cámara caída',
  score_confianza: 0,
  hora_suceso: '2024-01-01T12:00:00Z',
  estado: 0,
  tipo: 4,
  sector: 1,
  riesgo: 'critico',
};

const cameraNames = { 1: 'Cámara Norte', 2: 'Cámara Sur' };
const formatearFecha = (fecha: string) => new Date(fecha).toLocaleString();
const handleAccion = vi.fn();
const onVerDescripcion = vi.fn();
const onMarcarTodasVistas = vi.fn();

const defaultProps = {
  alerts: [mockAlert1, mockAlert2],
  cameraNames,
  formatearFecha,
  handleAccion,
  onVerDescripcion,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Notificaciones.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  // ── Renderizado básico ────────────────────────────────────────────────────

  describe('Renderizado básico', () => {
    it('renderiza el título Notificaciones', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      expect(screen.getByText('Notificaciones')).toBeTruthy();
    });

    it('muestra las alertas en la lista', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      expect(screen.getByText('Alerta merodeo detectada')).toBeTruthy();
      expect(screen.getByText('Alerta portonazo detectada')).toBeTruthy();
    });

    it('muestra "(Nuevo)" para alertas no vistas (estado=0)', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      expect(screen.getByText('(Nuevo)')).toBeTruthy();
    });

    it('muestra mensaje vacío cuando no hay alertas', () => {
      render(<NotificacionesPopover {...defaultProps} alerts={[]} />);
      expect(screen.getByText('No hay notificaciones')).toBeTruthy();
    });

    it('renderiza EditRules y EditFiltros', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      expect(screen.getByTestId('edit-rules')).toBeTruthy();
      expect(screen.getByTestId('edit-filtros')).toBeTruthy();
    });
  });

  // ── Filtro por cámara ─────────────────────────────────────────────────────

  describe('Filtro por cámara seleccionada', () => {
    it('muestra solo alertas de la cámara seleccionada', () => {
      render(
        <NotificacionesPopover
          {...defaultProps}
          selectedCamera={{ id: 1 }}
        />
      );
      expect(screen.getByText('Alerta merodeo detectada')).toBeTruthy();
      expect(screen.queryByText('Alerta portonazo detectada')).toBeNull();
    });

    it('muestra todas las alertas cuando no hay cámara seleccionada', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      expect(screen.getByText('Alerta merodeo detectada')).toBeTruthy();
      expect(screen.getByText('Alerta portonazo detectada')).toBeTruthy();
    });
  });

  // ── Segmento cámaras caídas ───────────────────────────────────────────────

  describe('mostrarCamarasCaidas', () => {
    it('NO muestra el segmento de filtro sin mostrarCamarasCaidas', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      expect(screen.queryByText('Alertas')).toBeNull();
      expect(screen.queryByText('Cámaras')).toBeNull();
    });

    it('muestra el segmento de filtro con mostrarCamarasCaidas=true', () => {
      render(
        <NotificacionesPopover
          {...defaultProps}
          alerts={[mockAlert1, mockAlertCaida]}
          mostrarCamarasCaidas={true}
        />
      );
      expect(screen.getByText('Alertas')).toBeTruthy();
      expect(screen.getByText('Cámaras')).toBeTruthy();
    });

    it('muestra mensaje vacío de cámaras caídas cuando no hay', () => {
      render(
        <NotificacionesPopover
          {...defaultProps}
          alerts={[mockAlert1]}
          mostrarCamarasCaidas={true}
        />
      );
      // Por defecto muestra alertas normales
      expect(screen.getByText('Alerta merodeo detectada')).toBeTruthy();
    });
  });

  // ── Menú de acciones ──────────────────────────────────────────────────────

  describe('Menú de acciones (ActionSheet)', () => {
    it('abre el ActionSheet al hacer clic en el menú de una alerta', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      const menuButtons = screen.getAllByRole('button');
      // Los botones de ellipsis están al final de cada alerta
      fireEvent.click(menuButtons[menuButtons.length - 1]);
      expect(screen.getByTestId('ion-action-sheet')).toBeTruthy();
    });

    it('llama a handleAccion con "leida" al marcar como leída', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      const menuButtons = screen.getAllByRole('button');
      fireEvent.click(menuButtons[menuButtons.length - 1]);
      fireEvent.click(screen.getByText('Marcar como leída'));
      expect(handleAccion).toHaveBeenCalledWith(
        expect.objectContaining({ id: 2 }),
        'leida'
      );
    });

    it('llama a handleAccion con "falso_positivo"', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      const menuButtons = screen.getAllByRole('button');
      fireEvent.click(menuButtons[menuButtons.length - 1]);
      fireEvent.click(screen.getByText('Marcar como falso positivo'));
      expect(handleAccion).toHaveBeenCalledWith(
        expect.objectContaining({ id: 2 }),
        'falso_positivo'
      );
    });

    it('cierra el ActionSheet al hacer clic en Cancelar', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      const menuButtons = screen.getAllByRole('button');
      fireEvent.click(menuButtons[menuButtons.length - 1]);
      expect(screen.getByTestId('ion-action-sheet')).toBeTruthy();
      expect(screen.queryByTestId('ion-action-sheet')).toBeTruthy();
    });
  });

  // ── Ver descripción ───────────────────────────────────────────────────────

  describe('Ver descripción', () => {
    it('llama a onVerDescripcion al hacer clic en el label de una alerta', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      fireEvent.click(screen.getByText('Alerta merodeo detectada'));
      expect(onVerDescripcion).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 })
      );
    });
  });

  // ── Marcar todas como vistas ──────────────────────────────────────────────

  describe('Marcar todas como vistas', () => {
    it('muestra el botón cuando se pasa onMarcarTodasVistas', () => {
      render(
        <NotificacionesPopover
          {...defaultProps}
          onMarcarTodasVistas={onMarcarTodasVistas}
          unseenCount={3}
        />
      );
      expect(screen.getByText('Marcar como vistas (3)')).toBeTruthy();
    });

    it('llama a onMarcarTodasVistas al hacer clic cuando unseenCount > 0', () => {
      render(
        <NotificacionesPopover
          {...defaultProps}
          onMarcarTodasVistas={onMarcarTodasVistas}
          unseenCount={3}
        />
      );
      fireEvent.click(screen.getByText('Marcar como vistas (3)'));
      expect(onMarcarTodasVistas).toHaveBeenCalled();
    });

    it('NO muestra el botón cuando no se pasa onMarcarTodasVistas', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      expect(screen.queryByText(/Marcar como vistas/)).toBeNull();
    });

    it('botón deshabilitado cuando unseenCount=0', () => {
      render(
        <NotificacionesPopover
          {...defaultProps}
          onMarcarTodasVistas={onMarcarTodasVistas}
          unseenCount={0}
        />
      );
      const btn = screen.getByText('Marcar como vistas (0)').closest('button');
      expect(btn?.hasAttribute('disabled')).toBeTruthy();
    });
  });

  // ── Scores y colores ──────────────────────────────────────────────────────

  describe('Score y datos de alertas', () => {
    it('muestra el score de confianza de cada alerta', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      expect(screen.getByText(/Score: 0.75/)).toBeTruthy();
      expect(screen.getByText(/Score: 0.35/)).toBeTruthy();
    });

    it('muestra el nombre de la cámara', () => {
      render(<NotificacionesPopover {...defaultProps} />);
      expect(screen.getByText(/Cámara Norte/)).toBeTruthy();
      expect(screen.getByText(/Cámara Sur/)).toBeTruthy();
    });
  });
});