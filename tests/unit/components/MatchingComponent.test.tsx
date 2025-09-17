
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
    const { getByText } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    expect(getByText('0/3 matched')).toBeInTheDocument();
  });

  it('should apply proper BEM-like classes for styling', () => {
    const { container } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    // Check main component class
    expect(container.querySelector('.matching-component')).toBeInTheDocument();

    // Check grid structure
    expect(container.querySelector('.matching-component__grid')).toBeInTheDocument();
    expect(container.querySelector('.matching-component__columns')).toBeInTheDocument();

    // Check column headers
    expect(container.querySelector('.matching-component__column-header')).toBeInTheDocument();

    // Check items have proper BEM classes
    expect(container.querySelector('.matching-component__item')).toBeInTheDocument();
    expect(container.querySelector('.matching-component__item--default')).toBeInTheDocument();
  });

  it('should have proper dark mode support through CSS classes', () => {
    const { container } = renderWithProviders(
      <MatchingComponent module={mockModule} />
    );

    // Verify that items use semantic BEM classes that support dark mode via CSS
    const items = container.querySelectorAll('.matching-component__item');
    expect(items.length).toBeGreaterThan(0);

    // Check that items have proper state classes for dark mode support
    items.forEach(item => {
      expect(item.classList.contains('matching-component__item--default') ||
        item.classList.contains('matching-component__item--selected') ||
        item.classList.contains('matching-component__item--matched')).toBe(true);
    });
  });
});