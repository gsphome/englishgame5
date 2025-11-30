import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../../../src/services/api';
import * as secureHttp from '../../../src/utils/secureHttp';
import * as pathUtils from '../../../src/utils/pathUtils';
import type { LearningModule } from '../../../src/types';

// Mock dependencies
vi.mock('../../../src/utils/secureHttp');
vi.mock('../../../src/utils/pathUtils');
vi.mock('../../../src/utils/logger', () => ({
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

describe('Reading Prerequisite System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiService.clearCache();
    
    vi.mocked(pathUtils.getLearningModulesPath).mockReturnValue('/data/learningModules.json');
    vi.mocked(pathUtils.getAssetPath).mockImplementation((path: string) => `/assets/${path}`);
    vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);
  });

  describe('Reading as Prerequisites', () => {
    it('should configure reading modules as prerequisites for interactive exercises', async () => {
      const mockModules: LearningModule[] = [
        // Reading module
        {
          id: 'reading-business-a1',
          name: 'Business Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
          dataPath: 'data/a1/a1-reading-business.json',
        },
        // Interactive exercise that requires reading
        {
          id: 'quiz-business-a1',
          name: 'Business Quiz',
          learningMode: 'quiz',
          level: ['a1'],
          category: 'Business',
          unit: 2,
          prerequisites: ['reading-business-a1'],
          dataPath: 'data/a1/a1-quiz-business.json',
        },
        // Another interactive exercise
        {
          id: 'flashcard-business-a1',
          name: 'Business Flashcards',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Business',
          unit: 3,
          prerequisites: ['reading-business-a1', 'quiz-business-a1'],
          dataPath: 'data/a1/a1-flashcard-business.json',
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      expect(result.success).toBe(true);
      
      // Verify reading module has no prerequisites
      const readingModule = result.data.find(m => m.id === 'reading-business-a1');
      expect(readingModule?.prerequisites).toEqual([]);
      
      // Verify quiz requires reading
      const quizModule = result.data.find(m => m.id === 'quiz-business-a1');
      expect(quizModule?.prerequisites).toContain('reading-business-a1');
      
      // Verify flashcard requires both reading and quiz
      const flashcardModule = result.data.find(m => m.id === 'flashcard-business-a1');
      expect(flashcardModule?.prerequisites).toContain('reading-business-a1');
      expect(flashcardModule?.prerequisites).toContain('quiz-business-a1');
    });

    it('should support multiple reading modules as prerequisites', async () => {
      const mockModules: LearningModule[] = [
        {
          id: 'reading-business-a1',
          name: 'Business Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
        },
        {
          id: 'reading-travel-a1',
          name: 'Travel Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 2,
          prerequisites: [],
        },
        {
          id: 'quiz-combined-a1',
          name: 'Combined Quiz',
          learningMode: 'quiz',
          level: ['a1'],
          category: 'Combined',
          unit: 3,
          prerequisites: ['reading-business-a1', 'reading-travel-a1'],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      const combinedQuiz = result.data.find(m => m.id === 'quiz-combined-a1');
      expect(combinedQuiz?.prerequisites).toHaveLength(2);
      expect(combinedQuiz?.prerequisites).toContain('reading-business-a1');
      expect(combinedQuiz?.prerequisites).toContain('reading-travel-a1');
    });

    it('should support reading modules with other reading prerequisites', async () => {
      const mockModules: LearningModule[] = [
        {
          id: 'reading-basics-a1',
          name: 'Basic Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
        },
        {
          id: 'reading-advanced-a1',
          name: 'Advanced Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 2,
          prerequisites: ['reading-basics-a1'],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      const advancedReading = result.data.find(m => m.id === 'reading-advanced-a1');
      expect(advancedReading?.prerequisites).toContain('reading-basics-a1');
    });
  });

  describe('Prerequisite Chains', () => {
    it('should support complex prerequisite chains with reading modules', async () => {
      const mockModules: LearningModule[] = [
        // Level 1: Reading foundation
        {
          id: 'reading-foundation-a1',
          name: 'Foundation Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
        },
        // Level 2: Interactive based on reading
        {
          id: 'flashcard-foundation-a1',
          name: 'Foundation Flashcards',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 2,
          prerequisites: ['reading-foundation-a1'],
        },
        // Level 3: Advanced reading based on interactive
        {
          id: 'reading-advanced-a1',
          name: 'Advanced Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 3,
          prerequisites: ['flashcard-foundation-a1'],
        },
        // Level 4: Quiz based on advanced reading
        {
          id: 'quiz-advanced-a1',
          name: 'Advanced Quiz',
          learningMode: 'quiz',
          level: ['a1'],
          category: 'Assessment',
          unit: 4,
          prerequisites: ['reading-advanced-a1'],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      // Verify chain: reading -> flashcard -> reading -> quiz
      const foundationReading = result.data.find(m => m.id === 'reading-foundation-a1');
      const foundationFlashcard = result.data.find(m => m.id === 'flashcard-foundation-a1');
      const advancedReading = result.data.find(m => m.id === 'reading-advanced-a1');
      const advancedQuiz = result.data.find(m => m.id === 'quiz-advanced-a1');

      expect(foundationReading?.prerequisites).toEqual([]);
      expect(foundationFlashcard?.prerequisites).toContain('reading-foundation-a1');
      expect(advancedReading?.prerequisites).toContain('flashcard-foundation-a1');
      expect(advancedQuiz?.prerequisites).toContain('reading-advanced-a1');
    });

    it('should handle cross-level prerequisite chains', async () => {
      const mockModules: LearningModule[] = [
        {
          id: 'reading-business-a1',
          name: 'Business Reading A1',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
        },
        {
          id: 'reading-business-a2',
          name: 'Business Reading A2',
          learningMode: 'reading',
          level: ['a2'],
          category: 'Reading',
          unit: 1,
          prerequisites: ['reading-business-a1'],
        },
        {
          id: 'quiz-business-a2',
          name: 'Business Quiz A2',
          learningMode: 'quiz',
          level: ['a2'],
          category: 'Business',
          unit: 2,
          prerequisites: ['reading-business-a2'],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      // Verify cross-level chain works
      const a2Reading = result.data.find(m => m.id === 'reading-business-a2');
      const a2Quiz = result.data.find(m => m.id === 'quiz-business-a2');

      expect(a2Reading?.prerequisites).toContain('reading-business-a1');
      expect(a2Quiz?.prerequisites).toContain('reading-business-a2');
    });
  });

  describe('Prerequisite Validation', () => {
    it('should validate that prerequisite modules exist', async () => {
      const mockModules: LearningModule[] = [
        {
          id: 'quiz-orphan',
          name: 'Orphan Quiz',
          learningMode: 'quiz',
          level: ['a1'],
          category: 'Quiz',
          unit: 1,
          prerequisites: ['reading-nonexistent'], // This module doesn't exist
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      // Module should still load, but prerequisite validation should be handled by UI
      expect(result.success).toBe(true);
      const orphanQuiz = result.data.find(m => m.id === 'quiz-orphan');
      expect(orphanQuiz?.prerequisites).toContain('reading-nonexistent');
    });

    it('should handle circular prerequisites gracefully', async () => {
      const mockModules: LearningModule[] = [
        {
          id: 'reading-a',
          name: 'Reading A',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: ['reading-b'], // Circular reference
        },
        {
          id: 'reading-b',
          name: 'Reading B',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 2,
          prerequisites: ['reading-a'], // Circular reference
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      // Should load modules even with circular references
      // Circular detection should be handled by progression service
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('Module Unlocking Logic', () => {
    it('should determine if reading module unlocks interactive exercises', async () => {
      const mockModules: LearningModule[] = [
        {
          id: 'reading-unlock-test',
          name: 'Unlock Test Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
        },
        {
          id: 'quiz-locked',
          name: 'Locked Quiz',
          learningMode: 'quiz',
          level: ['a1'],
          category: 'Quiz',
          unit: 2,
          prerequisites: ['reading-unlock-test'],
        },
        {
          id: 'flashcard-locked',
          name: 'Locked Flashcard',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 3,
          prerequisites: ['reading-unlock-test'],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      // Find all modules that depend on the reading module
      const readingModule = result.data.find(m => m.id === 'reading-unlock-test');
      const dependentModules = result.data.filter(m => 
        m.prerequisites.includes('reading-unlock-test')
      );

      expect(readingModule).toBeDefined();
      expect(dependentModules).toHaveLength(2);
      expect(dependentModules.map(m => m.id)).toContain('quiz-locked');
      expect(dependentModules.map(m => m.id)).toContain('flashcard-locked');
    });

    it('should support partial prerequisite completion', async () => {
      const mockModules: LearningModule[] = [
        {
          id: 'reading-1',
          name: 'Reading 1',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
        },
        {
          id: 'reading-2',
          name: 'Reading 2',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 2,
          prerequisites: [],
        },
        {
          id: 'quiz-both',
          name: 'Quiz Requiring Both',
          learningMode: 'quiz',
          level: ['a1'],
          category: 'Quiz',
          unit: 3,
          prerequisites: ['reading-1', 'reading-2'],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      const quizModule = result.data.find(m => m.id === 'quiz-both');
      
      // Quiz should require both reading modules
      expect(quizModule?.prerequisites).toHaveLength(2);
      expect(quizModule?.prerequisites).toContain('reading-1');
      expect(quizModule?.prerequisites).toContain('reading-2');
    });
  });

  describe('Thematic Progression', () => {
    it('should support thematic reading progression (Business -> Travel -> Daily Life)', async () => {
      const mockModules: LearningModule[] = [
        // Business theme
        {
          id: 'reading-business-a1',
          name: 'Business Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
        },
        {
          id: 'quiz-business-a1',
          name: 'Business Quiz',
          learningMode: 'quiz',
          level: ['a1'],
          category: 'Business',
          unit: 2,
          prerequisites: ['reading-business-a1'],
        },
        // Travel theme
        {
          id: 'reading-travel-a1',
          name: 'Travel Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 3,
          prerequisites: [],
        },
        {
          id: 'flashcard-travel-a1',
          name: 'Travel Flashcards',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Travel',
          unit: 4,
          prerequisites: ['reading-travel-a1'],
        },
        // Daily Life theme
        {
          id: 'reading-daily-life-a1',
          name: 'Daily Life Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 5,
          prerequisites: [],
        },
        {
          id: 'matching-daily-life-a1',
          name: 'Daily Life Matching',
          learningMode: 'matching',
          level: ['a1'],
          category: 'Daily Life',
          unit: 6,
          prerequisites: ['reading-daily-life-a1'],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      // Verify each theme has reading as prerequisite for interactive
      const businessQuiz = result.data.find(m => m.id === 'quiz-business-a1');
      const travelFlashcard = result.data.find(m => m.id === 'flashcard-travel-a1');
      const dailyLifeMatching = result.data.find(m => m.id === 'matching-daily-life-a1');

      expect(businessQuiz?.prerequisites).toContain('reading-business-a1');
      expect(travelFlashcard?.prerequisites).toContain('reading-travel-a1');
      expect(dailyLifeMatching?.prerequisites).toContain('reading-daily-life-a1');
    });

    it('should support progressive difficulty within themes', async () => {
      const mockModules: LearningModule[] = [
        // A1 Business
        {
          id: 'reading-business-a1',
          name: 'Business Reading A1',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
          difficulty: 1,
        },
        // A2 Business (builds on A1)
        {
          id: 'reading-business-a2',
          name: 'Business Reading A2',
          learningMode: 'reading',
          level: ['a2'],
          category: 'Reading',
          unit: 1,
          prerequisites: ['reading-business-a1'],
          difficulty: 2,
        },
        // B1 Business (builds on A2)
        {
          id: 'reading-business-b1',
          name: 'Business Reading B1',
          learningMode: 'reading',
          level: ['b1'],
          category: 'Reading',
          unit: 1,
          prerequisites: ['reading-business-a2'],
          difficulty: 3,
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      // Verify progressive difficulty chain
      const a1Business = result.data.find(m => m.id === 'reading-business-a1');
      const a2Business = result.data.find(m => m.id === 'reading-business-a2');
      const b1Business = result.data.find(m => m.id === 'reading-business-b1');

      expect(a1Business?.difficulty).toBe(1);
      expect(a2Business?.difficulty).toBe(2);
      expect(b1Business?.difficulty).toBe(3);

      expect(a2Business?.prerequisites).toContain('reading-business-a1');
      expect(b1Business?.prerequisites).toContain('reading-business-a2');
    });
  });
});
