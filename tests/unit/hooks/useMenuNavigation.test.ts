import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMenuNavigation } from '../../../src/hooks/useMenuNavigation';

// Mock the store
const mockSetCurrentView = vi.fn();
const mockPreviousMenuContext = 'progression';

vi.mock('../../../src/stores/appStore', () => ({
  useAppStore: vi.fn(() => ({
    setCurrentView: mockSetCurrentView,
    previousMenuContext: mockPreviousMenuContext,
  })),
}));

describe('useMenuNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the correct previous menu context', () => {
    const { result } = renderHook(() => useMenuNavigation());
    
    expect(result.current.previousMenuContext).toBe('progression');
  });

  it('should call setCurrentView with menu when returnToMenu is called', () => {
    const { result } = renderHook(() => useMenuNavigation());
    
    act(() => {
      result.current.returnToMenu();
    });
    
    expect(mockSetCurrentView).toHaveBeenCalledWith('menu');
  });

  it('should provide returnToMenu function', () => {
    const { result } = renderHook(() => useMenuNavigation());
    
    expect(typeof result.current.returnToMenu).toBe('function');
  });
});