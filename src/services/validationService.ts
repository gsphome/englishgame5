import { DataValidator, type ValidationResult } from '../utils/dataValidation';
import type { LearningModule, ValidationConfig } from '../types';

/**
 * Service for validating learning modules and data
 */
export class ValidationService {
  private static readonly DEFAULT_CONFIG: ValidationConfig = {
    strictMode: true,
    requiredItemCount: 40,
    allowWarnings: true
  };

  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...ValidationService.DEFAULT_CONFIG, ...config };
  }

  /**
   * Validates a single module with current configuration
   */
  validateModule(module: LearningModule): ValidationResult {
    const result = DataValidator.validateModule(module);
    
    if (this.config.strictMode && result.warnings?.length) {
      // In strict mode, warnings become errors
      return {
        success: false,
        errors: [...result.errors, ...result.warnings],
        warnings: []
      };
    }

    return result;
  }

  /**
   * Validates multiple modules and returns a summary
   */
  validateModules(modules: LearningModule[]): {
    overallSuccess: boolean;
    results: Array<{ moduleId: string; result: ValidationResult }>;
    summary: {
      totalModules: number;
      validModules: number;
      invalidModules: number;
      totalErrors: number;
      totalWarnings: number;
    };
  } {
    const results = modules.map(module => ({
      moduleId: module.id,
      result: this.validateModule(module)
    }));

    const validModules = results.filter(r => r.result.success).length;
    const totalErrors = results.reduce((sum, r) => sum + r.result.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + (r.result.warnings?.length || 0), 0);

    return {
      overallSuccess: validModules === modules.length,
      results,
      summary: {
        totalModules: modules.length,
        validModules,
        invalidModules: modules.length - validModules,
        totalErrors,
        totalWarnings
      }
    };
  }

  /**
   * Validates prerequisites chain for all modules
   */
  validatePrerequisitesChain(modules: LearningModule[]): ValidationResult {
    return DataValidator.validatePrerequisites(modules);
  }

  /**
   * Validates file naming conventions for a module
   */
  validateModuleFileName(module: LearningModule, fileName: string): ValidationResult {
    const level = Array.isArray(module.level) ? module.level[0] : module.level;
    return DataValidator.validateFileName(fileName, module.learningMode, level);
  }

  /**
   * Gets validation configuration
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }

  /**
   * Updates validation configuration
   */
  updateConfig(newConfig: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export a default instance for convenience
export const validationService = new ValidationService();

// Export factory function for custom configurations
export const createValidationService = (config?: Partial<ValidationConfig>) => {
  return new ValidationService(config);
};