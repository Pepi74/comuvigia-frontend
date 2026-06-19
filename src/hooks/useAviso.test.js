import { renderHook, act } from '@testing-library/react';
import { useAviso } from './useAviso';

describe('useAviso', () => {

  it('estado inicial es cerrado con valores por defecto', () => {
    const { result } = renderHook(() => useAviso());

    expect(result.current.alertState.isOpen).toBe(false);
    expect(result.current.alertState.type).toBe('info');
    expect(result.current.alertState.message).toBe('');
  });

  it('showAlert abre el aviso con tipo y mensaje', () => {
    const { result } = renderHook(() => useAviso());

    act(() => {
      result.current.showAlert('success', 'Operación exitosa');
    });

    expect(result.current.alertState.isOpen).toBe(true);
    expect(result.current.alertState.type).toBe('success');
    expect(result.current.alertState.message).toBe('Operación exitosa');
  });

  it('showAlert acepta opciones adicionales', () => {
    const { result } = renderHook(() => useAviso());

    act(() => {
      result.current.showAlert('warning', 'Advertencia', {
        title: 'Título',
        style: 'detailed',
        duration: 3000
      });
    });

    expect(result.current.alertState.title).toBe('Título');
    expect(result.current.alertState.style).toBe('detailed');
    expect(result.current.alertState.duration).toBe(3000);
  });

  it('closeAlert cierra el aviso', () => {
    const { result } = renderHook(() => useAviso());

    act(() => {
      result.current.showAlert('info', 'Mensaje');
    });

    expect(result.current.alertState.isOpen).toBe(true);

    act(() => {
      result.current.closeAlert();
    });

    expect(result.current.alertState.isOpen).toBe(false);
  });

  it('showSuccess abre aviso de tipo success', () => {
    const { result } = renderHook(() => useAviso());

    act(() => {
      result.current.showSuccess('Todo bien');
    });

    expect(result.current.alertState.type).toBe('success');
    expect(result.current.alertState.message).toBe('Todo bien');
    expect(result.current.alertState.isOpen).toBe(true);
  });

  it('showError abre aviso de tipo error', () => {
    const { result } = renderHook(() => useAviso());

    act(() => {
      result.current.showError('Algo falló');
    });

    expect(result.current.alertState.type).toBe('error');
    expect(result.current.alertState.message).toBe('Algo falló');
  });

  it('showWarning abre aviso de tipo warning', () => {
    const { result } = renderHook(() => useAviso());

    act(() => {
      result.current.showWarning('Cuidado');
    });

    expect(result.current.alertState.type).toBe('warning');
  });

  it('showInfo abre aviso de tipo info', () => {
    const { result } = renderHook(() => useAviso());

    act(() => {
      result.current.showInfo('Información');
    });

    expect(result.current.alertState.type).toBe('info');
  });

});