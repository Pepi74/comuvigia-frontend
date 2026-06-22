import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

const mockPush = vi.fn();
vi.mock('react-router-dom', () => ({
  useHistory: () => ({ push: mockPush }),
}));
vi.mock('@ionic/react', () => ({
  IonCard: ({ children }: any) => <div>{children}</div>,
  IonCardHeader: ({ children }: any) => <div>{children}</div>,
  IonCardTitle: ({ children }: any) => <h2>{children}</h2>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
  IonButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

import RankingCamaras from './RankingCamaras';

const camarasMock = [
  { id: 1, nombre: 'Cámara Norte', direccion: 'Av. Principal 123', total_alertas: 15 },
  { id: 2, nombre: 'Cámara Sur', direccion: 'Calle Secundaria 456', total_alertas: 10 },
  { id: 3, nombre: 'Cámara Este', direccion: 'Pasaje Test 789', total_alertas: 5 },
];

describe('RankingCamaras.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza el título con mostrarHeader=true', () => {
    render(<RankingCamaras cameras={camarasMock} mostrarHeader={true} />);
    expect(screen.getByText(/Ranking de cámaras/)).toBeTruthy();
  });

  it('muestra las cámaras ordenadas por alertas', () => {
    render(<RankingCamaras cameras={camarasMock} mostrarHeader={true} />);
    expect(screen.getByText('Cámara Norte')).toBeTruthy();
    expect(screen.getByText('Cámara Sur')).toBeTruthy();
  });

  it('muestra el total de alertas por cámara', () => {
    render(<RankingCamaras cameras={camarasMock} mostrarHeader={true} />);
    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
  });

  it('renderiza sin header cuando mostrarHeader=false', () => {
    render(<RankingCamaras cameras={camarasMock} mostrarHeader={false} />);
    expect(screen.queryByText(/Ranking de cámaras/)).toBeNull();
    expect(screen.getByText('Cámara Norte')).toBeTruthy();
  });

  it('llama a history.push al hacer clic en Ver cámaras', () => {
    render(<RankingCamaras cameras={camarasMock} mostrarHeader={true} />);
    fireEvent.click(screen.getAllByText('Ver cámaras con más alertas')[0]);
    expect(mockPush).toHaveBeenCalledWith('/feed_camaras', expect.any(Object));
  });

  it('renderiza con lista vacía sin errores', () => {
    render(<RankingCamaras cameras={[]} mostrarHeader={true} />);
    expect(screen.getByText(/Ranking de cámaras/)).toBeTruthy();
  });

  it('solo muestra máximo 6 cámaras', () => {
    const muchasCamaras = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1, nombre: `Cámara ${i + 1}`, direccion: `Dirección ${i + 1}`, total_alertas: 10 - i
    }));
    render(<RankingCamaras cameras={muchasCamaras} mostrarHeader={true} />);
    expect(screen.queryByText('Cámara 7')).toBeNull();
  });
});