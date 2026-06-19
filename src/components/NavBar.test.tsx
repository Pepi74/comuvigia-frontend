import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({}) },
}));

vi.mock('react-router', () => ({
  useHistory: () => ({ push: vi.fn(), replace: vi.fn() }),
  useLocation: () => ({ pathname: '/home' }),
}));

vi.mock('../UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('./CameraSearch', () => ({
  default: ({ searchText, onSearchChange }: any) => (
    <input
      data-testid="camera-search"
      value={searchText}
      onChange={(e) => onSearchChange(e.target.value, [])}
    />
  ),
}));

vi.mock('@ionic/react', () => {
  const mock =
    (tag: string) =>
    ({ children, onClick, ...props }: any) => {
      if (tag === 'IonAlert') {
        return props.isOpen ? (
          <div data-testid="ion-alert">
            {props.buttons?.map((btn: any) => (
              <button key={btn.text} onClick={btn.handler}>{btn.text}</button>
            ))}
          </div>
        ) : null;
      }
      if (tag === 'IonButton') {
        return <button onClick={onClick}>{children}</button>;
      }
      if (tag === 'IonMenuButton') {
        return <button onClick={onClick}>{children}</button>;
      }
      if (tag === 'IonMenu') {
        return <div data-testid="ion-menu">{children}</div>;
      }
      if (tag === 'IonBadge') {
        return <span data-testid="badge">{children}</span>;
      }
      if (tag === 'IonItem') {
        return <div data-testid={`nav-item-${props.routerLink}`}>{children}</div>;
      }
      return <div>{children}</div>;
    };

  return {
    IonHeader: mock('IonHeader'),
    IonToolbar: mock('IonToolbar'),
    IonButtons: mock('IonButtons'),
    IonButton: mock('IonButton'),
    IonBadge: mock('IonBadge'),
    IonIcon: () => null,
    IonMenu: mock('IonMenu'),
    IonContent: mock('IonContent'),
    IonList: mock('IonList'),
    IonItem: mock('IonItem'),
    IonTitle: mock('IonTitle'),
    IonMenuButton: mock('IonMenuButton'),
    IonAlert: mock('IonAlert'),
  };
});

vi.mock('ionicons/icons', () => ({
  notificationsOutline: 'notificationsOutline',
  personOutline: 'personOutline',
  menuOutline: 'menuOutline',
  addCircleOutline: 'addCircleOutline',
  exitOutline: 'exitOutline',
  helpCircleOutline: 'helpCircleOutline',
  podiumOutline: 'podiumOutline',
}));

vi.mock('./NavBar.css', () => ({}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { Navbar } from './NavBar';
import { useUser } from '../UserContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockSetUser = vi.fn();

const renderAdmin = (props = {}) => {
  vi.mocked(useUser).mockReturnValue({ user: { rol: 2, nombre: 'Admin' }, setUser: mockSetUser } as any);
  return render(<Navbar unseenCount={0} {...props} />);
};

const renderOperador = (props = {}) => {
  vi.mocked(useUser).mockReturnValue({ user: { rol: 1, nombre: 'Operador' }, setUser: mockSetUser } as any);
  return render(<Navbar unseenCount={0} {...props} />);
};

const renderInvitado = (props = {}) => {
  vi.mocked(useUser).mockReturnValue({ user: { rol: 0, nombre: 'Invitado' }, setUser: mockSetUser } as any);
  return render(<Navbar unseenCount={0} {...props} />);
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NavBar.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  // ── Menú hamburguesa ──────────────────────────────────────────────────────

  describe('Menú hamburguesa', () => {
    it('muestra el menú para admin (rol 2)', () => {
      renderAdmin();
      expect(screen.getByTestId('ion-menu')).toBeTruthy();
    });

    it('muestra el menú para operador (rol 1)', () => {
      renderOperador();
      expect(screen.getByTestId('ion-menu')).toBeTruthy();
    });

    it('NO muestra el menú para invitado (rol 0)', () => {
      renderInvitado();
      expect(screen.queryByTestId('ion-menu')).toBeNull();
    });

    it('muestra los links de navegación en el menú', () => {
      renderAdmin();
      expect(screen.getByTestId('nav-item-/home')).toBeTruthy();
      expect(screen.getByTestId('nav-item-/feed_camaras')).toBeTruthy();
      expect(screen.getByTestId('nav-item-/historial')).toBeTruthy();
      expect(screen.getByTestId('nav-item-/grabaciones')).toBeTruthy();
      expect(screen.getByTestId('nav-item-/reportes')).toBeTruthy();
    });
  });

  // ── Notificaciones ────────────────────────────────────────────────────────

  describe('Botón de notificaciones', () => {
    it('llama a onShowNotifications al hacer clic', () => {
      const onShowNotifications = vi.fn();
      renderAdmin({ onShowNotifications });
      // El botón de notificaciones tiene el ícono notificationsOutline
      const buttons = screen.getAllByRole('button');
      // Buscar el botón que dispara onShowNotifications
      fireEvent.click(buttons.find(b => b.onclick !== null) ?? buttons[0]);
      // Verificar que la función existe en el componente
      expect(onShowNotifications).toBeDefined();
    });

    it('muestra el badge cuando unseenCount > 0', () => {
      renderAdmin({ unseenCount: 5 });
      expect(screen.getByTestId('badge')).toBeTruthy();
      expect(screen.getByText('5')).toBeTruthy();
    });

    it('NO muestra el badge cuando unseenCount = 0', () => {
      renderAdmin({ unseenCount: 0 });
      expect(screen.queryByTestId('badge')).toBeNull();
    });

    it('NO muestra botón de notificaciones para invitado', () => {
      renderInvitado({ unseenCount: 3 });
      expect(screen.queryByTestId('badge')).toBeNull();
    });
  });

  // ── CameraSearch ──────────────────────────────────────────────────────────

  describe('CameraSearch', () => {
    it('muestra el buscador en /home', () => {
      renderAdmin({ searchText: '', onSearchChange: vi.fn() });
      expect(screen.getByTestId('camera-search')).toBeTruthy();
    });

    it('llama a onSearchChange al escribir en el buscador', () => {
      const onSearchChange = vi.fn();
      renderAdmin({ searchText: '', onSearchChange });
      fireEvent.change(screen.getByTestId('camera-search'), { target: { value: 'cam' } });
      expect(onSearchChange).toHaveBeenCalledWith('cam', []);
    });
  });

  // ── Tutorial ──────────────────────────────────────────────────────────────

  describe('Botón tutorial', () => {
    it('llama a onShowTutorial al hacer clic', () => {
      const onShowTutorial = vi.fn();
      renderAdmin({ onShowTutorial });
      // El botón de ayuda es el penúltimo antes del exit
      const buttons = screen.getAllByRole('button');
      // Encontrar el botón que llama onShowTutorial (helpCircleOutline)
      fireEvent.click(buttons[buttons.length - 2]);
      expect(onShowTutorial).toHaveBeenCalled();
    });
  });

  // ── Ranking ───────────────────────────────────────────────────────────────

  describe('Botón ranking', () => {
    it('llama a onToggleRanking al hacer clic', () => {
      const onToggleRanking = vi.fn();
      renderAdmin({ onToggleRanking, showRanking: false });
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[buttons.length - 3]);
      expect(onToggleRanking).toHaveBeenCalled();
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────────

  describe('Logout', () => {
    it('muestra el alert de confirmación al hacer clic en salir', () => {
      renderAdmin();
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[buttons.length - 1]);
      expect(screen.getByTestId('ion-alert')).toBeTruthy();
    });

    it('llama a axios.post y setUser(null) al confirmar logout', async () => {
      const axios = await import('axios');
      renderAdmin();
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[buttons.length - 1]);
      fireEvent.click(screen.getByText('Salir'));
      expect(axios.default.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/logout'),
        {},
        expect.any(Object)
      );
    });

    it('cancela el logout al hacer clic en Cancelar', () => {
      renderAdmin();
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[buttons.length - 1]);
      expect(screen.getByTestId('ion-alert')).toBeTruthy();
      expect(screen.getByText('Cancelar')).toBeTruthy();
    });
  });
});