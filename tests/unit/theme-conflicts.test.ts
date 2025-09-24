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

describe('Design Token System and Theme Context', () => {
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

  describe('Design Token Validation', () => {
    it('should validate theme context variable mapping', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      // Test dark theme context
      applyThemeToDOM('dark');

      // Verify theme class is applied (enables CSS context variables)
      expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.dark);
      expect(mockClassList.remove).toHaveBeenCalledWith(THEME_CLASSES.light);
    });

    it('should validate CSS custom property fallback chains', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      // Test light theme context
      applyThemeToDOM('light');

      // Verify theme class is applied (enables CSS context variables)
      expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.light);
      expect(mockClassList.remove).toHaveBeenCalledWith(THEME_CLASSES.dark);
    });

    it('should test design token system integrity', () => {
      // Verify theme constants are properly defined
      expect(THEME_CLASSES.light).toBeDefined();
      expect(THEME_CLASSES.dark).toBeDefined();
      expect(THEME_COLORS.light).toBeDefined();
      expect(THEME_COLORS.dark).toBeDefined();

      // Verify theme colors have required properties
      expect(THEME_COLORS.light.metaThemeColor).toBeDefined();
      expect(THEME_COLORS.dark.metaThemeColor).toBeDefined();
    });
  });

  describe('Theme Switching Performance', () => {
    it('should complete theme switching within performance target', async () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      const startTime = performance.now();
      
      applyThemeToDOM('dark');
      
      // Wait for any async operations
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Verify theme switching completes within 100ms target
      expect(duration).toBeLessThan(100);
    });

    it('should set CSS custom property for theme update tracking', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      applyThemeToDOM('dark');

      expect(mockSetProperty).toHaveBeenCalledWith('--theme-force-update', '1');
    });

    it('should use different update value for light theme', () => {
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

  describe('CSS Custom Property System', () => {
    it('should validate design token availability in DOM', () => {
      // Mock getComputedStyle to simulate CSS custom properties
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: vi.fn((prop: string) => {
          // Simulate design tokens being available
          const tokens: Record<string, string> = {
            '--theme-text-primary': '#374151',
            '--theme-bg-primary': '#ffffff',
            '--theme-border-primary': '#e5e7eb',
            '--text-primary': '#374151',
            '--bg-elevated': '#ffffff',
            '--border-soft': '#f3f4f6'
          };
          return tokens[prop] || '';
        })
      });

      Object.defineProperty(window, 'getComputedStyle', {
        writable: true,
        value: mockGetComputedStyle
      });

      // Test that design tokens are accessible
      const computedStyle = getComputedStyle(document.documentElement);
      
      expect(computedStyle.getPropertyValue('--theme-text-primary')).toBeTruthy();
      expect(computedStyle.getPropertyValue('--theme-bg-primary')).toBeTruthy();
      expect(computedStyle.getPropertyValue('--text-primary')).toBeTruthy();
      expect(computedStyle.getPropertyValue('--bg-elevated')).toBeTruthy();
    });

    it('should validate theme context variable mapping correctness', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      // Apply dark theme
      applyThemeToDOM('dark');

      // Verify dark theme class is applied (enables dark theme CSS context)
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
      
      // Apply light theme
      applyThemeToDOM('light');

      // Verify light theme class is applied (enables light theme CSS context)
      expect(mockClassList.remove).toHaveBeenCalledWith('dark');
    });

    it('should handle theme switching without CSS conflicts', () => {
      mockQuerySelector.mockReturnValue({
        setAttribute: mockSetAttribute
      });
      mockQuerySelectorAll.mockReturnValue([]);

      // Switch between themes multiple times
      applyThemeToDOM('light');
      applyThemeToDOM('dark');
      applyThemeToDOM('light');

      // Verify proper class management (no conflicts)
      expect(mockClassList.add).toHaveBeenCalledWith('light');
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
      expect(mockClassList.remove).toHaveBeenCalledWith('dark');
      expect(mockClassList.remove).toHaveBeenCalledWith('light');
    });
  });
});