import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

const mockJoyride = vi.fn();
vi.mock('react-joyride', () => ({
  default: (props: any) => {
    mockJoyride(props);
    return null;
  },
  STATUS: { FINISHED: 'finished', SKIPPED: 'skipped' },
}));
vi.mock('./HomeTutorial.css', () => ({}));

import HomeTutorial from './HomeTutorial';

describe('HomeTutorial.tsx', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza sin errores', () => {
    render(<HomeTutorial run={false} onFinish={vi.fn()} />);
    expect(mockJoyride).toHaveBeenCalled();
  });

  it('pasa run=false a Joyride cuando no está activo', () => {
    render(<HomeTutorial run={false} onFinish={vi.fn()} />);
    expect(mockJoyride).toHaveBeenCalledWith(expect.objectContaining({ run: false }));
  });

  it('pasa run=true a Joyride cuando está activo', () => {
    render(<HomeTutorial run={true} onFinish={vi.fn()} />);
    expect(mockJoyride).toHaveBeenCalledWith(expect.objectContaining({ run: true }));
  });

  it('llama a onFinish cuando el tour termina (FINISHED)', () => {
    const onFinish = vi.fn();
    render(<HomeTutorial run={true} onFinish={onFinish} />);
    const { callback } = mockJoyride.mock.calls[0][0];
    callback({ status: 'finished' });
    expect(onFinish).toHaveBeenCalled();
  });

  it('llama a onFinish cuando el tour se salta (SKIPPED)', () => {
    const onFinish = vi.fn();
    render(<HomeTutorial run={true} onFinish={onFinish} />);
    const { callback } = mockJoyride.mock.calls[0][0];
    callback({ status: 'skipped' });
    expect(onFinish).toHaveBeenCalled();
  });

  it('NO llama a onFinish con status intermedio', () => {
    const onFinish = vi.fn();
    render(<HomeTutorial run={true} onFinish={onFinish} />);
    const { callback } = mockJoyride.mock.calls[0][0];
    callback({ status: 'running' });
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('pasa los steps correctos a Joyride', () => {
    render(<HomeTutorial run={false} onFinish={vi.fn()} />);
    const { steps } = mockJoyride.mock.calls[0][0];
    expect(steps.length).toBeGreaterThan(0);
  });

  it('tiene los textos de locale en español', () => {
    render(<HomeTutorial run={false} onFinish={vi.fn()} />);
    const { locale } = mockJoyride.mock.calls[0][0];
    expect(locale.next).toBe('Siguiente');
    expect(locale.skip).toBe('Saltar');
    expect(locale.last).toBe('Finalizar');
  });
});