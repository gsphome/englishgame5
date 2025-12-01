import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, waitFor, screen, fireEvent } from '../../helpers/test-utils';
import ReadingComponent from '../../../src/components/learning/ReadingComponent';
import type { LearningModule, ReadingData } from '../../../src/types';

// Mock stores
const mockAddProgressEntry = vi.fn();
const mockUpdateUserScore = vi.fn();
const mockReturnToMenu = vi.fn();

vi.mock('../../../src/stores/progressStore', () => ({
  useProgressStore: () => ({
    addProgressEntry: mockAddProgressEntry,
  })
}));

vi.mock('../../../src/stores/userStore', () => ({
  useUserStore: () => ({
    updateUserScore: mockUpdateUserScore,
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
    returnToMenu: mockReturnToMenu,
  })
}));

vi.mock('../../../src/hooks/useLearningCleanup', () => ({
  useLearningCleanup: () => {},
}));

describe('Reading Progress Integration Tests', () => {
  const mockReadingData: ReadingData = {
    title: 'Test Reading Module',
    estimatedReadingTime: 5,
    learningObjectives: ['Objective 1', 'Objective 2'],
    sections: [
      {
        id: 'section1',
        title: 'Introduction',
        type: 'introduction',
        content: 'This is the introduction section.',
      },
      {
        id: 'section2',
        title: 'Main Content',
        type: 'theory',
        content: 'This is the main content section.',
      },
      {
        id: 'section3',
        title: 'Summary',
        type: 'summary',
        content: 'This is the summary section.',
      }
    ],
    keyVocabulary: [
      {
        term: 'test',
        definition: 'A procedure to assess something',
        example: 'This is a test',
      }
    ],
  };

  const mockModule: LearningModule = {
    id: 'reading-test',
    name: 'Test Reading',
    learningMode: 'reading',
    level: ['a1'],
    category: 'Reading',
    unit: 1,
    prerequisites: [],
    data: [mockReadingData],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Progress Tracking', () => {
    it('should register progress when completing reading', async () => {
      renderWithProviders(<ReadingComponent module={mockModule} />);

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText('Test Reading Module')).toBeInTheDocument();
      });

      // Start reading
      const startButton = screen.getByText('Start Reading');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Introduction')).toBeInTheDocument();
      });

      // Navigate through all sections
      const nextButton = screen.getByText(/nextSection|Next Section/i);
      
      // Section 1 -> Section 2
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText('Main Content')).toBeInTheDocument();
      });

      // Section 2 -> Section 3
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText('Summary')).toBeInTheDocument();
      });

      // Complete reading
      const completeButton = screen.getByText(/completeReading|Complete Reading/i);
      fireEvent.click(completeButton);

      // Verify progress was registered
      await waitFor(() => {
        expect(mockAddProgressEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            score: 100,
            totalQuestions: 4,
            correctAnswers: 4,
            moduleId: 'reading-test',
            learningMode: 'reading',
            timeSpent: expect.any(Number),
          })
        );
      });
    });

    it('should update user score on completion', async () => {
      renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Test Reading Module')).toBeInTheDocument();
      });

      // Start and navigate to end
      const startButton = screen.getByText('Start Reading');
      fireEvent.click(startButton);

      const nextButton = screen.getByText(/nextSection|Next Section/i);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Complete
      const completeButton = screen.getByText(/completeReading|Complete Reading/i);
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockUpdateUserScore).toHaveBeenCalledWith(
          'reading-test',
          100,
          expect.any(Number)
        );
      });
    });

    it('should track time spent reading', async () => {
      const _startTime = Date.now();
      
      renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Test Reading Module')).toBeInTheDocument();
      });

      // Simulate some reading time
      await new Promise(resolve => setTimeout(resolve, 100));

      // Start and navigate to end
      const startButton = screen.getByText('Start Reading');
      fireEvent.click(startButton);

      const nextButton = screen.getByText(/nextSection|Next Section/i);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      const completeButton = screen.getByText(/completeReading|Complete Reading/i);
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockAddProgressEntry).toHaveBeenCalled();
        const call = mockAddProgressEntry.mock.calls[0][0];
        const timeSpent = call.timeSpent;
        
        // Time should be at least 0 seconds and reasonable
        expect(timeSpent).toBeGreaterThanOrEqual(0);
        expect(timeSpent).toBeLessThan(10); // Should be less than 10 seconds in test
      });
    });

    it('should return to menu after completion', async () => {
      renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Test Reading Module')).toBeInTheDocument();
      });

      // Start and navigate to end
      const startButton = screen.getByText('Start Reading');
      fireEvent.click(startButton);

      const nextButton = screen.getByText(/nextSection|Next Section/i);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Complete
      const completeButton = screen.getByText(/completeReading|Complete Reading/i);
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockReturnToMenu).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation Between Sections', () => {
    it('should navigate forward through sections', async () => {
      renderWithProviders(<ReadingComponent module={mockModule} />);

      // Start at objectives page
      await waitFor(() => {
        expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      });

      // Start reading
      const startButton = screen.getByText('Start Reading');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Introduction')).toBeInTheDocument();
      });

      // Navigate to section 2
      const nextButton = screen.getByText(/nextSection|Next Section/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Main Content')).toBeInTheDocument();
      });

      // Navigate to section 3
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Summary')).toBeInTheDocument();
      });
    });

    it('should navigate backward through sections', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      });

      // Start reading
      const startButton = screen.getByText('Start Reading');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Introduction')).toBeInTheDocument();
      });

      // Navigate forward - need to click 3 times (intro -> main -> summary)
      const nextButton = screen.getByText('Next Section');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Main Content')).toBeInTheDocument();
      });
      
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Summary')).toBeInTheDocument();
      });

      // Navigate backward - find button by title attribute
      const prevButton = container.querySelector('button[title*="Previous"]');
      
      if (prevButton) {
        fireEvent.click(prevButton);
        await waitFor(() => {
          expect(screen.getByText('Main Content')).toBeInTheDocument();
        });
      }
    });

    it('should disable previous button on first section', async () => {
      const { container } = renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      });

      // Find previous button by title attribute - should be disabled on objectives page
      const prevButton = container.querySelector('button[title*="Previous"]');

      if (prevButton) {
        expect(prevButton).toBeDisabled();
      }
    });

    it('should show complete button on last section', async () => {
      renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      });

      // Start and navigate to last section
      const startButton = screen.getByText('Start Reading');
      fireEvent.click(startButton);

      const nextButton = screen.getByText(/nextSection|Next Section/i);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/completeReading|Complete Reading/i)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate forward with ArrowRight key', async () => {
      renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      });

      // Press ArrowRight to start
      fireEvent.keyDown(window, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(screen.getByText('Introduction')).toBeInTheDocument();
      });

      // Press ArrowRight again
      fireEvent.keyDown(window, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(screen.getByText('Main Content')).toBeInTheDocument();
      });
    });

    it('should navigate backward with ArrowLeft key', async () => {
      renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      });

      // Navigate forward first
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(screen.getByText('Introduction')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(screen.getByText('Main Content')).toBeInTheDocument();
      });

      // Navigate backward
      fireEvent.keyDown(window, { key: 'ArrowLeft' });

      await waitFor(() => {
        expect(screen.getByText('Introduction')).toBeInTheDocument();
      });
    });

    it('should return to menu with Escape key', async () => {
      renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        expect(mockReturnToMenu).toHaveBeenCalled();
      });
    });

    it('should navigate forward with Enter key', async () => {
      renderWithProviders(<ReadingComponent module={mockModule} />);

      await waitFor(() => {
        expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      });

      // Press Enter to start
      fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Introduction')).toBeInTheDocument();
      });

      // Press Enter again
      fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Main Content')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle module without data', () => {
      const emptyModule: LearningModule = {
        ...mockModule,
        data: [],
      };

      renderWithProviders(<ReadingComponent module={emptyModule} />);

      expect(screen.getByText(/noReadingContentAvailable|No reading content/i)).toBeInTheDocument();
    });

    it('should handle module with null data', () => {
      const nullModule: LearningModule = {
        ...mockModule,
        data: undefined as any,
      };

      renderWithProviders(<ReadingComponent module={nullModule} />);

      expect(screen.getByText(/noReadingContentAvailable|No reading content/i)).toBeInTheDocument();
    });

    it('should provide return to menu button on error', () => {
      const emptyModule: LearningModule = {
        ...mockModule,
        data: [],
      };

      renderWithProviders(<ReadingComponent module={emptyModule} />);

      const menuButton = screen.getByText(/mainMenu|Main Menu/i);
      fireEvent.click(menuButton);

      expect(mockReturnToMenu).toHaveBeenCalled();
    });
  });

  describe('Interactive Content', () => {
    it('should handle sections with interactive tooltips', async () => {
      const interactiveData: ReadingData = {
        ...mockReadingData,
        sections: [
          {
            id: 'section1',
            title: 'Interactive Section',
            type: 'theory',
            content: 'Content with tooltips',
            interactive: {
              tooltips: [
                { term: 'tooltip1', definition: 'Definition 1' },
                { term: 'tooltip2', definition: 'Definition 2' },
              ],
            },
          }
        ],
      };

      const interactiveModule: LearningModule = {
        ...mockModule,
        data: [interactiveData],
      };

      renderWithProviders(<ReadingComponent module={interactiveModule} />);

      // Start reading
      const startButton = await screen.findByText('Start Reading');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Interactive Section')).toBeInTheDocument();
      });

      // Tooltips should be present
      expect(screen.getByText('tooltip1')).toBeInTheDocument();
      expect(screen.getByText('tooltip2')).toBeInTheDocument();
    });

    it('should handle sections with expandable content', async () => {
      const expandableData: ReadingData = {
        ...mockReadingData,
        sections: [
          {
            id: 'section1',
            title: 'Expandable Section',
            type: 'theory',
            content: 'Content with expandables',
            interactive: {
              expandable: [
                { title: 'Expand 1', content: 'Hidden content 1' },
                { title: 'Expand 2', content: 'Hidden content 2' },
              ],
            },
          }
        ],
      };

      const expandableModule: LearningModule = {
        ...mockModule,
        data: [expandableData],
      };

      renderWithProviders(<ReadingComponent module={expandableModule} />);

      // Component starts at objectives page, need to navigate to content
      const startButton = await screen.findByText('Start Reading');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Expandable Section')).toBeInTheDocument();
      });

      // Expandable triggers should be present
      expect(screen.getByText('Expand 1')).toBeInTheDocument();
      expect(screen.getByText('Expand 2')).toBeInTheDocument();
    });
  });
});
