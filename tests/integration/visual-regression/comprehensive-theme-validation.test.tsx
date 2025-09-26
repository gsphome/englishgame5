import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/test-utils';
import { applyThemeToDOM } from '../../../src/utils/themeInitializer';
import { THEME_CLASSES } from '../../../src/utils/themeConstants';
import { validateBEMNaming, validateNoTailwindClasses } from '../../helpers/visual-regression-utils';

// Import all refactored components
import { Header } from '../../../src/components/ui/Header';
import { CompactAdvancedSettings } from '../../../src/components/ui/CompactAdvancedSettings';
import FlashcardComponent from '../../../src/components/learning/FlashcardComponent';
import QuizComponent from '../../../src/components/learning/QuizComponent';
import CompletionComponent from '../../../src/components/learning/CompletionComponent';
import { LogViewer } from '../../../src/components/dev/LogViewer';
import { AppRouter } from '../../../src/components/layout/AppRouter';
import { CompactProgressDashboard } from '../../../src/components/ui/CompactProgressDashboard';
import { FluentFlowLogo } from '../../../src/components/ui/FluentFlowLogo';
import { ErrorFallback } from '../../../src/components/common/ErrorFallback';

// Mock stores and dependencies
vi.mock('../../../src/stores/appStore', () => ({
  useAppStore: () => ({
    setCurrentView: vi.fn(),
    currentView: 'menu',
    moduleId: 'test-module',
  }),
}));

vi.mock('../../../src/stores/userStore', () => ({
  useUserStore: () => ({
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
    },
  }),
}));

vi.mock('../../../src/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    theme: 'light',
    language: 'en',
    level: 'all',
    developmentMode: false,
    categories: ['Vocabulary', 'Grammar'],
    gameSettings: {
      flashcardMode: { wordCount: 10 },
      quizMode: { questionCount: 10 },
      completionMode: { itemCount: 10 },
      sortingMode: { wordCount: 12 },
      matchingMode: { wordCount: 6 },
    },
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
    setLevel: vi.fn(),
    setDevelopmentMode: vi.fn(),
    setCategories: vi.fn(),
    setGameSetting: vi.fn(),
  }),
}));

vi.mock('../../../src/stores/progressStore', () => ({
  useProgressStore: () => ({
    getModuleProgress: vi.fn().mockReturnValue({
      totalScore: 1500,
      averageScore: 85,
      totalSessions: 12,
      totalTimeSpent: 3600,
      weeklyProgress: [],
    }),
  }),
}));

vi.mock('../../../src/hooks/useModuleData', () => ({
  useModuleData: () => ({
    moduleData: {
      id: 'test-module',
      name: 'Test Module',
      type: 'flashcard',
      level: 'A1',
      category: 'Vocabulary',
      data: [
        { id: '1', front: 'Hello', back: 'Hola', category: 'Greetings' },
        { id: '2', front: 'Goodbye', back: 'Adiós', category: 'Greetings' },
      ],
    },
    loading: false,
    error: null,
  }),
}));

// Mock compact components to avoid complex dependencies
vi.mock('../../../src/components/ui/CompactProfile', () => ({
  CompactProfile: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? React.createElement('div', { 'data-testid': 'compact-profile', onClick: onClose }, 'Profile Modal') : null,
}));

vi.mock('../../../src/components/ui/CompactAbout', () => ({
  CompactAbout: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? React.createElement('div', { 'data-testid': 'compact-about', onClick: onClose }, 'About Modal') : null,
}));

vi.mock('../../../src/components/ui/CompactLearningPath', () => ({
  CompactLearningPath: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? React.createElement('div', { 'data-testid': 'compact-learning-path', onClick: onClose }, 'Learning Path Modal') : null,
}));

vi.mock('../../../src/components/ui/ScoreDisplay', () => ({
  ScoreDisplay: () => React.createElement('div', { 'data-testid': 'score-display' }, 'Score: 100'),
}));

describe('Comprehensive Theme Context Validation - All Refactored Components', () => {
  let mockClassList: any;
  let mockSetProperty: any;

  beforeEach(() => {
    // Mock DOM methods for theme testing
    mockClassList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    };

    mockSetProperty = vi.fn();

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
      value: vi.fn().mockReturnValue({
        setAttribute: vi.fn(),
      }),
    });

    Object.defineProperty(document, 'querySelectorAll', {
      writable: true,
      value: vi.fn().mockReturnValue([]),
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      cb(0);
      return 0;
    });

    // Mock window.matchMedia for responsive testing
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to test component in all 4 theme contexts
  const testComponentInAllThemeContexts = (
    componentName: string,
    renderComponent: () => any,
    validateComponent: (container: HTMLElement, theme: string, viewport: string) => void
  ) => {
    const contexts = [
      { theme: 'light', viewport: 'desktop', description: 'web-light' },
      { theme: 'dark', viewport: 'desktop', description: 'web-dark' },
      { theme: 'light', viewport: 'mobile', description: 'mobile-light' },
      { theme: 'dark', viewport: 'mobile', description: 'mobile-dark' },
    ] as const;

    contexts.forEach(({ theme, viewport, description }) => {
      it(`${componentName} should render correctly in ${description} theme context`, async () => {
        // Setup viewport
        if (viewport === 'mobile') {
          Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
              matches: query.includes('max-width: 768px'),
              media: query,
              onchange: null,
              addListener: vi.fn(),
              removeListener: vi.fn(),
              addEventListener: vi.fn(),
              removeEventListener: vi.fn(),
              dispatchEvent: vi.fn(),
            })),
          });
        }

        // Apply theme to DOM
        applyThemeToDOM(theme);
        
        // Render component
        const { container } = renderComponent();
        
        // Verify theme class was applied
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES[theme]);

        // Validate BEM naming and no Tailwind classes
        const allElements = container.querySelectorAll('*');
        allElements.forEach(element => {
          const className = element.className;
          if (typeof className === 'string' && className.length > 0) {
            expect(validateBEMNaming(className)).toBe(true);
            expect(validateNoTailwindClasses(className)).toBe(true);
          }
        });

        // Component-specific validation
        validateComponent(container, theme, viewport);
      });
    });
  };

  describe('Header Component', () => {
    testComponentInAllThemeContexts(
      'Header',
      () => renderWithProviders(<Header />),
      (container, _theme, _viewport) => {
        const header = container.querySelector('header');
        expect(header).toBeInTheDocument();
        expect(header).toHaveClass('header-redesigned');

        const menuButton = container.querySelector('.header-redesigned__menu-btn');
        expect(menuButton).toBeInTheDocument();
        expect(menuButton).toHaveClass('header-redesigned__menu-btn--primary');

        // Test functionality
        if (menuButton) {
          fireEvent.click(menuButton);
        }
      }
    );
  });

  describe('CompactAdvancedSettings Component', () => {
    testComponentInAllThemeContexts(
      'CompactAdvancedSettings',
      () => {
        const mockOnClose = vi.fn();
        return renderWithProviders(
          <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
        );
      },
      (container, _theme, _viewport) => {
        const modal = container.querySelector('.compact-settings');
        expect(modal).toBeInTheDocument();

        const closeButton = container.querySelector('.compact-settings__close-btn');
        expect(closeButton).toBeInTheDocument();

        const title = container.querySelector('.compact-settings__title');
        expect(title).toBeInTheDocument();

        // Verify modal structure
        const modalContainer = container.querySelector('.compact-settings__container');
        expect(modalContainer).toBeInTheDocument();
      }
    );
  });

  describe('FlashcardComponent', () => {
    testComponentInAllThemeContexts(
      'FlashcardComponent',
      () => renderWithProviders(<FlashcardComponent />),
      (container, _theme, _viewport) => {
        const flashcardContainer = container.querySelector('.flashcard-component__container');
        expect(flashcardContainer).toBeInTheDocument();

        const header = container.querySelector('.flashcard-component__header');
        expect(header).toBeInTheDocument();

        const title = container.querySelector('.flashcard-component__title');
        expect(title).toBeInTheDocument();

        const counter = container.querySelector('.flashcard-component__counter');
        expect(counter).toBeInTheDocument();
      }
    );
  });

  describe('QuizComponent', () => {
    testComponentInAllThemeContexts(
      'QuizComponent',
      () => renderWithProviders(<QuizComponent />),
      (container, _theme, _viewport) => {
        // Quiz component should render with BEM classes
        const quizElements = container.querySelectorAll('[class*="quiz-component"]');
        expect(quizElements.length).toBeGreaterThan(0);
      }
    );
  });

  describe('CompletionComponent', () => {
    testComponentInAllThemeContexts(
      'CompletionComponent',
      () => renderWithProviders(<CompletionComponent />),
      (container, _theme, _viewport) => {
        // Completion component should render with BEM classes
        const completionElements = container.querySelectorAll('[class*="completion-component"]');
        expect(completionElements.length).toBeGreaterThan(0);
      }
    );
  });

  describe('LogViewer Component', () => {
    testComponentInAllThemeContexts(
      'LogViewer',
      () => {
        const mockOnClose = vi.fn();
        return renderWithProviders(
          <LogViewer isOpen={true} onClose={mockOnClose} />
        );
      },
      (container, _theme, _viewport) => {
        const logViewer = container.querySelector('.log-viewer');
        expect(logViewer).toBeInTheDocument();

        const logViewerContainer = container.querySelector('.log-viewer__container');
        expect(logViewerContainer).toBeInTheDocument();

        const header = container.querySelector('.log-viewer__header');
        expect(header).toBeInTheDocument();

        const title = container.querySelector('.log-viewer__title');
        expect(title).toBeInTheDocument();
      }
    );
  });

  describe('AppRouter Component', () => {
    testComponentInAllThemeContexts(
      'AppRouter',
      () => renderWithProviders(<AppRouter />),
      (container, _theme, _viewport) => {
        // AppRouter should render with BEM classes for error states
        const appRouterElements = container.querySelectorAll('[class*="app-router"]');
        expect(appRouterElements.length).toBeGreaterThan(0);
      }
    );
  });

  describe('CompactProgressDashboard Component', () => {
    testComponentInAllThemeContexts(
      'CompactProgressDashboard',
      () => {
        const mockOnClose = vi.fn();
        return renderWithProviders(
          <CompactProgressDashboard isOpen={true} onClose={mockOnClose} />
        );
      },
      (container, _theme, _viewport) => {
        const dashboard = container.querySelector('.compact-dashboard');
        expect(dashboard).toBeInTheDocument();

        const dashboardContainer = container.querySelector('.compact-dashboard__container');
        expect(dashboardContainer).toBeInTheDocument();

        const header = container.querySelector('.compact-dashboard__header');
        expect(header).toBeInTheDocument();

        const title = container.querySelector('.compact-dashboard__title');
        expect(title).toBeInTheDocument();

        const stats = container.querySelector('.compact-dashboard__stats');
        expect(stats).toBeInTheDocument();
      }
    );
  });

  describe('FluentFlowLogo Component', () => {
    testComponentInAllThemeContexts(
      'FluentFlowLogo',
      () => renderWithProviders(<FluentFlowLogo size="medium" className="test-logo" />),
      (container, _theme, _viewport) => {
        const logo = container.querySelector('[data-testid="fluent-flow-logo"]');
        expect(logo).toBeInTheDocument();
      }
    );
  });

  describe('ErrorFallback Component', () => {
    testComponentInAllThemeContexts(
      'ErrorFallback',
      () => {
        const mockError = new Error('Test error');
        const mockRetry = vi.fn();
        return renderWithProviders(
          <ErrorFallback error={mockError} retry={mockRetry} />
        );
      },
      (container, _theme, _viewport) => {
        const errorFallback = container.querySelector('.error-fallback');
        expect(errorFallback).toBeInTheDocument();

        const card = container.querySelector('.error-fallback__card');
        expect(card).toBeInTheDocument();

        const title = container.querySelector('.error-fallback__title');
        expect(title).toBeInTheDocument();

        const message = container.querySelector('.error-fallback__message');
        expect(message).toBeInTheDocument();
      }
    );
  });

  describe('Cross-Component Theme Consistency', () => {
    it('should maintain consistent design token usage across all components', async () => {
      applyThemeToDOM('light');
      
      const mockOnClose = vi.fn();
      const mockError = new Error('Test error');
      const mockRetry = vi.fn();

      // Render multiple components together
      const { container } = renderWithProviders(
        <div>
          <Header />
          <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
          <FlashcardComponent />
          <LogViewer isOpen={true} onClose={mockOnClose} />
          <CompactProgressDashboard isOpen={true} onClose={mockOnClose} />
          <FluentFlowLogo size="medium" className="test-logo" />
          <ErrorFallback error={mockError} retry={mockRetry} />
        </div>
      );

      // All components should follow BEM conventions
      const allElements = container.querySelectorAll('*');
      allElements.forEach(element => {
        const className = element.className;
        if (typeof className === 'string' && className.length > 0) {
          expect(validateBEMNaming(className)).toBe(true);
          expect(validateNoTailwindClasses(className)).toBe(true);
        }
      });

      // Verify specific component blocks exist
      expect(container.querySelector('.header-redesigned')).toBeInTheDocument();
      expect(container.querySelector('.compact-settings')).toBeInTheDocument();
      expect(container.querySelector('.flashcard-component__container')).toBeInTheDocument();
      expect(container.querySelector('.log-viewer')).toBeInTheDocument();
      expect(container.querySelector('.compact-dashboard')).toBeInTheDocument();
      expect(container.querySelector('.error-fallback')).toBeInTheDocument();
    });

    it('should handle rapid theme switching across all components', async () => {
      const mockOnClose = vi.fn();
      const { container } = renderWithProviders(
        <div>
          <Header />
          <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
          <FlashcardComponent />
        </div>
      );

      // Rapid theme switching
      const themes: ('light' | 'dark')[] = ['light', 'dark', 'light', 'dark'];
      
      for (const theme of themes) {
        applyThemeToDOM(theme);
        await waitFor(() => {
          expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES[theme]);
        });

        // All components should remain functional
        const header = container.querySelector('.header-redesigned');
        const settings = container.querySelector('.compact-settings');
        const flashcard = container.querySelector('.flashcard-component__container');
        
        expect(header).toBeInTheDocument();
        expect(settings).toBeInTheDocument();
        expect(flashcard).toBeInTheDocument();
      }
    });
  });

  describe('Performance Impact Validation', () => {
    it('should render all components efficiently in all theme contexts', async () => {
      const themes: ('light' | 'dark')[] = ['light', 'dark'];
      const viewports = ['desktop', 'mobile'];
      
      for (const theme of themes) {
        for (const viewport of viewports) {
          const startTime = performance.now();
          
          // Setup viewport
          if (viewport === 'mobile') {
            Object.defineProperty(window, 'matchMedia', {
              writable: true,
              value: vi.fn().mockImplementation(query => ({
                matches: query.includes('max-width: 768px'),
                media: query,
              })),
            });
          }

          applyThemeToDOM(theme);
          
          const mockOnClose = vi.fn();
          renderWithProviders(
            <div>
              <Header />
              <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
              <FlashcardComponent />
              <LogViewer isOpen={true} onClose={mockOnClose} />
              <CompactProgressDashboard isOpen={true} onClose={mockOnClose} />
            </div>
          );
          
          const endTime = performance.now();
          const renderTime = endTime - startTime;
          
          // Rendering should be fast (< 100ms as per requirements)
          expect(renderTime).toBeLessThan(100);
        }
      }
    });
  });

  describe('Accessibility Compliance Across Themes', () => {
    it('should maintain accessibility standards in all theme contexts', () => {
      const themes: ('light' | 'dark')[] = ['light', 'dark'];
      
      themes.forEach(theme => {
        applyThemeToDOM(theme);
        
        const mockOnClose = vi.fn();
        const { container } = renderWithProviders(
          <div>
            <Header />
            <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
          </div>
        );

        // Check for proper ARIA labels and roles
        const buttons = container.querySelectorAll('button');
        buttons.forEach(button => {
          // Buttons should have accessible names or labels
          const hasAccessibleName = 
            button.getAttribute('aria-label') ||
            button.getAttribute('title') ||
            button.textContent?.trim();
          expect(hasAccessibleName).toBeTruthy();
        });

        // Check for proper heading hierarchy
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        expect(headings.length).toBeGreaterThan(0);
      });
    });
  });
});