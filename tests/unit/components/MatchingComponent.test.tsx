import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, createMockModule } from '../../../src/test/utils';
import MatchingComponent from '../../../src/components/learning/MatchingComponent';
import type { LearningModule } from '../../../src/types';

describe('MatchingComponent', () => {
  let mockModule: LearningModule;

  beforeEach(() => {
    mockModule = createMockModule({
      id: 'matching-test',
      name: 'Test Matching',
      learningMode: 'matching',
      data: [
        {
          left: 'Hello',
          right: 'Hola',
          explanation: 'Basic greeting'
        },
        {
          left: 'Goodbye',
          right: 'Adiós',
          explanation: 'Farewell expression'
        },
        {
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
});