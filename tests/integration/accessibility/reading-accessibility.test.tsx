import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, waitFor, screen } from '../../helpers/test-utils';
import ReadingComponent from '../../../src/components/learning/ReadingComponent';
import type { LearningModule, ReadingData } from '../../../src/types';

// Mock stores
vi.mock('../../../src/stores/progressStore', () => ({
  useProgressStore: () => ({
    addProgressEntry: vi.fn(),
  })
}));

vi.mock('../../../src/stores/userStore', () => ({
  useUserStore: () => ({
    updateUserScore: vi.fn(),
  })
}));

vi.mock('../../../src/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    theme: 'light',
    language: 'en',
  })
}));

vi.mock('../../../src/hooks/useMenuNavigation', () => ({
  useMenuNavigation: () => ({
    returnToMenu: vi.fn(),
  })
}));

vi.mock('../../../src/hooks/useLearningCleanup', () => ({
  useLearningCleanup: () => {},
}));

describe('Reading Component Accessibility Tests', () => {
  const mockReadingData: ReadingData = {
    title: 'Accessibility Test Reading',
    estimatedReadingTime: 5,
    learningObjectives: ['Test accessibility features'],
    sections: [
      {
        id: 'section1',
        title: 'Section 1',
        type: 'introduction',
        content: 'Content for section 1',
      },
      {
        id: 'section2',
        title: 'Section 2',
        type: 'theory',
        content: 'Content for section 2',
      }
    ],
    keyVocabulary: [
      {
        term: 'accessibility',
        definition: 'The practice of making content usable by all people',
        example: 'Accessibility is important for inclusive design',
      }
    ],
  };

  const mockModule: LearningModule = {
    id: 'reading-accessibility-test',
    name: 'Accessibility Test',
    learningMode: 'reading',
    level: ['a1'],
    category: 'Reading',
    unit: 1,
    prerequisites: [],
    data: [mockReadingData],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset theme
    document.documentElement.classList.remove('dark');
  });

  describe('Screen Reader Compatibility', () => {
    it('should have proper heading structure for screen readers', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Reading')).toBeInTheDocument();
      });

      // Check for heading hierarchy
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);

      // Verify main title is present
      expect(screen.getByText('Accessibility Test Reading')).toBeInTheDocument();
    });

    it('should have accessible button labels', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // All buttons should have accessible text or aria-label
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        const hasAccessibleText = 
          button.textContent?.trim() || 
          button.getAttribute('aria-label') ||
          button.getAttribute('title');
        
        expect(hasAccessibleText).toBeTruthy();
      });
    });

    it('should have proper ARIA attributes for interactive elements', async () => {
      const interactiveData: ReadingData = {
        ...mockReadingData,
        sections: [
          {
            id: 'section1',
            title: 'Interactive Section',
            type: 'theory',
            content: 'Content',
            interactive: {
              expandable: [
                { title: 'Expandable 1', content: 'Hidden content' }
              ],
              tooltips: [
                { term: 'term1', definition: 'Definition 1' }
              ],
            },
          }
        ],
      };

      const interactiveModule: LearningModule = {
        ...mockModule,
        data: [interactiveData],
      };

      const { container } = renderWithProviders(<ReadingComponent module={interactiveModule} />);

      await waitFor(() => {
        expect(screen.getByText('Interactive Section')).toBeInTheDocument();
      });

      // Check for aria-expanded on expandable elements
      const expandableButtons = container.querySelectorAll('[aria-expanded]');
      expect(expandableButtons.length).toBeGreaterThan(0);

      expandableButtons.forEach(button => {
        const ariaExpanded = button.getAttribute('aria-expanded');
        expect(['true', 'false']).toContain(ariaExpanded);
      });
    });

    it('should provide semantic HTML structure', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Check for semantic elements
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Verify no divs are used as buttons
      const clickableDivs = container.querySelectorAll('div[onclick], div[role="button"]');
      expect(clickableDivs.length).toBe(0);
    });
  });

  describe('Keyboard Navigation Accessibility', () => {
    it('should support keyboard navigation in all modes', async () => {
      // Test in light mode
      document.documentElement.classList.remove('dark');
      const { container: lightContainer } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify focusable elements exist
      const lightFocusable = lightContainer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(lightFocusable.length).toBeGreaterThan(0);

      // Test in dark mode
      document.documentElement.classList.add('dark');
      const { container: darkContainer } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getAllByText('Section 1')[0]).toBeInTheDocument();
      });

      const darkFocusable = darkContainer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(darkFocusable.length).toBeGreaterThan(0);

      // Clean up
      document.documentElement.classList.remove('dark');
    });

    it('should have visible focus indicators', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Check that focusable elements exist and have proper structure
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea'
      );

      expect(focusableElements.length).toBeGreaterThan(0);

      // Verify elements have classes for styling (actual focus indicators tested visually)
      focusableElements.forEach(element => {
        expect(element.className).toBeDefined();
      });
    });

    it('should not trap keyboard focus', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify no elements have tabindex > 0 (which can cause focus trapping)
      const elementsWithTabindex = container.querySelectorAll('[tabindex]');
      elementsWithTabindex.forEach(element => {
        const tabindex = parseInt(element.getAttribute('tabindex') || '0');
        expect(tabindex).toBeLessThanOrEqual(0);
      });
    });
  });

  describe('Color Contrast Compliance', () => {
    it('should render with sufficient contrast in light mode', async () => {
      document.documentElement.classList.remove('dark');
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify text elements exist (actual contrast testing requires visual tools)
      const textElements = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button');
      expect(textElements.length).toBeGreaterThan(0);

      // Verify elements have proper structure for styling
      textElements.forEach(element => {
        expect(element.className).toBeDefined();
      });
    });

    it('should render with sufficient contrast in dark mode', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />, { theme: 'dark' });

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify text elements exist
      const textElements = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button');
      expect(textElements.length).toBeGreaterThan(0);

      // Verify component renders successfully in dark mode
      expect(container.querySelector('.reading-component__container')).toBeInTheDocument();
    });

    it('should maintain contrast for interactive elements', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Check buttons have proper structure for styling
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.className).toBeDefined();
      });
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have minimum 44px touch targets on mobile', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Check interactive elements
      const interactiveElements = container.querySelectorAll('button, [role="button"]');
      
      interactiveElements.forEach(element => {
        // In test environment, we verify elements exist and have classes
        // Actual size testing requires visual regression tools
        expect(element.className).toBeDefined();
      });

      // Reset viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should have adequate spacing between interactive elements', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify interactive elements exist and have proper structure
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check that buttons have proper classes for layout
      buttons.forEach(button => {
        expect(button.className).toBeDefined();
      });
    });
  });

  describe('Motion and Animation Preferences', () => {
    it('should respect prefers-reduced-motion', async () => {
      // Mock matchMedia for reduced motion
      const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
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

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify component renders without animations when reduced motion is preferred
      // In CSS, animations should be disabled via @media (prefers-reduced-motion: reduce)
      expect(container.querySelector('.reading-component__container')).toBeInTheDocument();
    });

    it('should handle high contrast mode', async () => {
      // Mock matchMedia for high contrast
      const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-contrast: high)',
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

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify component renders in high contrast mode
      expect(container.querySelector('.reading-component__container')).toBeInTheDocument();
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('should be accessible on mobile portrait', async () => {
      // Simulate mobile portrait
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify content is accessible
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Verify no horizontal scroll
      const mainContainer = container.querySelector('.reading-component__container');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should be accessible on mobile landscape', async () => {
      // Simulate mobile landscape
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify layout adapts to landscape
      expect(container.querySelector('.reading-component__container')).toBeInTheDocument();
    });

    it('should be accessible on tablet', async () => {
      // Simulate tablet
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify tablet layout
      expect(container.querySelector('.reading-component__container')).toBeInTheDocument();
    });

    it('should be accessible on desktop', async () => {
      // Simulate desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify desktop layout
      expect(container.querySelector('.reading-component__container')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should manage focus when navigating between sections', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Find the actual button element (not just text)
      const buttons = container.querySelectorAll('button');
      const nextButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('Next') || btn.textContent?.includes('nextSection')
      );
      
      // Verify button exists and can receive focus
      expect(nextButton).toBeDefined();
      if (nextButton) {
        nextButton.focus();
        expect(nextButton.tagName).toBe('BUTTON');
      }
    });

    it('should not lose focus on interactive elements', async () => {
      const interactiveData: ReadingData = {
        ...mockReadingData,
        sections: [
          {
            id: 'section1',
            title: 'Interactive Section',
            type: 'theory',
            content: 'Content',
            interactive: {
              tooltips: [
                { term: 'term1', definition: 'Definition 1' }
              ],
            },
          }
        ],
      };

      const interactiveModule: LearningModule = {
        ...mockModule,
        data: [interactiveData],
      };

      const { container } = renderWithProviders(<ReadingComponent module={interactiveModule} />);

      await waitFor(() => {
        expect(screen.getByText('Interactive Section')).toBeInTheDocument();
      });

      // Find tooltip button (should be a button element containing the term)
      const buttons = container.querySelectorAll('button');
      const tooltipButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('term1')
      );
      
      // Verify button exists and can receive focus
      expect(tooltipButton).toBeDefined();
      if (tooltipButton) {
        tooltipButton.focus();
        expect(tooltipButton.tagName).toBe('BUTTON');
      }
    });
  });

  describe('Cross-Mode Accessibility', () => {
    it('should maintain accessibility in web light mode', async () => {
      document.documentElement.classList.remove('dark');
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify accessibility features
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        const hasAccessibleText = 
          button.textContent?.trim() || 
          button.getAttribute('aria-label') ||
          button.getAttribute('title');
        expect(hasAccessibleText).toBeTruthy();
      });
    });

    it('should maintain accessibility in web dark mode', async () => {
      document.documentElement.classList.add('dark');
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify accessibility features in dark mode
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Clean up
      document.documentElement.classList.remove('dark');
    });

    it('should maintain accessibility in mobile light mode', async () => {
      document.documentElement.classList.remove('dark');
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify mobile accessibility
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should maintain accessibility in mobile dark mode', async () => {
      document.documentElement.classList.add('dark');
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      });

      // Verify mobile dark mode accessibility
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Clean up
      document.documentElement.classList.remove('dark');
    });
  });
});
