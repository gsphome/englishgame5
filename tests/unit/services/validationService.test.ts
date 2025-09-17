import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationService, validationService, createValidationService } from '../../../src/services/validationService';
import type { LearningModule, FlashcardData } from '../../../src/types';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = new ValidationService();
  });

  describe('validateModule', () => {
    it('should validate a correct module', () => {
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
          front: 'Hello',
          back: 'Hola',
          ipa: '/həˈloʊ/',
          example: 'Hello, how are you?',
          example_es: 'Hola, ¿cómo estás?'
        } as FlashcardData)
      };

      const result = service.validateModule(validModule);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle strict mode with warnings', () => {
      const strictService = new ValidationService({ strictMode: true });

      const moduleWithWarnings: LearningModule = {
        id: 'flashcard-basic-vocabulary-a1',
        name: 'Basic Vocabulary',
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: [],
        data: Array(40).fill({
          id: '1',
          front: 'Hello',
          back: 'Hola'
          // Missing ipa and example - will generate warnings
        } as FlashcardData)
      };

      const result = strictService.validateModule(moduleWithWarnings);
      expect(result.success).toBe(false); // Warnings become errors in strict mode
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateModules', () => {
    it('should validate multiple modules and provide summary', () => {
      const validModule: LearningModule = {
        id: 'valid-module',
        name: 'Valid Module',
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: [],
        data: Array(40).fill({
          id: '1',
          front: 'Hello',
          back: 'Hola',
          ipa: '/həˈloʊ/',
          example: 'Hello, how are you?'
        } as FlashcardData)
      };

      const invalidModule: LearningModule = {
        id: 'invalid-module',
        name: 'Invalid Module',
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: [],
        data: Array(20).fill({ // Wrong count
          id: '1',
          front: 'Hello',
          back: 'Hola'
        } as FlashcardData)
      };

      const result = service.validateModules([validModule, invalidModule]);

      expect(result.overallSuccess).toBe(false);
      expect(result.summary.totalModules).toBe(2);
      expect(result.summary.validModules).toBe(1);
      expect(result.summary.invalidModules).toBe(1);
      expect(result.summary.totalErrors).toBeGreaterThan(0);
    });
  });

  describe('validatePrerequisitesChain', () => {
    it('should validate prerequisites chain', () => {
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

      const result = service.validatePrerequisitesChain(modules);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateModuleFileName', () => {
    it('should validate correct file name', () => {
      const module: LearningModule = {
        id: 'flashcard-basic-vocabulary-a1',
        name: 'Basic Vocabulary',
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: []
      };

      const result = service.validateModuleFileName(module, 'flashcard-basic-vocabulary-a1.json');
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for incorrect file name', () => {
      const module: LearningModule = {
        id: 'flashcard-basic-vocabulary-a1',
        name: 'Basic Vocabulary',
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: []
      };

      const result = service.validateModuleFileName(module, 'wrong-name.json');
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('configuration', () => {
    it('should use default configuration', () => {
      const config = service.getConfig();
      expect(config.strictMode).toBe(true);
      expect(config.requiredItemCount).toBe(40);
      expect(config.allowWarnings).toBe(true);
    });

    it('should allow configuration updates', () => {
      service.updateConfig({ strictMode: false });
      const config = service.getConfig();
      expect(config.strictMode).toBe(false);
      expect(config.requiredItemCount).toBe(40); // Should remain unchanged
    });
  });

  describe('factory functions', () => {
    it('should export default instance', () => {
      expect(validationService).toBeInstanceOf(ValidationService);
    });

    it('should create custom validation service', () => {
      const customService = createValidationService({ strictMode: false });
      expect(customService).toBeInstanceOf(ValidationService);
      expect(customService.getConfig().strictMode).toBe(false);
    });
  });
});