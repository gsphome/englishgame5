import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { applyThemeToDOM } from '../../src/utils/themeInitializer';
import { THEME_CLASSES, THEME_COLORS } from '../../src/utils/themeConstants';

// Mock DOM methods
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(),
};

const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();
const mockSetAttribute = vi.fn();
const _mockRemoveAttribute = vi.fn();
const mockSetProperty = vi.fn();

describe('Theme Conflicts Resolution', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

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

  describe('Theme Class Management', () => {
    it('should add dark class and remove light class for dark theme', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      applyThemeToDOM('dark');

      expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.dark);
      expect(mockClassList.remove).toHaveBeenCalledWith(THEME_CLASSES.light);
    });

    it('should add light class and remove dark class for light theme', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      applyThemeToDOM('light');

      expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.light);
      expect(mockClassList.remove).toHaveBeenCalledWith(THEME_CLASSES.dark);
    });
  });

  describe('Inline Style Cleanup', () => {
    it('should clean up problematic inline color styles', () => {
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('color: red; background: blue; stroke: green;'),
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        style: { display: 'block' },
        offsetHeight: 0,
        classList: { add: vi.fn() }
      };

      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      // First call for inline styles, second for SVG elements, third for theme components
      mockQuerySelectorAll
        .mockReturnValueOnce([mockElement])
        .mockReturnValueOnce([mockElement])
        .mockReturnValueOnce([mockElement]);

      applyThemeToDOM('light');

      expect(mockElement.setAttribute).toHaveBeenCalledWith('style', ' background: blue;');
    });

    it('should remove style attribute when only problematic styles exist', () => {
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('color: red; stroke: green; fill: blue;'),
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        style: { display: 'block' },
        offsetHeight: 0,
        classList: { add: vi.fn() }
      };

      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll
        .mockReturnValueOnce([mockElement])
        .mockReturnValueOnce([mockElement])
        .mockReturnValueOnce([mockElement]);

      applyThemeToDOM('dark');

      expect(mockElement.removeAttribute).toHaveBeenCalledWith('style');
    });

    it('should preserve non-color related inline styles', () => {
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('display: block; margin: 10px; color: red;'),
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        style: { display: 'block' },
        offsetHeight: 0,
        classList: { add: vi.fn() }
      };

      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll
        .mockReturnValueOnce([mockElement])
        .mockReturnValueOnce([mockElement])
        .mockReturnValueOnce([mockElement]);

      applyThemeToDOM('light');

      expect(mockElement.setAttribute).toHaveBeenCalledWith('style', 'display: block; margin: 10px;');
    });
  });

  describe('Force Re-render Mechanism', () => {
    it('should set CSS custom property for force update', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      applyThemeToDOM('dark');

      expect(mockSetProperty).toHaveBeenCalledWith('--theme-force-update', '1');
    });

    it('should set different value for light theme', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      applyThemeToDOM('light');

      expect(mockSetProperty).toHaveBeenCalledWith('--theme-force-update', '0');
    });
  });

  describe('Meta Theme Color Update', () => {
    it('should update meta theme-color for dark theme', () => {
      const mockMetaElement = {
        setAttribute: mockSetAttribute
      };

      mockQuerySelector.mockReturnValue(mockMetaElement);
      mockQuerySelectorAll.mockReturnValue([]);

      applyThemeToDOM('dark');

      expect(mockQuerySelector).toHaveBeenCalledWith('meta[name="theme-color"]');
      expect(mockSetAttribute).toHaveBeenCalledWith('content', THEME_COLORS.dark.metaThemeColor);
    });

    it('should update meta theme-color for light theme', () => {
      const mockMetaElement = {
        setAttribute: mockSetAttribute
      };

      mockQuerySelector.mockReturnValue(mockMetaElement);
      mockQuerySelectorAll.mockReturnValue([]);

      applyThemeToDOM('light');

      expect(mockSetAttribute).toHaveBeenCalledWith('content', THEME_COLORS.light.metaThemeColor);
    });
  });
});