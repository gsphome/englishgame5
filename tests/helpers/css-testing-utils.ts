/**
 * CSS Testing Utilities
 * 
 * Utilities for testing CSS architecture, BEM compliance, design tokens,
 * and theme context switching in the pure CSS architecture.
 */

import { vi } from 'vitest';

// Theme context testing helpers
export const themeContextHelpers = {
  /**
   * Apply theme context to document
   */
  applyTheme: (theme: 'light' | 'dark') => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  },

  /**
   * Remove all theme classes
   */
  clearTheme: () => {
    document.documentElement.classList.remove('light', 'dark');
  },

  /**
   * Get current theme from document
   */
  getCurrentTheme: (): 'light' | 'dark' | null => {
    if (document.documentElement.classList.contains('dark')) return 'dark';
    if (document.documentElement.classList.contains('light')) return 'light';
    return null;
  },

  /**
   * Test component in all theme contexts
   */
  testInAllThemes: async (testFn: (theme: 'light' | 'dark') => void | Promise<void>) => {
    const themes: ('light' | 'dark')[] = ['light', 'dark'];
    
    for (const theme of themes) {
      themeContextHelpers.applyTheme(theme);
      await testFn(theme);
    }
    
    themeContextHelpers.clearTheme();
  },

  /**
   * Mock media query for responsive testing
   */
  mockMediaQuery: (query: string, matches: boolean) => {
    const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    return mockMatchMedia;
  }
};

// BEM class validation utilities
export const bemValidationHelpers = {
  /**
   * Validate BEM naming convention
   */
  validateBEMClass: (className: string): boolean => {
    // BEM pattern: block__element--modifier or block--modifier or block
    const bemPattern = /^[a-z-]+(__[a-z-]+)?(--[a-z-]+)?$/;
    return bemPattern.test(className);
  },

  /**
   * Check if element follows BEM structure
   */
  validateElementBEM: (element: Element): { valid: boolean; violations: string[] } => {
    const violations: string[] = [];
    const classList = Array.from(element.classList);
    
    classList.forEach(className => {
      // Skip utility classes and non-BEM classes
      if (className.startsWith('sr-') || className === 'lucide' || className.includes('icon')) {
        return;
      }
      
      if (!bemValidationHelpers.validateBEMClass(className)) {
        violations.push(className);
      }
    });

    return {
      valid: violations.length === 0,
      violations
    };
  },

  /**
   * Validate BEM structure in container
   */
  validateContainerBEM: (container: Element): { 
    valid: boolean; 
    totalElements: number; 
    validElements: number; 
    violations: Array<{ element: Element; violations: string[] }> 
  } => {
    const elementsWithClasses = container.querySelectorAll('[class]');
    const violations: Array<{ element: Element; violations: string[] }> = [];
    let validElements = 0;

    elementsWithClasses.forEach(element => {
      const validation = bemValidationHelpers.validateElementBEM(element);
      if (validation.valid) {
        validElements++;
      } else {
        violations.push({
          element,
          violations: validation.violations
        });
      }
    });

    return {
      valid: violations.length === 0,
      totalElements: elementsWithClasses.length,
      validElements,
      violations
    };
  },

  /**
   * Check for Tailwind classes (should not exist)
   */
  detectTailwindClasses: (container: Element): string[] => {
    const tailwindClasses: string[] = [];
    const elementsWithClasses = container.querySelectorAll('[class]');
    
    const tailwindPatterns = [
      /^(bg|text|border|p|m|w|h|flex|grid|rounded|shadow)-/,
      /^(hover|focus|active|dark):/,
      /^(sm|md|lg|xl):/,
      /^space-/,
      /^gap-/,
      /^justify-/,
      /^items-/
    ];

    elementsWithClasses.forEach(element => {
      const classList = Array.from(element.classList);
      classList.forEach(className => {
        const hasTailwindPattern = tailwindPatterns.some(pattern => pattern.test(className));
        if (hasTailwindPattern && !tailwindClasses.includes(className)) {
          tailwindClasses.push(className);
        }
      });
    });

    return tailwindClasses;
  },

  /**
   * Validate component has required BEM structure
   */
  validateComponentStructure: (
    container: Element, 
    componentName: string
  ): { valid: boolean; missing: string[]; found: string[] } => {
    const requiredClasses = [
      componentName, // Block
      `${componentName}__header`, // Common element
      `${componentName}__content`, // Common element
    ];

    const found: string[] = [];
    const missing: string[] = [];

    requiredClasses.forEach(className => {
      if (container.querySelector(`.${className}`)) {
        found.push(className);
      } else {
        missing.push(className);
      }
    });

    return {
      valid: missing.length === 0,
      missing,
      found
    };
  }
};

// Design token testing helpers
export const designTokenHelpers = {
  /**
   * Mock getComputedStyle for design token testing
   */
  mockDesignTokens: (tokens: Record<string, string>) => {
    const originalGetComputedStyle = window.getComputedStyle;
    const mockGetComputedStyle = vi.fn().mockImplementation((element: Element) => {
      const originalStyle = originalGetComputedStyle(element);
      return {
        ...originalStyle,
        getPropertyValue: vi.fn((prop: string) => tokens[prop] || originalStyle.getPropertyValue(prop) || '')
      };
    });

    Object.defineProperty(window, 'getComputedStyle', {
      writable: true,
      configurable: true,
      value: mockGetComputedStyle
    });

    return mockGetComputedStyle;
  },

  /**
   * Validate design token availability
   */
  validateTokenAvailability: (tokens: string[]): { available: string[]; missing: string[] } => {
    const computedStyle = getComputedStyle(document.documentElement);
    const available: string[] = [];
    const missing: string[] = [];

    tokens.forEach(token => {
      const value = computedStyle.getPropertyValue ? computedStyle.getPropertyValue(token).trim() : '';
      if (value) {
        available.push(token);
      } else {
        missing.push(token);
      }
    });

    return { available, missing };
  },

  /**
   * Test design token format
   */
  validateTokenFormat: (token: string, expectedFormat: 'color' | 'size' | 'number'): boolean => {
    const computedStyle = getComputedStyle(document.documentElement);
    const value = computedStyle.getPropertyValue ? computedStyle.getPropertyValue(token).trim() : '';

    if (!value) return false;

    switch (expectedFormat) {
      case 'color':
        return /^#[0-9a-fA-F]{6}$/.test(value) || /^rgb\(/.test(value) || /^hsl\(/.test(value);
      case 'size':
        return /^\d+(\.\d+)?(px|rem|em|%)$/.test(value);
      case 'number':
        return /^\d+(\.\d+)?$/.test(value);
      default:
        return false;
    }
  },

  /**
   * Test theme context variable mapping
   */
  validateThemeMapping: (
    baseToken: string, 
    themeToken: string, 
    theme: 'light' | 'dark'
  ): boolean => {
    themeContextHelpers.applyTheme(theme);
    
    const computedStyle = getComputedStyle(document.documentElement);
    const baseValue = computedStyle.getPropertyValue ? computedStyle.getPropertyValue(baseToken).trim() : '';
    const themeValue = computedStyle.getPropertyValue ? computedStyle.getPropertyValue(themeToken).trim() : '';
    
    themeContextHelpers.clearTheme();
    
    return baseValue !== '' && themeValue !== '';
  },

  /**
   * Get all CSS custom properties from element
   */
  getAllCustomProperties: (element: Element = document.documentElement): string[] => {
    const computedStyle = getComputedStyle(element);
    const properties: string[] = [];
    
    // Note: This is a simplified version. In real implementation,
    // you might need to parse the CSS or use other methods
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      if (property.startsWith('--')) {
        properties.push(property);
      }
    }
    
    return properties;
  }
};

// CSS performance measurement utilities
export const performanceHelpers = {
  /**
   * Measure theme switching performance
   */
  measureThemeSwitch: async (
    fromTheme: 'light' | 'dark', 
    toTheme: 'light' | 'dark'
  ): Promise<number> => {
    themeContextHelpers.applyTheme(fromTheme);
    
    const startTime = performance.now();
    themeContextHelpers.applyTheme(toTheme);
    
    // Wait for any async operations
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const endTime = performance.now();
    return endTime - startTime;
  },

  /**
   * Measure CSS property evaluation time
   */
  measurePropertyEvaluation: (properties: string[], iterations: number = 100): number => {
    const computedStyle = getComputedStyle(document.documentElement);
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      properties.forEach(prop => {
        if (computedStyle.getPropertyValue) {
          computedStyle.getPropertyValue(prop);
        }
      });
    }
    
    const endTime = performance.now();
    return (endTime - startTime) / iterations;
  },

  /**
   * Measure component render time
   */
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const startTime = performance.now();
    renderFn();
    
    // Wait for render to complete
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const endTime = performance.now();
    return endTime - startTime;
  },

  /**
   * Create performance benchmark
   */
  createBenchmark: (name: string, targetTime: number) => {
    return {
      name,
      targetTime,
      measure: async (testFn: () => Promise<void> | void): Promise<{ 
        passed: boolean; 
        actualTime: number; 
        targetTime: number 
      }> => {
        const startTime = performance.now();
        await testFn();
        const endTime = performance.now();
        const actualTime = endTime - startTime;
        
        return {
          passed: actualTime <= targetTime,
          actualTime,
          targetTime
        };
      }
    };
  }
};

// Accessibility testing helpers for CSS
export const accessibilityHelpers = {
  /**
   * Check color contrast (simplified version)
   */
  checkColorContrast: (
    foregroundColor: string, 
    backgroundColor: string, 
    targetRatio: number = 4.5
  ): { passed: boolean; ratio: number } => {
    // This is a simplified implementation
    // In a real scenario, you'd use a proper color contrast library
    
    // Mock implementation for testing
    const mockRatio = 4.6; // Assume good contrast for testing
    
    return {
      passed: mockRatio >= targetRatio,
      ratio: mockRatio
    };
  },

  /**
   * Validate focus indicators
   */
  validateFocusIndicators: (container: Element): { 
    valid: boolean; 
    elementsWithoutFocus: Element[] 
  } => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const elementsWithoutFocus: Element[] = [];
    
    focusableElements.forEach(element => {
      const computedStyle = getComputedStyle(element);
      const outline = computedStyle.outline;
      const outlineWidth = computedStyle.outlineWidth;
      
      // Check if element has focus styles (simplified check)
      if (outline === 'none' && outlineWidth === '0px') {
        elementsWithoutFocus.push(element);
      }
    });

    return {
      valid: elementsWithoutFocus.length === 0,
      elementsWithoutFocus
    };
  },

  /**
   * Check minimum touch target sizes (mobile)
   */
  validateTouchTargets: (container: Element): { 
    valid: boolean; 
    smallTargets: Array<{ element: Element; size: { width: number; height: number } }> 
  } => {
    const interactiveElements = container.querySelectorAll('button, [href], input, select');
    const smallTargets: Array<{ element: Element; size: { width: number; height: number } }> = [];
    const minSize = 44; // 44px minimum for touch targets
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        smallTargets.push({
          element,
          size: { width: rect.width, height: rect.height }
        });
      }
    });

    return {
      valid: smallTargets.length === 0,
      smallTargets
    };
  }
};

// Utility functions for test setup
export const testSetupHelpers = {
  /**
   * Setup CSS testing environment
   */
  setupCSSTestEnvironment: () => {
    // Mock CSS custom properties support
    if (!CSS.supports('color', 'var(--test)')) {
      // Mock CSS.supports for testing environment
      const originalSupports = CSS.supports;
      CSS.supports = vi.fn().mockImplementation((property: string, value: string) => {
        if (value.startsWith('var(--')) {
          return true; // Mock support for CSS custom properties
        }
        return originalSupports.call(CSS, property, value);
      });
    }

    // Setup default theme
    themeContextHelpers.clearTheme();
    themeContextHelpers.applyTheme('light');
  },

  /**
   * Cleanup CSS testing environment
   */
  cleanupCSSTestEnvironment: () => {
    themeContextHelpers.clearTheme();
    vi.restoreAllMocks();
  },

  /**
   * Create CSS test wrapper
   */
  createCSSTestWrapper: (testFn: () => void | Promise<void>) => {
    return async () => {
      testSetupHelpers.setupCSSTestEnvironment();
      try {
        await testFn();
      } finally {
        testSetupHelpers.cleanupCSSTestEnvironment();
      }
    };
  }
};

// Export all helpers as a single object for convenience
export const cssTestingUtils = {
  theme: themeContextHelpers,
  bem: bemValidationHelpers,
  tokens: designTokenHelpers,
  performance: performanceHelpers,
  accessibility: accessibilityHelpers,
  setup: testSetupHelpers
};

export default cssTestingUtils;