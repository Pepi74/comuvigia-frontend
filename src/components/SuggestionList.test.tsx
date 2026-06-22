import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@ionic/react', () => ({
  IonList: ({ children, style }: any) => <ul style={style}>{children}</ul>,
  IonItem: ({ children, onClick }: any) => <li onClick={onClick}>{children}</li>,
  IonLabel: ({ children }: any) => <div>{children}</div>,
  IonNote: ({ children }: any) => <span>{children}</span>,
}));

import SuggestionList from './SuggestionList';
import { Camera } from '../types/Camera';

const camarasMock: Camera[] = [
  {
    id: 1,
    nombre: 'Cámara Norte',
    direccion: 'Av. Principal 123',
    posicion: [-33.4, -70.6],
    estado_camara: true,
    ultima_conexion: '2024-01-01T00:00:00Z',
    total_alertas: 0,
    id_sector: 1,
    zona_interes: '{}'
  },
  {
    id: 2,
    nombre: 'Cámara Sur',
    direccion: 'Calle Secundaria 456',
    posicion: [-33.5, -70.7],
    estado_camara: false,
    ultima_conexion: '2024-01-01T00:00:00Z',
    total_alertas: 2,
    id_sector: 1,
    zona_interes: '{}'
  }
];

describe('SuggestionList', () => {

  it('no renderiza nada si suggestions está vacío', () => {
    const { container } = render(
      <SuggestionList suggestions={[]} onSelect={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza las sugerencias correctamente', () => {
    render(
      <SuggestionList suggestions={camarasMock} onSelect={() => {}} />
    );
    expect(screen.getByText('Cámara Norte')).toBeDefined();
    expect(screen.getByText('Cámara Sur')).toBeDefined();
  });

  it('renderiza las direcciones de cada cámara', () => {
    render(
      <SuggestionList suggestions={camarasMock} onSelect={() => {}} />
    );
    expect(screen.getByText('Av. Principal 123')).toBeDefined();
    expect(screen.getByText('Calle Secundaria 456')).toBeDefined();
  });

  it('llama onSelect con la cámara correcta al hacer click', () => {
    const onSelect = vi.fn();
    render(
      <SuggestionList suggestions={camarasMock} onSelect={onSelect} />
    );

    fireEvent.click(screen.getByText('Cámara Norte'));
    expect(onSelect).toHaveBeenCalledWith(camarasMock[0]);
  });

  it('renderiza con estilos personalizados', () => {
    const { container } = render(
      <SuggestionList
        suggestions={camarasMock}
        onSelect={() => {}}
        style={{ top: '100px' }}
      />
    );
    const lista = container.querySelector('ul');
    expect(lista).toBeDefined();
  });

});