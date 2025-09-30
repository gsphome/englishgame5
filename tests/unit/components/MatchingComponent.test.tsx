
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '../../helpers/test-utils';
import { testUtils } from '../../helpers/test-utils';
import MatchingComponent from '../../../src/components/learning/MatchingComponent';
import type { LearningModule } from '../../../src/types';

describe('MatchingComponent', () => {
  let mockModule: LearningModule;

  beforeEach(() => {
    mockModule = testUtils.createMockModule({
      id: 'matching-test',
      name: 'Test Matching',
      learningMode: 'matching',
      data: [
        {
          id: '1',
          left: 'Hello',
          right: 'Hola',
          explanation: 'Basic greeting'
        },
        {
          id: '2',
          left: 'Goodbye',
          right: 'Adiós',
          explanation: 'Farewell expression'
        },
        {
          id: '3',
          left: 'Thank you',
          right: 'Gracias',
          explanation: 'Expression of gratitude'
        }
      ]
    });
  });

  it('should render matching component with new format', () => {
    const { getByText } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    expect(getByText('Test Matching')).toBeInTheDocument();
    expect(getByText('Terms')).toBeInTheDocument();
    expect(getByText('Definitions')).toBeInTheDocument();
  });

  it('should display left and right items from new format', () => {
    const { getByText } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    // Check that left items are displayed
    expect(getByText('Hello')).toBeInTheDocument();
    expect(getByText('Goodbye')).toBeInTheDocument();
    expect(getByText('Thank you')).toBeInTheDocument();

    // Check that right items are displayed
    expect(getByText('Hola')).toBeInTheDocument();
    expect(getByText('Adiós')).toBeInTheDocument();
    expect(getByText('Gracias')).toBeInTheDocument();
  });

  it('should show progress indicator', () => {
    const { container } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    // The progress is shown in LearningProgressHeader component
    const progressHeader = container.querySelector('.learning-progress-header');
    expect(progressHeader).toBeInTheDocument();
  });

  it('should apply proper BEM classes for pure CSS architecture', () => {
    const { container } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    // Check main component class (BEM block)
    expect(container.querySelector('.matching-component')).toBeInTheDocument();

    // Check that it uses LearningProgressHeader component
    expect(container.querySelector('.learning-progress-header')).toBeInTheDocument();

    // Check grid structure (BEM elements)
    expect(container.querySelector('.matching-component__grid')).toBeInTheDocument();
    expect(container.querySelector('.matching-component__columns')).toBeInTheDocument();

    // Check column headers (BEM elements)
    expect(container.querySelector('.matching-component__column-header')).toBeInTheDocument();

    // Check items have proper BEM classes (elements and modifiers)
    expect(container.querySelector('.matching-component__item')).toBeInTheDocument();
    expect(container.querySelector('.matching-component__item--default')).toBeInTheDocument();
    
    // Check item content structure (nested BEM elements)
    expect(container.querySelector('.matching-component__item-content')).toBeInTheDocument();
    expect(container.querySelector('.matching-component__item-text')).toBeInTheDocument();
    expect(container.querySelector('.matching-component__item-letter')).toBeInTheDocument();

    // Check game controls section (BEM elements)
    expect(container.querySelector('.game-controls')).toBeInTheDocument();
    expect(container.querySelector('.game-controls__primary-btn')).toBeInTheDocument();
  });

  it('should use design tokens for theme context support', () => {
    const { container } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    // Verify that component uses semantic BEM classes that support theme contexts via design tokens
    const component = container.querySelector('.matching-component');
    expect(component).toBeInTheDocument();

    // Check that items use proper BEM modifiers for different states
    const items = container.querySelectorAll('.matching-component__item');
    expect(items.length).toBeGreaterThan(0);

    // Verify BEM modifier classes for different item states
    items.forEach(item => {
      const hasValidModifier = 
        item.classList.contains('matching-component__item--default') ||
        item.classList.contains('matching-component__item--selected') ||
        item.classList.contains('matching-component__item--matched') ||
        item.classList.contains('matching-component__item--matched-inactive') ||
        item.classList.contains('matching-component__item--correct') ||
        item.classList.contains('matching-component__item--incorrect') ||
        item.classList.contains('matching-component__item--unmatched');
      
      expect(hasValidModifier).toBe(true);
    });

    // Verify button elements use proper BEM modifiers
    const buttons = container.querySelectorAll('.matching-component__button');
    buttons.forEach(button => {
      const hasValidModifier = 
        button.classList.contains('matching-component__button--primary') ||
        button.classList.contains('matching-component__button--secondary') ||
        button.classList.contains('matching-component__button--success');
      
      expect(hasValidModifier).toBe(true);
    });
  });

  it('should not contain any Tailwind classes', () => {
    const { container } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    // Get all elements with class attributes
    const elementsWithClasses = container.querySelectorAll('[class]');
    
    elementsWithClasses.forEach(element => {
      const classList = Array.from(element.classList);
      
      // Check for common Tailwind patterns that should not exist
      const tailwindPatterns = [
        /^(bg|text|border|p|m|w|h|flex|grid|rounded|shadow)-/,
        /^(hover|focus|active|dark):/,
        /^(sm|md|lg|xl):/,
        /^space-/,
        /^gap-/
      ];
      
      classList.forEach(className => {
        const hasTailwindPattern = tailwindPatterns.some(pattern => pattern.test(className));
        expect(hasTailwindPattern).toBe(false);
      });
    });
  });

  it('should follow strict BEM naming conventions', () => {
    const { container } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    // Get all elements with class attributes
    const elementsWithClasses = container.querySelectorAll('[class]');
    
    elementsWithClasses.forEach(element => {
      const classList = Array.from(element.classList);
      
      classList.forEach(className => {
        // Skip utility classes and non-BEM classes
        if (className.startsWith('sr-') || className === 'lucide' || className.includes('icon')) {
          return;
        }
        
        // BEM pattern: block__element--modifier or just block or block--modifier
        const bemPattern = /^[a-z-]+(__[a-z-]+)?(--[a-z-]+)?$/;
        expect(className).toMatch(bemPattern);
      });
    });
  });

  it('should support theme context switching through CSS architecture', () => {
    const { container, rerender } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    // Verify component renders with theme-aware classes
    const component = container.querySelector('.matching-component');
    expect(component).toBeInTheDocument();

    // Simulate theme context change by adding dark class to document
    document.documentElement.classList.add('dark');
    
    // Re-render component
    rerender(<MatchingComponent module={mockModule} />);
    
    // Component should still render correctly with same BEM classes
    // (theme switching is handled by CSS design tokens, not class changes)
    expect(container.querySelector('.matching-component')).toBeInTheDocument();
    expect(container.querySelector('.matching-component__item')).toBeInTheDocument();
    
    // Clean up
    document.documentElement.classList.remove('dark');
  });
});