import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

const mockJoyride = vi.fn();
vi.mock('react-joyride', () => ({
  default: (props: any) => { mockJoyride(props); return null; },
  STATUS: { FINISHED: 'finished', SKIPPED: 'skipped' },
}));

import GrabacionesTutorial from './GrabacionesTutorial';

describe('GrabacionesTutorial.tsx', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza sin errores', () => {
    render(<GrabacionesTutorial run={false} onFinish={vi.fn()} />);
    expect(mockJoyride).toHaveBeenCalled();
  });

  it('pasa run=false a Joyride', () => {
    render(<GrabacionesTutorial run={false} onFinish={vi.fn()} />);
    expect(mockJoyride).toHaveBeenCalledWith(expect.objectContaining({ run: false }));
  });

  it('pasa run=true a Joyride', () => {
    render(<GrabacionesTutorial run={true} onFinish={vi.fn()} />);
    expect(mockJoyride).toHaveBeenCalledWith(expect.objectContaining({ run: true }));
  });

  it('llama a onFinish cuando termina (FINISHED)', () => {
    const onFinish = vi.fn();
    render(<GrabacionesTutorial run={true} onFinish={onFinish} />);
    mockJoyride.mock.calls[0][0].callback({ status: 'finished' });
    expect(onFinish).toHaveBeenCalled();
  });

  it('llama a onFinish cuando se salta (SKIPPED)', () => {
    const onFinish = vi.fn();
    render(<GrabacionesTutorial run={true} onFinish={onFinish} />);
    mockJoyride.mock.calls[0][0].callback({ status: 'skipped' });
    expect(onFinish).toHaveBeenCalled();
  });

  it('NO llama a onFinish con status intermedio', () => {
    const onFinish = vi.fn();
    render(<GrabacionesTutorial run={true} onFinish={onFinish} />);
    mockJoyride.mock.calls[0][0].callback({ status: 'running' });
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('tiene 3 steps', () => {
    render(<GrabacionesTutorial run={false} onFinish={vi.fn()} />);
    expect(mockJoyride.mock.calls[0][0].steps.length).toBe(3);
  });

  it('tiene locale en español', () => {
    render(<GrabacionesTutorial run={false} onFinish={vi.fn()} />);
    const { locale } = mockJoyride.mock.calls[0][0];
    expect(locale.next).toBe('Siguiente');
    expect(locale.skip).toBe('Saltar');
  });
});