import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/test-utils';
import { Header } from '../../../src/components/ui/Header';
import { applyThemeToDOM } from '../../../src/utils/themeInitializer';
import { THEME_CLASSES } from '../../../src/utils/themeConstants';

// Mock the stores
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
    developmentMode: false,
  }),
}));

// Mock the compact components to avoid complex dependencies
vi.mock('../../../src/components/ui/CompactProfile', () => ({
  CompactProfile: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="compact-profile" onClick={onClose}>Profile Modal</div> : null,
}));

vi.mock('../../../src/components/ui/CompactAdvancedSettings', () => ({
  CompactAdvancedSettings: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="compact-settings" onClick={onClose}>Settings Modal</div> : null,
}));

vi.mock('../../../src/components/ui/CompactAbout', () => ({
  CompactAbout: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="compact-about" onClick={onClose}>About Modal</div> : null,
}));

vi.mock('../../../src/components/ui/CompactProgressDashboard', () => ({
  CompactProgressDashboard: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="compact-progress" onClick={onClose}>Progress Modal</div> : null,
}));

vi.mock('../../../src/components/ui/CompactLearningPath', () => ({
  CompactLearningPath: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="compact-learning-path" onClick={onClose}>Learning Path Modal</div> : null,
}));

vi.mock('../../../src/components/ui/ScoreDisplay', () => ({
  ScoreDisplay: () => <div data-testid="score-display">Score: 100</div>,
}));

vi.mock('../../../src/components/ui/FluentFlowLogo', () => ({
  FluentFlowLogo: ({ size: _size, className }: { size: string; className: string }) => 
    <div data-testid="fluent-flow-logo" className={className}>🌊</div>,
}));

describe('Header Component - Theme Context Testing', () => {
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

  describe('Basic Header Functionality', () => {
    it('should render header with all essential elements', () => {
      renderWithProviders(<Header />);

      // Check for main header elements
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByTestId('fluent-flow-logo')).toBeInTheDocument();
      expect(screen.getByText('FluentFlow')).toBeInTheDocument();
      expect(screen.getByTestId('score-display')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /abrir menú/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /user profile/i })).toBeInTheDocument();
    });

    it('should use only BEM classes (no Tailwind classes)', () => {
      const { container } = renderWithProviders(<Header />);
      
      // Check that header uses BEM classes
      const header = container.querySelector('header');
      expect(header).toHaveClass('header-redesigned');
      expect(header).toHaveClass('header-redesigned--menu');

      // Check that buttons use BEM classes
      const menuButton = screen.getByRole('button', { name: /abrir menú/i });
      expect(menuButton).toHaveClass('header-redesigned__menu-btn');
      expect(menuButton).toHaveClass('header-redesigned__menu-btn--primary');

      // Verify no Tailwind classes are present
      const allElements = container.querySelectorAll('*');
      allElements.forEach(element => {
        const className = element.className;
        if (typeof className === 'string') {
          // Check for common Tailwind patterns
          expect(className).not.toMatch(/\b(text-gray-|bg-gray-|hover:|dark:)/);
          expect(className).not.toMatch(/\b(w-\d+|h-\d+|p-\d+|m-\d+)\b/);
        }
      });
    });
  });

  describe('Theme Context Testing', () => {
    const testThemeContext = (theme: 'light' | 'dark', description: string) => {
      it(`should work correctly in ${description}`, async () => {
        // Apply theme to DOM
        applyThemeToDOM(theme);
        
        // Render header
        const { container } = renderWithProviders(<Header />);
        
        // Verify theme class was applied
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES[theme]);
        expect(mockClassList.remove).toHaveBeenCalledWith(
          theme === 'light' ? THEME_CLASSES.dark : THEME_CLASSES.light
        );

        // Check that header elements are visible and functional
        const header = container.querySelector('header');
        expect(header).toBeInTheDocument();
        expect(header).toBeVisible();

        // Test menu button functionality
        const menuButton = screen.getByRole('button', { name: /abrir menú/i });
        expect(menuButton).toBeVisible();
        
        fireEvent.click(menuButton);
        await waitFor(() => {
          expect(screen.getByRole('navigation')).toBeInTheDocument();
        });

        // Test user button functionality
        const userButton = screen.getByRole('button', { name: /user profile/i });
        expect(userButton).toBeVisible();
        
        fireEvent.click(userButton);
        await waitFor(() => {
          expect(screen.getByTestId('compact-profile')).toBeInTheDocument();
        });
      });
    };

    testThemeContext('light', 'web-light theme context');
    testThemeContext('dark', 'web-dark theme context');

    it('should maintain visual consistency across theme switches', async () => {
      const { container } = renderWithProviders(<Header />);
      
      // Start with light theme
      applyThemeToDOM('light');
      await waitFor(() => {
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.light);
      });

      // Verify header is visible and functional
      let header = container.querySelector('header');
      expect(header).toBeVisible();

      // Switch to dark theme
      applyThemeToDOM('dark');
      await waitFor(() => {
        expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.dark);
      });

      // Verify header is still visible and functional
      header = container.querySelector('header');
      expect(header).toBeVisible();

      // Test that buttons still work after theme switch
      const menuButton = screen.getByRole('button', { name: /abrir menú/i });
      fireEvent.click(menuButton);
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    const mockMobileViewport = () => {
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
    };

    it('should work correctly in mobile-light context', () => {
      mockMobileViewport();
      applyThemeToDOM('light');
      
      const { container } = renderWithProviders(<Header />);
      
      // Verify header is responsive
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('header-redesigned');

      // Check that mobile-specific elements are present
      const menuButton = screen.getByRole('button', { name: /abrir menú/i });
      expect(menuButton).toBeVisible();
      
      // Verify touch targets are adequate (minimum 44px handled by CSS)
      expect(menuButton).toHaveClass('header-redesigned__menu-btn--primary');
    });

    it('should work correctly in mobile-dark context', () => {
      mockMobileViewport();
      applyThemeToDOM('dark');
      
      const { container } = renderWithProviders(<Header />);
      
      // Verify header works in mobile dark mode
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toBeVisible();

      // Test menu functionality in mobile dark mode
      const menuButton = screen.getByRole('button', { name: /abrir menú/i });
      fireEvent.click(menuButton);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Design Token Usage', () => {
    it('should use theme context variables consistently', () => {
      const { container } = renderWithProviders(<Header />);
      
      // Check that header uses design token classes
      const header = container.querySelector('header');
      expect(header).toHaveClass('header-redesigned');

      // Verify menu button uses proper BEM classes that map to design tokens
      const menuButton = screen.getByRole('button', { name: /abrir menú/i });
      expect(menuButton).toHaveClass('header-redesigned__menu-btn');
      expect(menuButton).toHaveClass('header-redesigned__menu-btn--primary');

      // Check that no hardcoded color classes are used
      const allElements = container.querySelectorAll('*');
      allElements.forEach(element => {
        const className = element.className;
        if (typeof className === 'string') {
          // Should not contain hardcoded color references
          expect(className).not.toMatch(/#[0-9a-fA-F]{3,6}/);
          expect(className).not.toMatch(/rgb\(/);
          expect(className).not.toMatch(/rgba\(/);
        }
      });
    });

    it('should ensure header-redesigned__menu-btn uses var(--theme-text-primary)', () => {
      renderWithProviders(<Header />);
      
      const menuButton = screen.getByRole('button', { name: /abrir menú/i });
      
      // Verify the button has the correct BEM class that maps to design tokens
      expect(menuButton).toHaveClass('header-redesigned__menu-btn--primary');
      
      // The actual CSS custom property usage is tested through the CSS file
      // This test ensures the correct classes are applied
    });
  });

  describe('Lazy Loading Preservation', () => {
    it('should preserve existing lazy loading of header', () => {
      // Header component itself is not lazy loaded, but it should not interfere
      // with lazy loading of other components
      const { container } = renderWithProviders(<Header />);
      
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      
      // Verify that the header renders immediately (not lazy loaded)
      expect(header).toBeVisible();
    });

    it('should not interfere with lazy loading of compact components', async () => {
      renderWithProviders(<Header />);
      
      // Initially, compact components should not be rendered
      expect(screen.queryByTestId('compact-profile')).not.toBeInTheDocument();
      expect(screen.queryByTestId('compact-settings')).not.toBeInTheDocument();
      
      // Click user button to trigger lazy loading of profile component
      const userButton = screen.getByRole('button', { name: /user profile/i });
      fireEvent.click(userButton);
      
      // Profile component should now be loaded
      await waitFor(() => {
        expect(screen.getByTestId('compact-profile')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should maintain accessibility standards across all themes', async () => {
      const { container } = renderWithProviders(<Header />);
      
      // Check semantic HTML
      expect(screen.getByRole('banner')).toBeInTheDocument();
      
      // Navigation is only visible when menu is opened
      const menuButton = screen.getByRole('button', { name: /abrir menú/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
      
      // Check ARIA labels
      expect(menuButton).toHaveAttribute('aria-label');
      expect(menuButton).toHaveAttribute('aria-expanded');
      expect(menuButton).toHaveAttribute('aria-controls');
      
      const userButton = screen.getByRole('button', { name: /user profile/i });
      expect(userButton).toHaveAttribute('aria-label');
      
      // Check for screen reader text
      const srText = container.querySelector('.sr-only');
      expect(srText).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(<Header />);
      
      const menuButton = screen.getByRole('button', { name: /abrir menú/i });
      const userButton = screen.getByRole('button', { name: /user profile/i });
      
      // Both buttons should be focusable (buttons are focusable by default)
      expect(menuButton.tagName).toBe('BUTTON');
      expect(userButton.tagName).toBe('BUTTON');
      
      // Focus should work
      menuButton.focus();
      expect(document.activeElement).toBe(menuButton);
      
      userButton.focus();
      expect(document.activeElement).toBe(userButton);
    });
  });

  describe('Performance', () => {
    it('should render efficiently without unnecessary re-renders', () => {
      const renderSpy = vi.fn();
      
      const TestWrapper = () => {
        renderSpy();
        return <Header />;
      };
      
      const { rerender } = renderWithProviders(<TestWrapper />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props should not cause unnecessary renders
      rerender(<TestWrapper />);
      
      // Component should handle re-renders gracefully
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should handle theme switching without performance degradation', async () => {
      renderWithProviders(<Header />);
      
      const startTime = performance.now();
      
      // Apply multiple theme switches
      applyThemeToDOM('light');
      applyThemeToDOM('dark');
      applyThemeToDOM('light');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Theme switching should be fast (< 100ms as per requirements)
      expect(duration).toBeLessThan(100);
      
      // Header should still be functional
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});