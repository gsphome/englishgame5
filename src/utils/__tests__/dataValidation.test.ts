import { describe, it, expect } from 'vitest';
import { DataValidator, validateModuleStructure, validateModuleData } from '../dataValidation';
import type { LearningModule, FlashcardData, QuizData, CompletionData, MatchingData } from '../../types';

describe('DataValidator', () => {
  describe('validateModule', () => {
    it('should validate a complete valid module', () => {
      const validModule: LearningModule = {
        id: 'flashcard-basic-vocabulary-a1',
        name: 'Basic Vocabulary',
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: [],
        data: Array(40).fill({
          id: '1',
          en: 'Hello',
          es: 'Hola',
          ipa: '/həˈloʊ/',
          example: 'Hello, how are you?',
          example_es: 'Hola, ¿cómo estás?'
        } as FlashcardData)
      };

      const result = DataValidator.validateModule(validModule);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing required fields', () => {
      const invalidModule = {
        name: 'Test Module',
        // Missing id, learningMode, category, unit, prerequisites
      } as LearningModule;

      const result = DataValidator.validateModule(invalidModule);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Module must have a valid string id');
      expect(result.errors).toContain('Module must have a learningMode');
      expect(result.errors).toContain('Module must have a category');
      expect(result.errors).toContain('Module unit must be between 1-6, got: undefined');
      expect(result.errors).toContain('Module prerequisites must be an array');
    });

    it('should fail validation for invalid unit', () => {
      const invalidModule: LearningModule = {
        id: 'test',
        name: 'Test',
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 7, // Invalid unit
        prerequisites: []
      };

      const result = DataValidator.validateModule(invalidModule);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Module unit must be between 1-6, got: 7');
    });

    it('should fail validation for wrong item count', () => {
      const invalidModule: LearningModule = {
        id: 'test',
        name: 'Test',
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: [],
        data: Array(20).fill({ id: '1', en: 'test', es: 'prueba' } as FlashcardData) // Wrong count
      };

      const result = DataValidator.validateModule(invalidModule);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Module must have exactly 40 items, found 20');
    });
  });

  describe('validateFlashcardData', () => {
    it('should validate correct flashcard data', () => {
      const validData: FlashcardData = {
        id: '1',
        en: 'Hello',
        es: 'Hola',
        ipa: '/həˈloʊ/',
        example: 'Hello, how are you?',
        example_es: 'Hola, ¿cómo estás?'
      };

      const result = DataValidator.validateFlashcardData(validData, 'test[0]');
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing required fields', () => {
      const invalidData = {
        id: '1',
        // Missing en and es
      } as FlashcardData;

      const result = DataValidator.validateFlashcardData(invalidData, 'test[0]');
      expect(result.success).toBe(false);
      expect(result.errors).toContain("test[0]: Flashcard must have valid 'en' field");
      expect(result.errors).toContain("test[0]: Flashcard must have valid 'es' field");
    });

    it('should warn for missing optional fields', () => {
      const dataWithoutOptionals: FlashcardData = {
        id: '1',
        en: 'Hello',
        es: 'Hola'
        // Missing ipa and example
      };

      const result = DataValidator.validateFlashcardData(dataWithoutOptionals, 'test[0]');
      expect(result.success).toBe(true);
      expect(result.warnings).toContain('test[0]: Flashcard missing IPA pronunciation');
      expect(result.warnings).toContain('test[0]: Flashcard missing example sentence');
    });
  });

  describe('validateQuizData', () => {
    it('should validate correct quiz data', () => {
      const validData: QuizData = {
        id: '1',
        question: 'What is the correct form of "be" with "I"?',
        options: ['am', 'is', 'are', 'be'],
        correct: 'am',
        explanation: '"I am" is the correct form.'
      };

      const result = DataValidator.validateQuizData(validData, 'test[0]');
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for numeric correct answer', () => {
      const invalidData: QuizData = {
        id: '1',
        question: 'Test question?',
        options: ['am', 'is', 'are'],
        correct: 0 as any, // Should be string, not index
        explanation: 'Test explanation'
      };

      const result = DataValidator.validateQuizData(invalidData, 'test[0]');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('test[0]: Quiz \'correct\' field must be a string value, not an index');
    });

    it('should fail validation when correct answer not in options', () => {
      const invalidData: QuizData = {
        id: '1',
        question: 'Test question?',
        options: ['am', 'is', 'are'],
        correct: 'was', // Not in options
        explanation: 'Test explanation'
      };

      const result = DataValidator.validateQuizData(invalidData, 'test[0]');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('test[0]: Quiz correct answer \'was\' not found in options');
    });
  });

  describe('validateCompletionData', () => {
    it('should validate correct completion data', () => {
      const validData: CompletionData = {
        id: '1',
        sentence: 'I ______ a student.',
        correct: 'am',
        explanation: 'Use "am" with "I"',
        tip: 'Complete with the correct form of "be"'
      };

      const result = DataValidator.validateCompletionData(validData, 'test[0]');
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for wrong number of underscores', () => {
      const invalidData: CompletionData = {
        id: '1',
        sentence: 'I ___ a student.', // Only 3 underscores
        correct: 'am',
        explanation: 'Test explanation'
      };

      const result = DataValidator.validateCompletionData(invalidData, 'test[0]');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('test[0]: Completion sentence must contain exactly 6 underscores (______) for blanks');
    });

    it('should fail validation for missing correct field', () => {
      const invalidData = {
        id: '1',
        sentence: 'I ______ a student.',
        // Missing correct field
      } as CompletionData;

      const result = DataValidator.validateCompletionData(invalidData, 'test[0]');
      expect(result.success).toBe(false);
      expect(result.errors).toContain("test[0]: Completion must have valid 'correct' field (not 'answer')");
    });
  });

  describe('validateMatchingData', () => {
    it('should validate correct matching data', () => {
      const validData: MatchingData = {
        id: '1',
        left: 'Hello',
        right: 'Hola',
        explanation: 'Basic greeting',
        type: 'word-translation'
      };

      const result = DataValidator.validateMatchingData(validData, 'test[0]');
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing required fields', () => {
      const invalidData = {
        id: '1',
        // Missing left and right
      } as MatchingData;

      const result = DataValidator.validateMatchingData(invalidData, 'test[0]');
      expect(result.success).toBe(false);
      expect(result.errors).toContain("test[0]: Matching must have valid 'left' field");
      expect(result.errors).toContain("test[0]: Matching must have valid 'right' field");
    });

    it('should warn for missing optional fields', () => {
      const dataWithoutOptionals: MatchingData = {
        id: '1',
        left: 'Hello',
        right: 'Hola'
        // Missing type and explanation
      };

      const result = DataValidator.validateMatchingData(dataWithoutOptionals, 'test[0]');
      expect(result.success).toBe(true);
      expect(result.warnings).toContain("test[0]: Matching missing 'type' field for better categorization");
      expect(result.warnings).toContain("test[0]: Matching missing 'explanation' field");
    });
  });

  describe('validateFileName', () => {
    it('should validate correct file names', () => {
      const result = DataValidator.validateFileName('flashcard-basic-vocabulary-a1.json', 'flashcard', 'a1');
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for incorrect pattern', () => {
      const result = DataValidator.validateFileName('flashcard-basic-vocabulary.json', 'flashcard', 'a1');
      expect(result.success).toBe(false);
      expect(result.errors).toContain("File name 'flashcard-basic-vocabulary.json' doesn't follow pattern: flashcard-{tema}-a1.json");
    });
  });

  describe('validatePrerequisites', () => {
    it('should validate correct prerequisites chain', () => {
      const modules: LearningModule[] = [
        {
          id: 'module-a',
          name: 'Module A',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 1,
          prerequisites: []
        },
        {
          id: 'module-b',
          name: 'Module B',
          learningMode: 'quiz',
          level: ['a1'],
          category: 'Grammar',
          unit: 1,
          prerequisites: ['module-a']
        }
      ];

      const result = DataValidator.validatePrerequisites(modules);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid prerequisites', () => {
      const modules: LearningModule[] = [
        {
          id: 'module-a',
          name: 'Module A',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 1,
          prerequisites: ['non-existent-module']
        }
      ];

      const result = DataValidator.validatePrerequisites(modules);
      expect(result.success).toBe(false);
      expect(result.errors).toContain("Module 'module-a' has invalid prerequisite 'non-existent-module' - module not found");
    });
  });
});

describe('Utility functions', () => {
  it('should export validateModuleStructure', () => {
    const module: LearningModule = {
      id: 'test',
      name: 'Test',
      learningMode: 'flashcard',
      level: ['a1'],
      category: 'Vocabulary',
      unit: 1,
      prerequisites: []
    };

    const result = validateModuleStructure(module);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should export validateModuleData', () => {
    const data: FlashcardData[] = [{
      id: '1',
      en: 'Hello',
      es: 'Hola'
    }];

    const result = validateModuleData(data, 'flashcard', 'test-module');
    expect(result).toBeDefined();
  });
});