import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/test-utils';
import { validateBEMNaming, validateNoTailwindClasses } from '../../helpers/visual-regression-utils';
import React from 'react';
import { Header } from '../../../src/components/ui/Header';
import { CompactAdvancedSettings } from '../../../src/components/ui/CompactAdvancedSettings';

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

describe('BEM Compliance Testing', () => {
  beforeEach(() => {
    // Mock DOM methods
    Object.defineProperty(document, 'documentElement', {
      writable: true,
      value: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn(),
        },
        style: { setProperty: vi.fn() },
      },
    });

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

  describe('BEM Naming Convention Validation', () => {
    it('should validate correct BEM naming patterns', () => {
      // Valid BEM patterns
      expect(validateBEMNaming('header-redesigned')).toBe(true);
      expect(validateBEMNaming('header-redesigned__menu-btn')).toBe(true);
      expect(validateBEMNaming('header-redesigned__menu-btn--primary')).toBe(true);
      expect(validateBEMNaming('compact-settings')).toBe(true);
      expect(validateBEMNaming('compact-settings__close-btn')).toBe(true);
      expect(validateBEMNaming('compact-settings__title')).toBe(true);
      expect(validateBEMNaming('compact-settings__tab--active')).toBe(true);
      
      // Multiple classes (all valid)
      expect(validateBEMNaming('header-redesigned header-redesigned--menu')).toBe(true);
      expect(validateBEMNaming('compact-settings__btn compact-settings__btn--primary')).toBe(true);
      
      // Utility classes should be allowed
      expect(validateBEMNaming('sr-only')).toBe(true);
      expect(validateBEMNaming('header-redesigned sr-only')).toBe(true);
    });

    it('should reject invalid BEM naming patterns', () => {
      // Invalid patterns
      expect(validateBEMNaming('HeaderRedesigned')).toBe(false); // PascalCase
      expect(validateBEMNaming('header_redesigned')).toBe(false); // Snake case
      expect(validateBEMNaming('header.redesigned')).toBe(false); // Dot notation
      expect(validateBEMNaming('header redesigned')).toBe(false); // Space without proper BEM
      expect(validateBEMNaming('header__element__nested')).toBe(false); // Double nesting
      expect(validateBEMNaming('header--modifier--double')).toBe(false); // Double modifier
    });

    it('should handle edge cases', () => {
      // Empty or null values
      expect(validateBEMNaming('')).toBe(true);
      expect(validateBEMNaming(null as any)).toBe(true);
      expect(validateBEMNaming(undefined as any)).toBe(true);
      
      // Single character classes
      expect(validateBEMNaming('a')).toBe(true);
      expect(validateBEMNaming('a__b')).toBe(true);
      expect(validateBEMNaming('a--b')).toBe(true);
    });
  });

  describe('Tailwind Class Detection', () => {
    it('should detect common Tailwind utility classes', () => {
      // Color utilities
      expect(validateNoTailwindClasses('text-gray-500')).toBe(false);
      expect(validateNoTailwindClasses('bg-gray-100')).toBe(false);
      expect(validateNoTailwindClasses('border-gray-200')).toBe(false);
      
      // State prefixes
      expect(validateNoTailwindClasses('hover:text-blue-500')).toBe(false);
      expect(validateNoTailwindClasses('focus:ring-2')).toBe(false);
      expect(validateNoTailwindClasses('dark:bg-gray-900')).toBe(false);
      
      // Sizing utilities
      expect(validateNoTailwindClasses('w-4')).toBe(false);
      expect(validateNoTailwindClasses('h-6')).toBe(false);
      expect(validateNoTailwindClasses('p-2')).toBe(false);
      expect(validateNoTailwindClasses('m-4')).toBe(false);
      
      // Display utilities
      expect(validateNoTailwindClasses('flex')).toBe(false);
      expect(validateNoTailwindClasses('grid')).toBe(false);
      expect(validateNoTailwindClasses('block')).toBe(false);
      
      // Common utilities
      expect(validateNoTailwindClasses('rounded')).toBe(false);
      expect(validateNoTailwindClasses('shadow')).toBe(false);
      expect(validateNoTailwindClasses('border')).toBe(false);
    });

    it('should allow valid BEM classes', () => {
      // Pure BEM classes should pass
      expect(validateNoTailwindClasses('header-redesigned')).toBe(true);
      expect(validateNoTailwindClasses('header-redesigned__menu-btn')).toBe(true);
      expect(validateNoTailwindClasses('compact-settings__close-btn')).toBe(true);
      expect(validateNoTailwindClasses('compact-settings__tab--active')).toBe(true);
      
      // Utility classes that aren't Tailwind
      expect(validateNoTailwindClasses('sr-only')).toBe(true);
      expect(validateNoTailwindClasses('visually-hidden')).toBe(true);
    });

    it('should handle mixed classes', () => {
      // Mixed valid and invalid
      expect(validateNoTailwindClasses('header-redesigned text-gray-500')).toBe(false);
      expect(validateNoTailwindClasses('compact-settings hover:bg-blue-500')).toBe(false);
      
      // All valid
      expect(validateNoTailwindClasses('header-redesigned header-redesigned--active')).toBe(true);
    });
  });

  describe('Header Component BEM Compliance', () => {
    it('should use only BEM classes in Header component', () => {
      const { container } = renderWithProviders(<Header />);
      
      // Get all elements with class names
      const allElements = container.querySelectorAll('*');
      const violations: string[] = [];
      
      allElements.forEach((element, index) => {
        const className = element.className;
        if (className && typeof className === 'string') {
          // Check BEM compliance
          if (!validateBEMNaming(className)) {
            violations.push(`Element ${index}: Invalid BEM naming - "${className}"`);
          }
          
          // Check for Tailwind classes
          if (!validateNoTailwindClasses(className)) {
            violations.push(`Element ${index}: Contains Tailwind classes - "${className}"`);
          }
        }
      });
      
      // Report all violations
      if (violations.length > 0) {
        console.error('BEM Compliance Violations in Header:', violations);
      }
      
      expect(violations).toHaveLength(0);
    });

    it('should have proper block__element--modifier structure in Header', () => {
      const { container } = renderWithProviders(<Header />);
      
      // Check for expected BEM structure
      const header = container.querySelector('header');
      expect(header).toHaveClass('header-redesigned');
      
      // Menu button should follow BEM
      const menuButton = screen.getByRole('button', { name: /abrir menú/i });
      expect(menuButton.className).toMatch(/header-redesigned__menu-btn/);
      
      // User button should follow BEM
      const userButton = screen.getByRole('button', { name: /user profile/i });
      expect(userButton.className).toMatch(/header-redesigned__/);
      
      // All classes should be valid BEM
      const allClassNames = [header?.className, menuButton?.className, userButton?.className];
      allClassNames.forEach(className => {
        if (className) {
          expect(validateBEMNaming(className)).toBe(true);
        }
      });
    });
  });

  describe('CompactAdvancedSettings Component BEM Compliance', () => {
    it('should use only BEM classes in CompactAdvancedSettings component', () => {
      const mockOnClose = vi.fn();
      const { container } = renderWithProviders(
        <CompactAdvancedSettings isOpen={true} onClose={mockOnClose} />
      );
      
      // Get all elements with class names
      const allElements = container.querySelectorAll('*');
      const violations: string[] = [];
      
      allElements.forEach((element, index) => {
        const className = element.className;
        if (className && typeof className === 'string') {
          // Check BEM compliance
          if (!validateBEMNaming(className)) {
            violations.push(`Element ${index}: Invalid BEM naming - "${className}"`);
          }
          
          // Check for Tailwind classes
          if (!validateNoTailwindClasses(className)) {
            violations.push(`Element ${index}: Contains Tailwind classes - "${className}"`);
          }
        }
      });
      
      // Report all violations
      if (violations.length > 0) {
        console.error('BEM Compliance Violations in CompactAdvancedSettings:', violations);
      }
      
      expect(violations).toHaveLength(0);
    });
  });

  describe('CSS Class Naming Consistency', () => {
    it('should validate that all CSS classes follow strict BEM conventions', () => {
      // Test various BEM patterns that should be used in the components
      const validBEMPatterns = [
        'header-redesigned',
        'header-redesigned__menu-btn',
        'header-redesigned__menu-btn--primary',
        'header-redesigned__user-btn',
        'compact-settings',
        'compact-settings__container',
        'compact-settings__header',
        'compact-settings__title',
        'compact-settings__close-btn',
        'compact-settings__tab',
        'compact-settings__tab--active',
        'compact-settings__content',
        'compact-settings__field',
        'compact-settings__label',
        'compact-settings__select',
        'compact-settings__btn',
        'compact-settings__btn--primary',
        'compact-settings__btn--reset',
      ];
      
      validBEMPatterns.forEach(pattern => {
        expect(validateBEMNaming(pattern)).toBe(true);
      });
    });

    it('should reject patterns that violate BEM methodology', () => {
      const invalidPatterns = [
        'headerRedesigned',           // PascalCase
        'header_redesigned',          // Snake case
        'header.redesigned',          // Dot notation
        'header__menu__btn',          // Double element
        'header--primary--active',    // Double modifier
        'text-gray-500',             // Tailwind utility
        'hover:bg-blue-500',         // Tailwind state
        'w-4 h-6',                   // Tailwind sizing
      ];
      
      invalidPatterns.forEach(pattern => {
        expect(validateBEMNaming(pattern)).toBe(false);
      });
    });
  });
});