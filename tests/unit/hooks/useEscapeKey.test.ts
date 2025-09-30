import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEscapeKey } from '../../../src/hooks/useEscapeKey';

describe('useEscapeKey', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call onClose when escape key is pressed and modal is open', () => {
    renderHook(() => useEscapeKey(true, mockOnClose));

    // Simulate escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when escape key is pressed and modal is closed', () => {
    renderHook(() => useEscapeKey(false, mockOnClose));

    // Simulate escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should not call onClose when other keys are pressed', () => {
    renderHook(() => useEscapeKey(true, mockOnClose));

    // Simulate other key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(enterEvent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should clean up event listener when unmounted', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useEscapeKey(true, mockOnClose));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});