import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@ionic/react', () => ({
  IonCard: ({ children }: any) => <div>{children}</div>,
  IonCardHeader: ({ children }: any) => <div>{children}</div>,
  IonCardTitle: ({ children }: any) => <h2>{children}</h2>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
  IonList: ({ children }: any) => <ul>{children}</ul>,
  IonItem: ({ children }: any) => <li>{children}</li>,
  IonLabel: ({ children }: any) => <div>{children}</div>,
  IonBadge: ({ children }: any) => <span>{children}</span>,
}));
vi.mock('./DetalleSectores.css', () => ({}));

import DetalleSectores from './DetalleSectores';

const sectoresMock = [
  { id_sector: 1, nombre_sector: 'Sector Norte', total_alertas: 10, alertas_confirmadas: 7 },
  { id_sector: 2, nombre_sector: 'Sector Sur', total_alertas: 5, alertas_confirmadas: 3 },
];

describe('DetalleSectores.tsx', () => {
  it('renderiza el título', () => {
    render(<DetalleSectores sectores={sectoresMock} />);
    expect(screen.getByText('Detalle por Sectores')).toBeTruthy();
  });

  it('muestra los nombres de sectores', () => {
    render(<DetalleSectores sectores={sectoresMock} />);
    expect(screen.getByText('Sector Norte')).toBeTruthy();
    expect(screen.getByText('Sector Sur')).toBeTruthy();
  });

  it('muestra el total de alertas por sector', () => {
    render(<DetalleSectores sectores={sectoresMock} />);
    expect(screen.getByText('Total: 10 alertas')).toBeTruthy();
    expect(screen.getByText('Total: 5 alertas')).toBeTruthy();
  });

  it('muestra las alertas confirmadas', () => {
    render(<DetalleSectores sectores={sectoresMock} />);
    expect(screen.getByText('Confirmadas: 7')).toBeTruthy();
    expect(screen.getByText('Confirmadas: 3')).toBeTruthy();
  });

  it('renderiza con lista vacía sin errores', () => {
    render(<DetalleSectores sectores={[]} />);
    expect(screen.getByText('Detalle por Sectores')).toBeTruthy();
  });
});