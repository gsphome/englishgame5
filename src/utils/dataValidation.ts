import type {
  LearningModule,
  LearningData,
  FlashcardData,
  QuizData,
  CompletionData,
  SortingData,
  MatchingData,
  DifficultyLevel,
  LearningMode,
  ValidationResult,
} from '../types';

// Re-export ValidationResult for external use
export type { ValidationResult } from '../types';

// Base validation utilities
export class DataValidator {
  private static readonly REQUIRED_ITEM_COUNT = 40;
  private static readonly VALID_UNITS = [1, 2, 3, 4, 5, 6];
  private static readonly COMPLETION_BLANK_PATTERN = /_{6}/; // Exactly 6 underscores

  /**
   * Validates a complete learning module
   */
  static validateModule(module: LearningModule): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!module.id || typeof module.id !== 'string') {
      errors.push('Module must have a valid string id');
    }

    if (!module.name || typeof module.name !== 'string') {
      errors.push('Module must have a valid string name');
    }

    if (!module.learningMode) {
      errors.push('Module must have a learningMode');
    }

    if (!module.category) {
      errors.push('Module must have a category');
    }

    // Unit validation
    if (!module.unit || !this.VALID_UNITS.includes(module.unit)) {
      errors.push(`Module unit must be between 1-6, got: ${module.unit}`);
    }

    // Prerequisites validation
    if (!Array.isArray(module.prerequisites)) {
      errors.push('Module prerequisites must be an array');
    }

    // Data validation
    if (module.data) {
      const dataValidation = this.validateModuleData(module.data, module.learningMode, module.id);
      errors.push(...dataValidation.errors);
      if (dataValidation.warnings) {
        warnings.push(...dataValidation.warnings);
      }
    }

    // Data count validation
    if (module.data && module.data.length !== this.REQUIRED_ITEM_COUNT) {
      errors.push(
        `Module must have exactly ${this.REQUIRED_ITEM_COUNT} items, found ${module.data.length}`
      );
    }

    return {
      success: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates module data based on learning mode
   */
  static validateModuleData(
    data: LearningData[],
    learningMode: LearningMode,
    moduleId: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    data.forEach((item, index) => {
      const itemValidation = this.validateDataItem(item, learningMode, `${moduleId}[${index}]`);
      errors.push(...itemValidation.errors);
      if (itemValidation.warnings) {
        warnings.push(...itemValidation.warnings);
      }
    });

    return {
      success: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates individual data items based on type
   */
  static validateDataItem(
    item: LearningData,
    learningMode: LearningMode,
    itemId: string
  ): ValidationResult {
    switch (learningMode) {
      case 'flashcard':
        return this.validateFlashcardData(item as FlashcardData, itemId);
      case 'quiz':
        return this.validateQuizData(item as QuizData, itemId);
      case 'completion':
        return this.validateCompletionData(item as CompletionData, itemId);
      case 'sorting':
        return this.validateSortingData(item as SortingData, itemId);
      case 'matching':
        return this.validateMatchingData(item as MatchingData, itemId);
      default:
        return {
          success: false,
          errors: [`Unknown learning mode: ${learningMode} for item ${itemId}`],
        };
    }
  }

  /**
   * Validates flashcard data format
   */
  static validateFlashcardData(data: FlashcardData, itemId: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.en || typeof data.en !== 'string') {
      errors.push(`${itemId}: Flashcard must have valid 'en' field`);
    }

    if (!data.es || typeof data.es !== 'string') {
      errors.push(`${itemId}: Flashcard must have valid 'es' field`);
    }

    // Optional but recommended fields
    if (!data.ipa) {
      warnings.push(`${itemId}: Flashcard missing IPA pronunciation`);
    }

    if (!data.example) {
      warnings.push(`${itemId}: Flashcard missing example sentence`);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates quiz data format
   */
  static validateQuizData(data: QuizData, itemId: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Must have either question, sentence, or idiom
    if (!data.question && !data.sentence && !data.idiom) {
      errors.push(`${itemId}: Quiz must have 'question', 'sentence', or 'idiom' field`);
    }

    if (!Array.isArray(data.options) || data.options.length < 2) {
      errors.push(`${itemId}: Quiz must have at least 2 options`);
    }

    // Validate correct answer format (must be string, not index)
    if (typeof data.correct !== 'string') {
      errors.push(`${itemId}: Quiz 'correct' field must be a string value, not an index`);
    }

    // Validate that correct answer exists in options
    if (typeof data.correct === 'string' && !data.options.includes(data.correct)) {
      errors.push(`${itemId}: Quiz correct answer '${data.correct}' not found in options`);
    }

    if (!data.explanation) {
      warnings.push(`${itemId}: Quiz missing explanation`);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates completion data format
   */
  static validateCompletionData(data: CompletionData, itemId: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.sentence || typeof data.sentence !== 'string') {
      errors.push(`${itemId}: Completion must have valid 'sentence' field`);
    }

    // Validate exactly 6 underscores for blanks
    if (data.sentence && !this.COMPLETION_BLANK_PATTERN.test(data.sentence)) {
      errors.push(
        `${itemId}: Completion sentence must contain exactly 6 underscores (______) for blanks`
      );
    }

    // Must use 'correct' field, not 'answer'
    if (!data.correct || typeof data.correct !== 'string') {
      errors.push(`${itemId}: Completion must have valid 'correct' field (not 'answer')`);
    }

    if (!data.explanation) {
      warnings.push(`${itemId}: Completion missing explanation`);
    }

    if (!data.tip) {
      warnings.push(`${itemId}: Completion missing tip`);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates sorting data format
   */
  static validateSortingData(data: SortingData, itemId: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.word || typeof data.word !== 'string') {
      errors.push(`${itemId}: Sorting must have valid 'word' field`);
    }

    if (!data.category) {
      errors.push(`${itemId}: Sorting must have valid 'category' field`);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates matching data format
   */
  static validateMatchingData(data: MatchingData, itemId: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.left || typeof data.left !== 'string') {
      errors.push(`${itemId}: Matching must have valid 'left' field`);
    }

    if (!data.right || typeof data.right !== 'string') {
      errors.push(`${itemId}: Matching must have valid 'right' field`);
    }

    // Type is now optional but recommended
    if (!data.type) {
      warnings.push(`${itemId}: Matching missing 'type' field for better categorization`);
    }

    // Explanation is optional but recommended
    if (!data.explanation) {
      warnings.push(`${itemId}: Matching missing 'explanation' field`);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates file naming convention
   */
  static validateFileName(
    fileName: string,
    expectedLearningMode: LearningMode,
    expectedLevel: DifficultyLevel
  ): ValidationResult {
    const errors: string[] = [];

    // Expected pattern: {type}-{tema}-{nivel}.json
    const pattern = new RegExp(`^${expectedLearningMode}-[a-z0-9-]+-${expectedLevel}\\.json$`);

    if (!pattern.test(fileName)) {
      errors.push(
        `File name '${fileName}' doesn't follow pattern: ${expectedLearningMode}-{tema}-${expectedLevel}.json`
      );
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates prerequisites chain
   */
  static validatePrerequisites(modules: LearningModule[]): ValidationResult {
    const errors: string[] = [];
    const moduleIds = new Set(modules.map(m => m.id));

    modules.forEach(module => {
      module.prerequisites.forEach(prereqId => {
        if (!moduleIds.has(prereqId)) {
          errors.push(
            `Module '${module.id}' has invalid prerequisite '${prereqId}' - module not found`
          );
        }
      });
    });

    return {
      success: errors.length === 0,
      errors,
    };
  }
}

// Utility functions for common validations
export const validateModuleStructure = (module: LearningModule): ValidationResult => {
  return DataValidator.validateModule(module);
};

export const validateModuleData = (
  data: LearningData[],
  learningMode: LearningMode,
  moduleId: string
): ValidationResult => {
  return DataValidator.validateModuleData(data, learningMode, moduleId);
};

export const validateFileName = (
  fileName: string,
  learningMode: LearningMode,
  level: DifficultyLevel
): ValidationResult => {
  return DataValidator.validateFileName(fileName, learningMode, level);
};

export const validatePrerequisitesChain = (modules: LearningModule[]): ValidationResult => {
  return DataValidator.validatePrerequisites(modules);
};
