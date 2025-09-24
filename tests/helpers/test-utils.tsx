import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, beforeEach, afterEach, expect } from 'vitest';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import type { LearningModule, User } from '../../src/types';
import type { ToastData } from '../../src/stores/toastStore';
import { cssTestingUtils } from './css-testing-utils';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0, // Updated from cacheTime
    },
    mutations: {
      retry: false,
    },
  },
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  withErrorBoundary?: boolean;
  theme?: 'light' | 'dark';
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    withErrorBoundary = true,
    theme = 'light',
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // Apply theme context before rendering
  cssTestingUtils.theme.applyTheme(theme);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const content = (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    return withErrorBoundary ? (
      <ErrorBoundary>{content}</ErrorBoundary>
    ) : content;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Legacy wrapper for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { customRender as render };

// Test utilities for common operations
export const testUtils = {
  // Create mock learning module
  createMockModule: (overrides: Partial<LearningModule> = {}): LearningModule => ({
    id: 'test-module',
    name: 'Test Module',
    description: 'A test module for testing',
    learningMode: 'flashcard',
    level: ['b1'],
    category: 'Vocabulary',
    unit: 3,
    prerequisites: [],
    tags: ['test'],
    data: [
      {
        id: '1',
        en: 'hello',
        es: 'hola',
        ipa: '/həˈloʊ/',
        example: 'Hello, how are you?',
        example_es: 'Hola, ¿cómo estás?'
      }
    ],
    estimatedTime: 5,
    difficulty: 3,
    ...overrides,
  }),

  // Create mock user
  createMockUser: (overrides: Partial<User> = {}): User => ({
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    level: 'intermediate',
    preferences: {
      language: 'en',
      dailyGoal: 10,
      categories: ['Vocabulary'],
      difficulty: 3,
      notifications: true,
    },
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  // Create mock toast data
  createMockToast: (overrides: Partial<ToastData> = {}): ToastData => ({
    id: 'test-toast-' + Date.now(),
    type: 'success',
    title: 'Test Toast',
    message: 'Test message',
    duration: 2000,
    ...overrides,
  }),

  // Wait for toast to appear
  waitForToast: async (text: string, timeout = 3000) => {
    return waitFor(() => {
      expect(screen.getByText(text)).toBeInTheDocument();
    }, { timeout });
  },

  // Wait for toast to disappear
  waitForToastToDisappear: async (text: string, timeout = 5000) => {
    return waitFor(() => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }, { timeout });
  },

  // CSS testing utilities
  css: cssTestingUtils,

  // Render component in all theme contexts
  renderInAllThemes: async (
    component: ReactElement,
    testFn: (container: HTMLElement, theme: 'light' | 'dark') => void | Promise<void>
  ) => {
    const themes: ('light' | 'dark')[] = ['light', 'dark'];
    
    for (const theme of themes) {
      const { container } = renderWithProviders(component, { theme });
      await testFn(container, theme);
    }
  },

  // Validate BEM structure in rendered component
  validateBEMStructure: (container: HTMLElement, componentName: string) => {
    const validation = cssTestingUtils.bem.validateContainerBEM(container);
    expect(validation.valid).toBe(true);
    
    if (!validation.valid) {
      console.error('BEM violations found:', validation.violations);
    }
    
    return validation;
  },

  // Check for Tailwind classes (should not exist)
  checkForTailwindClasses: (container: HTMLElement) => {
    const tailwindClasses = cssTestingUtils.bem.detectTailwindClasses(container);
    expect(tailwindClasses).toHaveLength(0);
    
    if (tailwindClasses.length > 0) {
      console.error('Tailwind classes found:', tailwindClasses);
    }
    
    return tailwindClasses;
  },

  // Test theme switching performance
  testThemeSwitchingPerformance: async (targetTime: number = 100) => {
    const duration = await cssTestingUtils.performance.measureThemeSwitch('light', 'dark');
    expect(duration).toBeLessThan(targetTime);
    return duration;
  },
};

export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return { ...store };
    }
  };
};

// Custom matchers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveAccessibleName = (element: HTMLElement, name: string) => {
  expect(element).toHaveAccessibleName(name);
};

export const expectElementToHaveAriaLabel = (element: HTMLElement, label: string) => {
  expect(element).toHaveAttribute('aria-label', label);
};

// Mock console methods for testing
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });
  
  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};

// Re-export everything from testing-library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';