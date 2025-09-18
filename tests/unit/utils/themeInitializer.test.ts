import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectSystemTheme,
  getInitialTheme,
  applyThemeToDOM,
  setupSystemThemeListener,
  initializeTheme
} from '../../../src/utils/themeInitializer';

// Mock DOM methods
const mockMatchMedia = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockAddListener = vi.fn();
const mockRemoveListener = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock document methods
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(),
};

const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();
const mockSetAttribute = vi.fn();
const mockSetProperty = vi.fn();

describe('themeInitializer', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup window.matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: mockLocalStorage,
    });

    // Setup document mock
    Object.defineProperty(document, 'documentElement', {
      writable: true,
      value: {
        classList: mockClassList,
        style: {
          setProperty: mockSetProperty,
        },
      },
    });

    Object.defineProperty(document, 'querySelector', {
      writable: true,
      value: mockQuerySelector,
    });

    Object.defineProperty(document, 'querySelectorAll', {
      writable: true,
      value: mockQuerySelectorAll,
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('detectSystemTheme', () => {
    it('should return dark when system prefers dark mode', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
      });

      const result = detectSystemTheme();
      expect(result).toBe('dark');
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should return light when system prefers light mode', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
      });

      const result = detectSystemTheme();
      expect(result).toBe('light');
    });

    it('should return light when matchMedia is not available', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined,
      });

      const result = detectSystemTheme();
      expect(result).toBe('light');
    });
  });

  describe('getInitialTheme', () => {
    it('should return stored theme when available', () => {
      const mockStoredData = {
        state: {
          theme: 'dark'
        }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockStoredData));

      const result = getInitialTheme();
      expect(result).toEqual({
        theme: 'dark',
        isSystemPreference: false
      });
    });

    it('should return system theme when no stored preference', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({ matches: true });

      const result = getInitialTheme();
      expect(result).toEqual({
        theme: 'dark',
        isSystemPreference: true
      });
    });

    it('should handle localStorage parsing errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      mockMatchMedia.mockReturnValue({ matches: false });

      const result = getInitialTheme();
      expect(result).toEqual({
        theme: 'light',
        isSystemPreference: true
      });
    });
  });

  describe('applyThemeToDOM', () => {
    it('should add dark class for dark theme', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      applyThemeToDOM('dark');

      expect(mockClassList.add).toHaveBeenCalledWith('dark');
      expect(mockQuerySelector).toHaveBeenCalledWith('meta[name="theme-color"]');
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#1f2937');
    });

    it('should remove dark class for light theme', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      applyThemeToDOM('light');

      expect(mockClassList.remove).toHaveBeenCalledWith('dark');
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#ffffff');
    });
  });

  describe('setupSystemThemeListener', () => {
    it('should set up modern event listener', () => {
      const mockCallback = vi.fn();
      const mockMediaQuery = {
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      };
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      const cleanup = setupSystemThemeListener(mockCallback);

      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      // Test cleanup
      cleanup();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should set up legacy listener when modern not available', () => {
      const mockCallback = vi.fn();
      const mockMediaQuery = {
        addListener: mockAddListener,
        removeListener: mockRemoveListener,
      };
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      const cleanup = setupSystemThemeListener(mockCallback);

      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));

      // Test cleanup
      cleanup();
      expect(mockRemoveListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should return empty cleanup when matchMedia not available', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined,
      });

      const mockCallback = vi.fn();
      const cleanup = setupSystemThemeListener(mockCallback);

      expect(typeof cleanup).toBe('function');
      // Should not throw when called
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('initializeTheme', () => {
    it('should initialize theme and return theme state', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({ matches: true });
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      const result = initializeTheme();

      expect(result).toEqual({
        theme: 'dark',
        isSystemPreference: true
      });
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });
  });
});