import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/test-utils';
import { Header } from '../../../src/components/ui/Header';
import { CompactAdvancedSettings } from '../../../src/components/ui/CompactAdvancedSettings';
import { applyThemeToDOM } from '../../../src/utils/themeInitializer';
import { THEME_CLASSES } from '../../../src/utils/themeConstants';

// Mock the stores for consistent testing
vi.mock('../../../src/stores/appStore', () => ({
  useAppStore: () => ({
    setCurrentView: vi.fn(),
    currentView: 'menu',
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

// Mock compact components to avoid complex dependencies
vi.mock('../../../src/components/ui/CompactProfile', () => ({
  CompactProfile: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? React.createElement('div', { 'data-testid': 'compact-profile', onClick: onClose }, 'Profile Modal') : null,
}));

vi.mock('../../../src/components/ui/CompactAbout', () => ({
  CompactAbout: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? React.createElement('div', { 'data-testid': 'compact-about', onClick: onClose }, 'About Modal') : null,
}));

vi.mock('../../../src/components/ui/CompactProgressDashboard', () => ({
  CompactProgressDashboard: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? React.createElement('div', { 'data-testid': 'compact-progress', onClick: onClose }, 'Progress Modal') : null,
}));

vi.mock('../../../src/components/ui/CompactLearningPath', () => ({
  CompactLearningPath: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? React.createElement('div', { 'data-testid': 'compact-learning-path', onClick: onClose }, 'Learning Path Modal') : null,
}));

vi.mock('../../../src/components/ui/ScoreDisplay', () => ({
  ScoreDisplay: () => React.createElement('div', { 'data-testid': 'score-display' }, 'Score: 100'),
}));

vi.mock('../../../src/components/ui/FluentFlowLogo', () => ({
  FluentFlowLogo: ({ size, className }: { size: string; className: string }) => 
    React.createElement('div', { 'data-testid': 'fluent-flow-logo', className: className }, '🌊'),
}));

describe('Visual Regression Tests - Theme Context Validation', () => {
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

  describe('Header Component - All 4 Theme Contexts', () => {
    const testHeaderInThemeContext = (
      theme: 'light' | 'dark',
      viewport: 'desktop' | 'mobile',
      description: string
    ) => {
      it(`should render correctly in ${description}`, async () => {
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
        
        // Render header
        const { container } = renderWithProviders(<Header />);
        
        // Verify theme class was applied
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES[theme]);
        expect(mockClassList.remove).toHaveBeenCalledWith(
          theme === 'light' ? THEME_CLASSES.dark : THEME_CLASSES.light
        );

        // Visual consistency checks
        const header = container.querySelector('header');
        expect(header).toBeInTheDocument();
        expect(header).toHaveClass('header-redesigned');
        
        // Check visibility without relying on getComputedStyle
        expect(header?.style.display).not.toBe('none');

        // Check BEM classes are used (no Tailwind)
        const menuButton = screen.getByRole('button', { name: /abrir menú/i });
        expect(menuButton).toHaveClass('header-redesigned__menu-btn');
        expect(menuButton).toHaveClass('header-redesigned__menu-btn--primary');

        // Verify no Tailwind classes
        const allElements = container.querySelectorAll('*');
        allElements.forEach(element => {
          const className = element.className;
          if (typeof className === 'string') {
            expect(className).not.toMatch(/\b(text-gray-|bg-gray-|hover:|dark:)/);
            expect(className).not.toMatch(/\b(w-\d+|h-\d+|p-\d+|m-\d+)\b/);
          }
        });

        // Test functionality
        fireEvent.click(menuButton);
        await waitFor(() => {
          expect(screen.getByRole('navigation')).toBeInTheDocument();
        });

        // Test user button
        const userButton = screen.getByRole('button', { name: /user profile/i });
        expect(userButton).toBeVisible();
        fireEvent.click(userButton);
        await waitFor(() => {
          expect(screen.getByTestId('compact-profile')).toBeInTheDocument();
        });

        // Capture visual state for baseline comparison
        const visualState = {
          headerVisible: header?.style.display !== 'none',
          menuButtonVisible: menuButton?.style.display !== 'none',
          userButtonVisible: userButton?.style.display !== 'none',
          themeClass: theme,
          viewport: viewport,
          bemClasses: {
            header: header?.className,
            menuButton: menuButton?.className,
            userButton: userButton?.className,
          }
        };

        // Store baseline for comparison (in real implementation, this would be saved to file)
        expect(visualState).toMatchObject({
          headerVisible: true,
          menuButtonVisible: true,
          userButtonVisible: true,
          themeClass: theme,
          viewport: viewport,
        });
      });
    };

    // Test all 4 theme contexts
    testHeaderInThemeContext('light', 'desktop', 'web-light theme context');
    testHeaderInThemeContext('dark', 'desktop', 'web-dark theme context');
    testHeaderInThemeContext('light', 'mobile', 'mobile-light theme context');
    testHeaderInThemeContext('dark', 'mobile', 'mobile-dark theme context');

    it('should maintain visual consistency across theme switches', async () => {
      const { container } = renderWithProviders(<Header />);
      
      // Capture initial state
      applyThemeToDOM('light');
      await waitFor(() => {
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.light);
      });

      const header = container.querySelector('header');
      const initialState = {
        visible: header?.style.display !== 'none',
        className: header?.className,
      };

      // Switch theme and verify consistency
      applyThemeToDOM('dark');
      await waitFor(() => {
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.dark);
      });

      const afterSwitchState = {
        visible: header?.style.display !== 'none',
        className: header?.className,
      };

      // Visual consistency should be maintained
      expect(afterSwitchState.visible).toBe(initialState.visible);
      expect(afterSwitchState.className).toBe(initialState.className);
    });
  });

  describe('CompactAdvancedSettings Component - All 4 Theme Contexts', () => {
    const testCompactSettingsInThemeContext = (
      theme: 'light' | 'dark',
      viewport: 'desktop' | 'mobile',
      description: string
    ) => {
      it(`should render correctly in ${description}`, async () => {
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
        const mockOnClose = vi.fn();
        const { container } = renderWithProviders(
          <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
        );
        
        // Verify theme class was applied
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES[theme]);

        // Visual consistency checks
        const modal = container.querySelector('.compact-settings');
        expect(modal).toBeInTheDocument();
        
        // Check visibility without relying on getComputedStyle
        expect(modal?.style.display).not.toBe('none');

        const modalContainer = container.querySelector('.compact-settings__container');
        expect(modalContainer).toBeInTheDocument();

        // Check BEM classes are used (no Tailwind)
        const closeButton = container.querySelector('.compact-settings__close-btn');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveClass('compact-settings__close-btn');

        const title = container.querySelector('.compact-settings__title');
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('compact-settings__title');

        // Verify no Tailwind classes in the component
        const allElements = container.querySelectorAll('*');
        allElements.forEach(element => {
          const className = element.className;
          if (typeof className === 'string') {
            expect(className).not.toMatch(/\b(text-gray-|bg-gray-|hover:|dark:)/);
            expect(className).not.toMatch(/\b(w-\d+|h-\d+|p-\d+|m-\d+)\b/);
          }
        });

        // Test functionality
        expect(closeButton?.style.display).not.toBe('none');
        fireEvent.click(closeButton as Element);
        expect(mockOnClose).toHaveBeenCalled();

        // Test tab navigation
        const generalTab = screen.getByText(/general/i);
        const gamesTab = screen.getByText(/juegos/i);
        expect(generalTab).toBeInTheDocument();
        expect(gamesTab).toBeInTheDocument();

        fireEvent.click(gamesTab);
        await waitFor(() => {
          expect(screen.getByText(/flashcards/i)).toBeInTheDocument();
        });

        // Capture visual state for baseline comparison
        const visualState = {
          modalVisible: modal?.style.display !== 'none',
          closeButtonVisible: closeButton?.style.display !== 'none',
          titleVisible: title?.style.display !== 'none',
          themeClass: theme,
          viewport: viewport,
          bemClasses: {
            modal: modal?.className,
            container: modalContainer?.className,
            closeButton: closeButton?.className,
            title: title?.className,
          }
        };

        // Store baseline for comparison
        expect(visualState).toMatchObject({
          modalVisible: true,
          closeButtonVisible: true,
          titleVisible: true,
          themeClass: theme,
          viewport: viewport,
        });
      });
    };

    // Test all 4 theme contexts
    testCompactSettingsInThemeContext('light', 'desktop', 'web-light theme context');
    testCompactSettingsInThemeContext('dark', 'desktop', 'web-dark theme context');
    testCompactSettingsInThemeContext('light', 'mobile', 'mobile-light theme context');
    testCompactSettingsInThemeContext('dark', 'mobile', 'mobile-dark theme context');

    it('should maintain visual consistency when closed', () => {
      const mockOnClose = vi.fn();
      const { container } = renderWithProviders(
        <CompactAdvancedSettings isOpen={false} onClose={mockOnClose} />
      );
      
      // When closed, component should not render
      const modal = container.querySelector('.compact-settings');
      expect(modal).not.toBeInTheDocument();
    });

    it('should handle theme switching while open', async () => {
      const mockOnClose = vi.fn();
      const { container } = renderWithProviders(
        <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
      );
      
      // Start with light theme
      applyThemeToDOM('light');
      await waitFor(() => {
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.light);
      });

      const modal = container.querySelector('.compact-settings');
      const initialState = {
        visible: modal?.style.display !== 'none',
        className: modal?.className,
      };

      // Switch to dark theme
      applyThemeToDOM('dark');
      await waitFor(() => {
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.dark);
      });

      const afterSwitchState = {
        visible: modal?.style.display !== 'none',
        className: modal?.className,
      };

      // Visual consistency should be maintained
      expect(afterSwitchState.visible).toBe(initialState.visible);
      expect(afterSwitchState.className).toBe(initialState.className);
    });
  });

  describe('Cross-Component Theme Consistency', () => {
    it('should maintain consistent design token usage across components', async () => {
      // Render both components in the same theme context
      applyThemeToDOM('light');
      
      const mockOnClose = vi.fn();
      const { container: headerContainer } = renderWithProviders(<Header />);
      const { container: settingsContainer } = renderWithProviders(
        <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
      );

      // Both components should use consistent BEM naming
      const header = headerContainer.querySelector('.header-redesigned');
      const settings = settingsContainer.querySelector('.compact-settings');
      
      expect(header).toBeInTheDocument();
      expect(settings).toBeInTheDocument();

      // Both should follow BEM conventions
      expect(header?.className).toMatch(/^[a-z-]+(__[a-z-]+)?(--[a-z-]+)?/);
      expect(settings?.className).toMatch(/^[a-z-]+(__[a-z-]+)?(--[a-z-]+)?/);

      // Neither should have Tailwind classes
      const allHeaderElements = headerContainer.querySelectorAll('*');
      const allSettingsElements = settingsContainer.querySelectorAll('*');
      
      [...allHeaderElements, ...allSettingsElements].forEach(element => {
        const className = element.className;
        if (typeof className === 'string') {
          expect(className).not.toMatch(/\b(text-gray-|bg-gray-|hover:|dark:)/);
        }
      });
    });

    it('should handle rapid theme switching without visual artifacts', async () => {
      const mockOnClose = vi.fn();
      const { container } = renderWithProviders(
        <div>
          <Header />
          <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
        </div>
      );

      // Rapid theme switching
      const themes: ('light' | 'dark')[] = ['light', 'dark', 'light', 'dark'];
      
      for (const theme of themes) {
        applyThemeToDOM(theme);
        await waitFor(() => {
          expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES[theme]);
        });

        // Both components should remain visible and functional
        const header = container.querySelector('.header-redesigned');
        const settings = container.querySelector('.compact-settings');
        
        expect(header?.style.display).not.toBe('none');
        expect(settings?.style.display).not.toBe('none');
      }
    });
  });

  describe('Performance Impact Validation', () => {
    it('should render components efficiently in all theme contexts', async () => {
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
});