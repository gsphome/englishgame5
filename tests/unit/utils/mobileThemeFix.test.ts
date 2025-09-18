import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isMobileDevice,
  applyMobileTheme,
  clearMobileCachedStyles,
  updateMobileViewportMeta,
} from '../../../src/utils/mobileThemeFix';

// Mock DOM methods
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(),
};

const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();
const mockSetAttribute = vi.fn();
const mockSetProperty = vi.fn();
const mockAppendChild = vi.fn();
const mockCreateElement = vi.fn();

describe('Mobile Theme Fix', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup navigator mock
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });

    // Setup window mock
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
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

    Object.defineProperty(document, 'body', {
      writable: true,
      value: {
        style: {
          display: '',
        },
        offsetHeight: 0,
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

    Object.defineProperty(document, 'createElement', {
      writable: true,
      value: mockCreateElement,
    });

    Object.defineProperty(document, 'head', {
      writable: true,
      value: {
        appendChild: mockAppendChild,
      },
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

  describe('isMobileDevice', () => {
    it('should detect mobile device by user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should detect mobile device by screen width', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 600,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should not detect desktop as mobile', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200,
      });

      expect(isMobileDevice()).toBe(false);
    });
  });

  describe('clearMobileCachedStyles', () => {
    it('should remove color-related inline styles', () => {
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('color: red; background-color: blue; margin: 10px;'),
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
      };

      mockQuerySelectorAll.mockReturnValue([mockElement]);

      clearMobileCachedStyles();

      expect(mockElement.setAttribute).toHaveBeenCalledWith('style', ' margin: 10px;');
    });

    it('should remove style attribute when only color styles exist', () => {
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('color: red; stroke: green;'),
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
      };

      mockQuerySelectorAll.mockReturnValue([mockElement]);

      clearMobileCachedStyles();

      expect(mockElement.removeAttribute).toHaveBeenCalledWith('style');
    });
  });

  describe('updateMobileViewportMeta', () => {
    it('should create and update theme-color meta tag', () => {
      const mockMetaElement = {
        setAttribute: mockSetAttribute,
      };

      mockQuerySelector.mockReturnValue(null);
      mockCreateElement.mockReturnValue(mockMetaElement);

      updateMobileViewportMeta('dark');

      expect(mockCreateElement).toHaveBeenCalledWith('meta');
      expect(mockSetAttribute).toHaveBeenCalledWith('name', 'theme-color');
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#1f2937');
      expect(mockAppendChild).toHaveBeenCalledWith(mockMetaElement);
    });

    it('should update existing theme-color meta tag', () => {
      const mockMetaElement = {
        setAttribute: mockSetAttribute,
      };

      mockQuerySelector.mockReturnValue(mockMetaElement);

      updateMobileViewportMeta('light');

      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#ffffff');
    });
  });

  describe('applyMobileTheme', () => {
    it('should apply mobile theme optimizations', () => {
      mockQuerySelector.mockReturnValue(null);
      mockQuerySelectorAll.mockReturnValue([]);
      mockCreateElement.mockReturnValue({
        setAttribute: mockSetAttribute,
      });

      applyMobileTheme('dark');

      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
      expect(mockSetProperty).toHaveBeenCalledWith('--mobile-theme-update', expect.any(String));
    });
  });
});