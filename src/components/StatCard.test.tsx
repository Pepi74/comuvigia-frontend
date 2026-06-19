import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {

  it('renderiza el número correctamente', () => {
    render(<StatCard number={42} label="Alertas" />);
    expect(screen.getByText('42')).toBeDefined();
  });

  it('renderiza el label correctamente', () => {
    render(<StatCard number={0} label="Cámaras activas" />);
    expect(screen.getByText('Cámaras activas')).toBeDefined();
  });

  it('renderiza número como string', () => {
    render(<StatCard number="N/A" label="Sin datos" />);
    expect(screen.getByText('N/A')).toBeDefined();
  });

  it('renderiza con número cero', () => {
    render(<StatCard number={0} label="Total" />);
    expect(screen.getByText('0')).toBeDefined();
  });

  it('contiene las clases CSS correctas', () => {
    const { container } = render(<StatCard number={5} label="Test" />);
    expect(container.querySelector('.stat-card')).toBeTruthy();
    expect(container.querySelector('.stat-number')).toBeTruthy();
    expect(container.querySelector('.stat-label')).toBeTruthy();
  });

});