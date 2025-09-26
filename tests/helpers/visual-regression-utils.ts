import { vi } from 'vitest';

export interface VisualBaseline {
  componentName: string;
  themeContext: string;
  viewport: string;
  timestamp: number;
  elements: {
    [key: string]: {
      visible: boolean;
      className: string;
      computedStyles?: Record<string, string>;
    };
  };
}

export interface VisualDiff {
  componentName: string;
  themeContext: string;
  differences: string[];
  passed: boolean;
}

/**
 * Captures visual baseline for a component in a specific theme context
 */
export const captureVisualBaseline = (
  container: HTMLElement,
  componentName: string,
  themeContext: string,
  viewport: string = 'desktop'
): VisualBaseline => {
  const elements: VisualBaseline['elements'] = {};

  // Capture key elements based on component type
  if (componentName === 'Header') {
    const header = container.querySelector('header');
    const menuBtn = container.querySelector('.header-redesigned__menu-btn');
    const userBtn = container.querySelector('[aria-label*="user profile"]');

    elements.header = {
      visible: header ? (header as HTMLElement).style.display !== 'none' : false,
      className: header?.className || '',
    };

    elements.menuButton = {
      visible: menuBtn ? (menuBtn as HTMLElement).style.display !== 'none' : false,
      className: menuBtn?.className || '',
    };

    elements.userButton = {
      visible: userBtn ? (userBtn as HTMLElement).style.display !== 'none' : false,
      className: userBtn?.className || '',
    };
  }

  if (componentName === 'CompactAdvancedSettings') {
    const modal = container.querySelector('.compact-settings');
    const closeBtn = container.querySelector('.compact-settings__close-btn');
    const title = container.querySelector('.compact-settings__title');

    elements.modal = {
      visible: modal ? (modal as HTMLElement).style.display !== 'none' : false,
      className: modal?.className || '',
    };

    elements.closeButton = {
      visible: closeBtn ? (closeBtn as HTMLElement).style.display !== 'none' : false,
      className: closeBtn?.className || '',
    };

    elements.title = {
      visible: title ? (title as HTMLElement).style.display !== 'none' : false,
      className: title?.className || '',
    };
  }

  return {
    componentName,
    themeContext,
    viewport,
    timestamp: Date.now(),
    elements,
  };
};/**

 * Compares current visual state against baseline
 */
export const compareVisualBaseline = (
  current: VisualBaseline,
  baseline: VisualBaseline
): VisualDiff => {
  const differences: string[] = [];

  // Compare basic metadata
  if (current.componentName !== baseline.componentName) {
    differences.push(`Component name mismatch: ${current.componentName} vs ${baseline.componentName}`);
  }

  if (current.themeContext !== baseline.themeContext) {
    differences.push(`Theme context mismatch: ${current.themeContext} vs ${baseline.themeContext}`);
  }

  // Compare elements
  const currentElements = Object.keys(current.elements);
  const baselineElements = Object.keys(baseline.elements);

  // Check for missing elements
  baselineElements.forEach(elementKey => {
    if (!currentElements.includes(elementKey)) {
      differences.push(`Missing element: ${elementKey}`);
    }
  });

  // Check for extra elements
  currentElements.forEach(elementKey => {
    if (!baselineElements.includes(elementKey)) {
      differences.push(`Extra element: ${elementKey}`);
    }
  });

  // Compare element properties
  currentElements.forEach(elementKey => {
    if (baseline.elements[elementKey]) {
      const currentEl = current.elements[elementKey];
      const baselineEl = baseline.elements[elementKey];

      if (currentEl.visible !== baselineEl.visible) {
        differences.push(`${elementKey} visibility changed: ${baselineEl.visible} -> ${currentEl.visible}`);
      }

      if (currentEl.className !== baselineEl.className) {
        differences.push(`${elementKey} className changed: "${baselineEl.className}" -> "${currentEl.className}"`);
      }
    }
  });

  return {
    componentName: current.componentName,
    themeContext: current.themeContext,
    differences,
    passed: differences.length === 0,
  };
};

/**
 * Mock theme context setup for testing
 */
export const setupThemeContext = (theme: 'light' | 'dark', viewport: 'desktop' | 'mobile' = 'desktop') => {
  // Mock document.documentElement for theme classes
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn().mockReturnValue(theme === 'light'),
  };

  Object.defineProperty(document, 'documentElement', {
    writable: true,
    value: {
      classList: mockClassList,
      style: { setProperty: vi.fn() },
    },
  });

  // Mock matchMedia for viewport
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: viewport === 'mobile' ? query.includes('max-width: 768px') : !query.includes('max-width: 768px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  return mockClassList;
};

/**
 * Validates BEM naming conventions
 */
export const validateBEMNaming = (className: string): boolean => {
  if (!className || typeof className !== 'string') return true;

  // Special case: reject patterns that look like they should be single BEM classes but have spaces
  // e.g., "header redesigned" should be "header-redesigned"
  if (className.includes(' ') && !className.includes('__') && !className.includes('--')) {
    const words = className.split(' ');
    if (words.length === 2 && words.every(word => /^[a-z]+$/.test(word))) {
      return false; // This looks like it should be hyphenated
    }
  }

  // Split by spaces to check each class
  const classes = className.split(' ').filter(cls => cls.length > 0);

  // If there are multiple classes, they should all be valid BEM or utility classes
  return classes.every(cls => {
    // Allow utility classes like 'sr-only' or data attributes
    if (cls.startsWith('sr-') || cls.startsWith('data-')) return true;

    // Check for invalid patterns first
    if (/[A-Z]/.test(cls)) return false; // PascalCase or camelCase
    if (cls.includes('_') && !cls.includes('__')) return false; // Snake case (but allow __)
    if (cls.includes('.')) return false; // Dot notation
    if (cls.includes('__') && cls.split('__').length > 2) return false; // Double nesting
    if (cls.includes('--') && cls.split('--').length > 2) return false; // Double modifier

    // Check for Tailwind patterns
    if (/^(text-|bg-|border-|hover:|focus:|active:|dark:|w-\d+|h-\d+|p-\d+|m-\d+)/.test(cls)) return false;

    // BEM pattern: block__element--modifier (with hyphens allowed in names)
    const bemPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$/;

    return bemPattern.test(cls);
  });
};

/**
 * Validates that no Tailwind classes are present
 */
export const validateNoTailwindClasses = (className: string): boolean => {
  if (!className || typeof className !== 'string') return true;

  const tailwindPatterns = [
    /\b(text-gray-|bg-gray-|border-gray-)/,  // Gray color utilities
    /\b(hover:|focus:|active:|dark:)/,       // State prefixes
    /\b(w-\d+|h-\d+|p-\d+|m-\d+)\b/,       // Sizing utilities
    /\b(flex|grid|block|inline)/,            // Display utilities
    /\b(rounded|shadow|border)\b/,           // Common utilities
  ];

  return !tailwindPatterns.some(pattern => pattern.test(className));
};

/**
 * Performance measurement utility for theme switching
 */
export const measureThemeSwitchPerformance = async (
  switchThemeFunction: () => void | Promise<void>
): Promise<number> => {
  const startTime = performance.now();

  await switchThemeFunction();

  const endTime = performance.now();
  return endTime - startTime;
};