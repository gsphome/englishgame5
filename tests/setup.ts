import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupFetchMock } from './helpers/handlers';
import { testSetupHelpers } from './helpers/css-testing-utils';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Setup fetch mock and CSS testing environment
beforeAll(() => {
  setupFetchMock();
  testSetupHelpers.setupCSSTestEnvironment();
});

// Clean up after each test case
afterEach(() => {
  cleanup();
  // Clean up CSS testing environment
  testSetupHelpers.cleanupCSSTestEnvironment();
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;
globalThis.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.ResizeObserver = mockResizeObserver;
globalThis.ResizeObserver = mockResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mocked-url'),
});

// Mock URL.revokeObjectURL
Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: React.createFactory() is deprecated'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  // Final cleanup of CSS testing environment
  testSetupHelpers.cleanupCSSTestEnvironment();
});

// CSS Custom Properties Support Mock
Object.defineProperty(CSS, 'supports', {
  writable: true,
  value: vi.fn().mockImplementation((property: string, value: string) => {
    // Mock support for CSS custom properties in test environment
    if (value && value.startsWith('var(--')) {
      return true;
    }
    // Mock support for common CSS properties
    return true;
  }),
});

// Mock getComputedStyle for CSS testing
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockImplementation((element: Element) => {
    // Return a mock computed style with design token support
    return {
      display: 'block',
      visibility: 'visible',
      opacity: '1',
      position: 'static',
      width: '100px',
      height: '100px',
      getPropertyValue: vi.fn((prop: string) => {
        // Mock design tokens for testing
        const mockTokens: Record<string, string> = {
          '--theme-text-primary': '#374151',
          '--theme-text-secondary': '#6b7280',
          '--theme-bg-primary': '#ffffff',
          '--theme-bg-secondary': '#fafafa',
          '--theme-border-primary': '#f3f4f6',
          '--text-primary': '#374151',
          '--bg-elevated': '#ffffff',
          '--border-soft': '#f3f4f6',
          '--primary-blue': '#3b82f6',
          '--primary-purple': '#8b5cf6',
          'display': 'block',
          'visibility': 'visible',
          'opacity': '1'
        };
        
        return mockTokens[prop] || '';
      })
    };
  })
});

// Mock requestAnimationFrame for CSS animation testing
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn().mockImplementation((callback: (time: number) => void) => {
    return setTimeout(() => callback(Date.now()), 16);
  })
});

// Mock cancelAnimationFrame
Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: vi.fn().mockImplementation((id: number) => {
    clearTimeout(id);
  })
});