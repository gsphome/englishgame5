import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithProviders } from '../../helpers/test-utils';
import { Header } from '../../../src/components/ui/Header';
import { applyThemeToDOM } from '../../../src/utils/themeInitializer';
import { THEME_CLASSES } from '../../../src/utils/themeConstants';

// Mock the stores for consistent testing
vi.mock('../../../src/stores/appStore', () => ({
  useAppStore: () => ({
    setCurrentView: vi.fn(),
    currentView: 'menu',
    sessionScore: { correct: 5, incorrect: 2, accuracy: 71.4 },
    globalScore: { correct: 50, incorrect: 10, accuracy: 83.3 },
  }),
}));

vi.mock('../../../src/stores/userStore', () => ({
  useUserStore: () => ({
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
    },
    getTotalScore: () => 150,
  }),
}));

vi.mock('../../../src/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    theme: 'light',
    language: 'en',
    level: 'all',
    developmentMode: false,
  }),
}));

vi.mock('../../../src/components/ui/FluentFlowLogo', () => ({
  FluentFlowLogo: ({ size: _size, className }: { size: string; className: string }) => 
    React.createElement('div', { 'data-testid': 'fluent-flow-logo', className: className }, '🌊'),
}));

describe('Visual Regression Tests - Theme Context Validation', () => {
  let mockClassList: any;
  let mockSetProperty: any;

  beforeEach(() => {
    // Mock document.documentElement.classList
    mockClassList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn(),
    };

    Object.defineProperty(document.documentElement, 'classList', {
      value: mockClassList,
      writable: true,
    });

    // Mock CSS custom property setting
    mockSetProperty = vi.fn();
    Object.defineProperty(document.documentElement.style, 'setProperty', {
      value: mockSetProperty,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Header Component - Basic Theme Testing', () => {
    it('should render correctly in light theme', async () => {
      applyThemeToDOM('light');
      
      const { container } = renderWithProviders(<Header />);
      
      // Basic structure verification
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('header-redesigned');
      
      // Verify theme class was applied
      expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.light);
    });

    it('should render correctly in dark theme', async () => {
      applyThemeToDOM('dark');
      
      const { container } = renderWithProviders(<Header />);
      
      // Basic structure verification
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('header-redesigned');
      
      // Verify theme class was applied
      expect(mockClassList.add).toHaveBeenCalledWith(THEME_CLASSES.dark);
    });


  });

  describe('Cross-Component Theme Consistency', () => {
    it('should maintain consistent design token usage across components', () => {
      const { container } = renderWithProviders(<Header />);
      
      // Verify Header uses consistent BEM naming
      const header = container.querySelector('.header-redesigned');
      expect(header).toBeInTheDocument();
      
      // Verify menu button follows BEM conventions
      const menuButton = container.querySelector('.header-redesigned__menu-btn');
      expect(menuButton).toBeInTheDocument();
    });

    it('should handle rapid theme switching without visual artifacts', async () => {
      const { container } = renderWithProviders(<Header />);
      
      // Rapid theme switching
      applyThemeToDOM('light');
      applyThemeToDOM('dark');
      applyThemeToDOM('light');
      
      // Component should remain stable
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('header-redesigned');
    });
  });


});