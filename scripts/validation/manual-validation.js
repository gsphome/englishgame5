#!/usr/bin/env node

/**
 * Manual Validation Script for English4 Controlled Evolution
 * Task 13: Validación Manual de Funcionalidad
 * 
 * This script validates:
 * - Loading and functionality of all A1 modules
 * - Loading and functionality of all A2 modules  
 * - Loading and functionality of all B1 modules
 * - Existing B2-C2 modules still work
 * - Prerequisites system works correctly
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ValidationResults {
  constructor() {
    this.results = {
      a1: { passed: 0, failed: 0, errors: [] },
      a2: { passed: 0, failed: 0, errors: [] },
      b1: { passed: 0, failed: 0, errors: [] },
      b2: { passed: 0, failed: 0, errors: [] },
      c1: { passed: 0, failed: 0, errors: [] },
      c2: { passed: 0, failed: 0, errors: [] },
      prerequisites: { passed: 0, failed: 0, errors: [] }
    };
  }

  addResult(level, success, error = null) {
    if (success) {
      this.results[level].passed++;
    } else {
      this.results[level].failed++;
      if (error) {
        this.results[level].errors.push(error);
      }
    }
  }

  printSummary() {
    console.log(`\n${colors.bold}${colors.blue}=== VALIDATION SUMMARY ===${colors.reset}\n`);
    
    Object.entries(this.results).forEach(([level, result]) => {
      const total = result.passed + result.failed;
      const status = result.failed === 0 ? 
        `${colors.green}✅ PASSED${colors.reset}` : 
        `${colors.red}❌ FAILED${colors.reset}`;
      
      console.log(`${level.toUpperCase()}: ${status} (${result.passed}/${total})`);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`  ${colors.red}• ${error}${colors.reset}`);
        });
      }
    });

    const totalPassed = Object.values(this.results).reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, r) => sum + r.failed, 0);
    const overallStatus = totalFailed === 0 ? 
      `${colors.green}✅ ALL TESTS PASSED${colors.reset}` : 
      `${colors.red}❌ ${totalFailed} TESTS FAILED${colors.reset}`;

    console.log(`\n${colors.bold}OVERALL: ${overallStatus} (${totalPassed}/${totalPassed + totalFailed})${colors.reset}\n`);
  }
}

class ModuleValidator {
  constructor() {
    this.results = new ValidationResults();
    this.publicDataPath = path.join(process.cwd(), 'public', 'data');
  }

  async validateModule(moduleInfo) {
    try {
      console.log(`${colors.blue}Validating: ${moduleInfo.name} (${moduleInfo.id})${colors.reset}`);
      
      // Check if data file exists
      const dataPath = path.join(this.publicDataPath, moduleInfo.dataPath.replace('data/', ''));
      
      try {
        await fs.access(dataPath);
      } catch (error) {
        throw new Error(`Data file not found: ${dataPath}`);
      }

      // Load and validate data structure
      const dataContent = await fs.readFile(dataPath, 'utf-8');
      const data = JSON.parse(dataContent);

      // Validate based on learning mode
      await this.validateDataStructure(data, moduleInfo);

      console.log(`  ${colors.green}✅ Module validation passed${colors.reset}`);
      return true;

    } catch (error) {
      console.log(`  ${colors.red}❌ Module validation failed: ${error.message}${colors.reset}`);
      return false;
    }
  }

  async validateDataStructure(data, moduleInfo) {
    const { learningMode } = moduleInfo;

    // Check if data is array (except for sorting which can be object)
    if (learningMode !== 'sorting' && !Array.isArray(data)) {
      throw new Error(`Data should be an array for ${learningMode} modules`);
    }

    // Check item count (should be 40 for all modules)
    const itemCount = learningMode === 'sorting' ? data.data?.length || 0 : data.length;
    if (itemCount !== 40) {
      throw new Error(`Expected 40 items, found ${itemCount}`);
    }

    // Validate structure based on learning mode
    switch (learningMode) {
      case 'flashcard':
        this.validateFlashcardStructure(data);
        break;
      case 'completion':
        this.validateCompletionStructure(data);
        break;
      case 'quiz':
        this.validateQuizStructure(data);
        break;
      case 'matching':
        this.validateMatchingStructure(data);
        break;
      case 'sorting':
        this.validateSortingStructure(data);
        break;
      default:
        throw new Error(`Unknown learning mode: ${learningMode}`);
    }
  }

  validateFlashcardStructure(data) {
    data.forEach((item, index) => {
      if (!item.en || !item.es) {
        throw new Error(`Flashcard item ${index} missing required fields (en, es)`);
      }
    });
  }

  validateCompletionStructure(data) {
    data.forEach((item, index) => {
      if (!item.sentence || !item.correct || !item.explanation) {
        throw new Error(`Completion item ${index} missing required fields`);
      }
      if (!item.sentence.includes('______')) {
        throw new Error(`Completion item ${index} missing 6 underscores in sentence`);
      }
    });
  }

  validateQuizStructure(data) {
    data.forEach((item, index) => {
      if (!item.question || !item.options || !item.correct || !item.explanation) {
        throw new Error(`Quiz item ${index} missing required fields`);
      }
      if (!Array.isArray(item.options) || item.options.length < 2) {
        throw new Error(`Quiz item ${index} needs at least 2 options`);
      }
      if (typeof item.correct !== 'string') {
        throw new Error(`Quiz item ${index} correct answer should be string, not index`);
      }
    });
  }

  validateMatchingStructure(data) {
    data.forEach((item, index) => {
      // Support both old {term, definition} and new {left, right} formats
      const hasOldFormat = item.term && item.definition;
      const hasNewFormat = item.left && item.right;
      
      if (!hasOldFormat && !hasNewFormat) {
        throw new Error(`Matching item ${index} missing required fields (term/definition or left/right)`);
      }
    });
  }

  validateSortingStructure(data) {
    if (!data.categories || !data.data) {
      throw new Error('Sorting module missing categories or data');
    }
    if (!Array.isArray(data.categories) || !Array.isArray(data.data)) {
      throw new Error('Sorting categories and data should be arrays');
    }
    data.data.forEach((item, index) => {
      if (!item.text || !item.category) {
        throw new Error(`Sorting item ${index} missing text or category`);
      }
    });
  }

  async validatePrerequisites(modules) {
    console.log(`\n${colors.bold}${colors.blue}=== VALIDATING PREREQUISITES SYSTEM ===${colors.reset}\n`);

    // Test prerequisite chains
    const testCases = [
      {
        name: 'A1 Foundation Chain',
        modules: modules.filter(m => m.level.includes('a1')),
        expectedOrder: [
          'flashcard-basic-vocabulary-a1',
          'matching-basic-grammar-a1', 
          'matching-numbers-quantities-a1',
          'completion-basic-sentences-a1',
          'quiz-basic-review-a1'
        ]
      },
      {
        name: 'A2 Building Blocks Chain',
        modules: modules.filter(m => m.level.includes('a2')),
        startsWith: 'quiz-basic-review-a1'
      },
      {
        name: 'B1 Communication Chain', 
        modules: modules.filter(m => m.level.includes('b1')),
        startsWith: 'quiz-elementary-review-a2'
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`${colors.blue}Testing: ${testCase.name}${colors.reset}`);
        
        if (testCase.expectedOrder) {
          // Validate exact order for A1
          this.validateExactOrder(testCase.modules, testCase.expectedOrder);
        } else {
          // Validate that chain starts correctly
          this.validateChainStart(testCase.modules, testCase.startsWith);
        }

        console.log(`  ${colors.green}✅ Prerequisites validation passed${colors.reset}`);
        this.results.addResult('prerequisites', true);

      } catch (error) {
        console.log(`  ${colors.red}❌ Prerequisites validation failed: ${error.message}${colors.reset}`);
        this.results.addResult('prerequisites', false, error.message);
      }
    }
  }

  validateExactOrder(modules, expectedOrder) {
    const moduleMap = new Map(modules.map(m => [m.id, m]));
    
    for (let i = 0; i < expectedOrder.length; i++) {
      const moduleId = expectedOrder[i];
      const module = moduleMap.get(moduleId);
      
      if (!module) {
        throw new Error(`Module ${moduleId} not found`);
      }

      if (i === 0) {
        // First module should have no prerequisites
        if (module.prerequisites && module.prerequisites.length > 0) {
          throw new Error(`First module ${moduleId} should have no prerequisites`);
        }
      } else {
        // Subsequent modules should depend on previous one
        const previousModuleId = expectedOrder[i - 1];
        if (!module.prerequisites || !module.prerequisites.includes(previousModuleId)) {
          throw new Error(`Module ${moduleId} should depend on ${previousModuleId}`);
        }
      }
    }
  }

  validateChainStart(modules, expectedStart) {
    const firstModule = modules.find(m => 
      m.prerequisites && m.prerequisites.includes(expectedStart)
    );
    
    if (!firstModule) {
      throw new Error(`No module found that depends on ${expectedStart}`);
    }
  }

  async validateLevel(level, modules) {
    console.log(`\n${colors.bold}${colors.blue}=== VALIDATING ${level.toUpperCase()} MODULES ===${colors.reset}\n`);
    
    const levelModules = modules.filter(m => m.level.includes(level));
    console.log(`Found ${levelModules.length} ${level.toUpperCase()} modules\n`);

    for (const module of levelModules) {
      const success = await this.validateModule(module);
      this.results.addResult(level, success, success ? null : `${module.id} validation failed`);
    }
  }

  async run() {
    try {
      console.log(`${colors.bold}${colors.blue}English4 Controlled Evolution - Manual Validation${colors.reset}\n`);
      console.log(`${colors.yellow}Task 13: Validación Manual de Funcionalidad${colors.reset}\n`);

      // Load learning modules
      const modulesPath = path.join(this.publicDataPath, 'learningModules.json');
      const modulesContent = await fs.readFile(modulesPath, 'utf-8');
      const modules = JSON.parse(modulesContent);

      console.log(`Loaded ${modules.length} total modules\n`);

      // Validate each level
      await this.validateLevel('a1', modules);
      await this.validateLevel('a2', modules);
      await this.validateLevel('b1', modules);
      await this.validateLevel('b2', modules);
      await this.validateLevel('c1', modules);
      await this.validateLevel('c2', modules);

      // Validate prerequisites system
      await this.validatePrerequisites(modules);

      // Print final summary
      this.results.printSummary();

      // Exit with appropriate code
      const totalFailed = Object.values(this.results.results).reduce((sum, r) => sum + r.failed, 0);
      process.exit(totalFailed === 0 ? 0 : 1);

    } catch (error) {
      console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ModuleValidator();
  validator.run();
}

export default ModuleValidator;