import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('@ionic/react', () => ({
  IonSearchbar: ({ value, onIonInput, placeholder }: any) => (
    <input
      data-testid="searchbar"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onIonInput({ detail: { value: e.target.value } })}
    />
  ),
  IonSelect: ({ children, onIonChange, value }: any) => (
    <select
      data-testid="search-select"
      value={value}
      onChange={(e) => onIonChange({ detail: { value: e.target.value } })}
    >
      {children}
    </select>
  ),
  IonSelectOption: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

vi.mock('./CameraSearch.css', () => ({}));

import CameraSearch from './CameraSearch';
import type { Camera } from '../types/Camera';

const mockCameras: Camera[] = [
  { id: 1, nombre: 'Cámara Norte', direccion: 'Av. Principal 123', estado_camara: true, ultima_conexion: '', total_alertas: 0, id_sector: 1, zona_interes: '', posicion: [-33.5, -70.6], link_camara: '', link_camara_externo: '' },
  { id: 2, nombre: 'Cámara Sur', direccion: 'Calle Secundaria 456', estado_camara: false, ultima_conexion: '', total_alertas: 0, id_sector: 2, zona_interes: '', posicion: [-33.6, -70.7], link_camara: '', link_camara_externo: '' },
  { id: 3, nombre: 'Cámara Este', direccion: 'Pasaje Árbol 789', estado_camara: true, ultima_conexion: '', total_alertas: 0, id_sector: 1, zona_interes: '', posicion: [-33.4, -70.5], link_camara: '', link_camara_externo: '' },
];

const onSearchChange = vi.fn();

const defaultProps = {
  cameras: mockCameras,
  searchText: '',
  onSearchChange,
};

describe('CameraSearch.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza el searchbar', () => {
    render(<CameraSearch {...defaultProps} />);
    expect(screen.getByTestId('searchbar')).toBeTruthy();
  });

  it('renderiza el select de tipo de búsqueda', () => {
    render(<CameraSearch {...defaultProps} />);
    expect(screen.getByTestId('search-select')).toBeTruthy();
  });

  it('busca por nombre por defecto y encuentra resultados', () => {
    render(<CameraSearch {...defaultProps} />);
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: 'Norte' } });
    expect(onSearchChange).toHaveBeenCalledWith(
      'Norte',
      expect.arrayContaining([expect.objectContaining({ nombre: 'Cámara Norte' })])
    );
  });

  it('devuelve array vacío cuando el texto está vacío', () => {
    render(<CameraSearch {...defaultProps} />);
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: ' ' } });
    expect(onSearchChange).toHaveBeenCalledWith(' ', []);
  });

  it('busca por ID al cambiar el select', () => {
    render(<CameraSearch {...defaultProps} />);
    fireEvent.change(screen.getByTestId('search-select'), { target: { value: 'id' } });
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: '2' } });
    expect(onSearchChange).toHaveBeenCalledWith(
      '2',
      expect.arrayContaining([expect.objectContaining({ id: 2 })])
    );
  });

  it('busca por dirección al cambiar el select', () => {
    render(<CameraSearch {...defaultProps} />);
    fireEvent.change(screen.getByTestId('search-select'), { target: { value: 'direccion' } });
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: 'Principal' } });
    expect(onSearchChange).toHaveBeenCalledWith(
      'Principal',
      expect.arrayContaining([expect.objectContaining({ direccion: 'Av. Principal 123' })])
    );
  });

  it('normaliza texto con tildes al buscar', () => {
    render(<CameraSearch {...defaultProps} />);
    fireEvent.change(screen.getByTestId('search-select'), { target: { value: 'direccion' } });
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: 'Arbol' } });
    expect(onSearchChange).toHaveBeenCalledWith(
      'Arbol',
      expect.arrayContaining([expect.objectContaining({ nombre: 'Cámara Este' })])
    );
  });

  it('devuelve array vacío cuando no hay coincidencias', () => {
    render(<CameraSearch {...defaultProps} />);
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: 'xyzxyz' } });
    expect(onSearchChange).toHaveBeenCalledWith('xyzxyz', []);
  });
});