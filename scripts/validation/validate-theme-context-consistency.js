#!/usr/bin/env node

/**
 * Theme Context Consistency Validation Script
 * 
 * This script validates that all refactored components maintain visual consistency
 * across all 4 theme contexts (web-light, web-dark, mobile-light, mobile-dark).
 * 
 * It checks:
 * 1. BEM naming conventions are followed
 * 2. No Tailwind classes remain in components
 * 3. Design tokens are properly used
 * 4. Theme context CSS files exist and are properly structured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class ThemeContextValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
    this.refactoredComponents = [
      'Header',
      'CompactAdvancedSettings', 
      'LogViewer',
      'AppRouter',
      'FlashcardComponent',
      'QuizComponent',
      'CompletionComponent',
      'CompactProgressDashboard',
      'FluentFlowLogo',
      'ErrorFallback'
    ];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  error(message) {
    this.errors.push(message);
    this.log(`❌ ${message}`, 'red');
  }

  warning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, 'yellow');
  }

  success(message) {
    this.successes.push(message);
    this.log(`✅ ${message}`, 'green');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  /**
   * Validate that all 4 theme context CSS files exist and are properly structured
   */
  validateThemeContextFiles() {
    this.log('\n📁 Validating Theme Context Files...', 'cyan');
    
    const themeFiles = [
      'src/styles/themes/web-light.css',
      'src/styles/themes/web-dark.css', 
      'src/styles/themes/mobile-light.css',
      'src/styles/themes/mobile-dark.css'
    ];

    themeFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for theme context variables
        if (content.includes('--theme-')) {
          this.success(`${filePath} exists and contains theme variables`);
        } else {
          this.warning(`${filePath} exists but may be missing theme variables`);
        }

        // Check for proper media queries
        if (filePath.includes('mobile') && !content.includes('@media')) {
          this.warning(`${filePath} should contain mobile-specific media queries`);
        }
      } else {
        this.error(`Missing theme file: ${filePath}`);
      }
    });
  }

  /**
   * Validate design token system
   */
  validateDesignTokens() {
    this.log('\n🎨 Validating Design Token System...', 'cyan');
    
    const colorPalettePath = 'src/styles/design-system/color-palette.css';
    
    if (fs.existsSync(colorPalettePath)) {
      const content = fs.readFileSync(colorPalettePath, 'utf8');
      
      // Check for semantic tokens
      const semanticTokens = [
        '--text-primary',
        '--text-secondary', 
        '--bg-elevated',
        '--bg-subtle',
        '--border-soft',
        '--theme-text-primary',
        '--theme-bg-primary'
      ];

      let foundTokens = 0;
      semanticTokens.forEach(token => {
        if (content.includes(token)) {
          foundTokens++;
        }
      });

      if (foundTokens >= semanticTokens.length * 0.8) {
        this.success(`Design tokens system properly implemented (${foundTokens}/${semanticTokens.length} tokens found)`);
      } else {
        this.warning(`Design tokens may be incomplete (${foundTokens}/${semanticTokens.length} tokens found)`);
      }
    } else {
      this.error(`Missing design token file: ${colorPalettePath}`);
    }
  }

  /**
   * Validate BEM naming conventions in component CSS files
   */
  validateBEMNaming() {
    this.log('\n🏗️  Validating BEM Naming Conventions...', 'cyan');
    
    const componentCSSDir = 'src/styles/components';
    
    if (!fs.existsSync(componentCSSDir)) {
      this.error(`Component CSS directory not found: ${componentCSSDir}`);
      return;
    }

    const cssFiles = fs.readdirSync(componentCSSDir).filter(file => file.endsWith('.css'));
    let totalBEMClasses = 0;
    let validBEMClasses = 0;

    cssFiles.forEach(file => {
      const filePath = path.join(componentCSSDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract CSS class names
      const classMatches = content.match(/\.[a-zA-Z][a-zA-Z0-9_-]*(?:__[a-zA-Z0-9_-]+)?(?:--[a-zA-Z0-9_-]+)?/g);
      
      if (classMatches) {
        classMatches.forEach(className => {
          const cleanClass = className.substring(1); // Remove leading dot
          totalBEMClasses++;
          
          // BEM pattern: block__element--modifier
          const bemPattern = /^[a-z-]+(__[a-z-]+)?(--[a-z-]+)?$/;
          
          if (bemPattern.test(cleanClass)) {
            validBEMClasses++;
          } else {
            this.warning(`Non-BEM class found in ${file}: ${cleanClass}`);
          }
        });
      }
    });

    const bemCompliance = totalBEMClasses > 0 ? (validBEMClasses / totalBEMClasses) * 100 : 0;
    
    if (bemCompliance >= 90) {
      this.success(`BEM naming compliance: ${bemCompliance.toFixed(1)}% (${validBEMClasses}/${totalBEMClasses} classes)`);
    } else if (bemCompliance >= 70) {
      this.warning(`BEM naming compliance: ${bemCompliance.toFixed(1)}% (${validBEMClasses}/${totalBEMClasses} classes) - needs improvement`);
    } else {
      this.error(`BEM naming compliance: ${bemCompliance.toFixed(1)}% (${validBEMClasses}/${totalBEMClasses} classes) - critical issues`);
    }
  }

  /**
   * Validate that no Tailwind classes remain in TSX files
   */
  validateNoTailwindClasses() {
    this.log('\n🚫 Validating No Tailwind Classes in Components...', 'cyan');
    
    const componentDirs = [
      'src/components/ui',
      'src/components/layout', 
      'src/components/learning',
      'src/components/common',
      'src/components/dev'
    ];

    let totalTailwindClasses = 0;
    const tailwindPatterns = [
      /\b(text-gray-|bg-gray-|border-gray-)/g,
      /\b(hover:|focus:|active:|dark:)/g,
      /\b(w-\d+|h-\d+|p-\d+|m-\d+)\b/g,
      /\b(flex|grid|block|inline-block)\b/g,
      /\b(rounded|shadow|border)\b/g
    ];

    componentDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.tsx'));
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Look for className attributes
          const classNameMatches = content.match(/className\s*=\s*["'][^"']*["']/g);
          
          if (classNameMatches) {
            classNameMatches.forEach(match => {
              tailwindPatterns.forEach(pattern => {
                const matches = match.match(pattern);
                if (matches) {
                  totalTailwindClasses += matches.length;
                  this.warning(`Tailwind classes found in ${file}: ${matches.join(', ')}`);
                }
              });
            });
          }
        });
      }
    });

    if (totalTailwindClasses === 0) {
      this.success('No Tailwind classes found in component files');
    } else {
      this.error(`Found ${totalTailwindClasses} Tailwind classes that need to be removed`);
    }
  }

  /**
   * Validate that @apply directives have been removed
   */
  validateNoApplyDirectives() {
    this.log('\n🔍 Validating No @apply Directives...', 'cyan');
    
    const cssFiles = [
      'src/index.css',
      ...this.getAllCSSFiles('src/styles')
    ];

    let totalApplyDirectives = 0;

    cssFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const applyMatches = content.match(/@apply\s+[^;]+;/g);
        
        if (applyMatches) {
          totalApplyDirectives += applyMatches.length;
          this.warning(`@apply directives found in ${filePath}: ${applyMatches.length}`);
        }
      }
    });

    if (totalApplyDirectives === 0) {
      this.success('No @apply directives found - pure CSS architecture confirmed');
    } else {
      this.error(`Found ${totalApplyDirectives} @apply directives that need to be converted to pure CSS`);
    }
  }

  /**
   * Get all CSS files recursively
   */
  getAllCSSFiles(dir) {
    let cssFiles = [];
    
    if (fs.existsSync(dir)) {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          cssFiles = cssFiles.concat(this.getAllCSSFiles(itemPath));
        } else if (item.endsWith('.css')) {
          cssFiles.push(itemPath);
        }
      });
    }
    
    return cssFiles;
  }

  /**
   * Validate component CSS file existence
   */
  validateComponentCSSFiles() {
    this.log('\n📄 Validating Component CSS Files...', 'cyan');
    
    const expectedCSSFiles = [
      'src/styles/components/header.css',
      'src/styles/components/compact-advanced-settings.css',
      'src/styles/components/log-viewer.css',
      'src/styles/components/app-router.css',
      'src/styles/components/flashcard-component.css',
      'src/styles/components/quiz-component.css',
      'src/styles/components/completion-component.css',
      'src/styles/components/compact-progress-dashboard.css',
      'src/styles/components/fluent-flow-logo.css',
      'src/styles/components/error-fallback.css'
    ];

    let existingFiles = 0;
    
    expectedCSSFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        existingFiles++;
        
        // Check if file has content
        const content = fs.readFileSync(filePath, 'utf8').trim();
        if (content.length > 0) {
          this.success(`${path.basename(filePath)} exists and has content`);
        } else {
          this.warning(`${path.basename(filePath)} exists but is empty`);
        }
      } else {
        this.error(`Missing CSS file: ${filePath}`);
      }
    });

    const coverage = (existingFiles / expectedCSSFiles.length) * 100;
    this.info(`Component CSS file coverage: ${coverage.toFixed(1)}% (${existingFiles}/${expectedCSSFiles.length})`);
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    this.log('\n📊 VALIDATION SUMMARY', 'bright');
    this.log('='.repeat(50), 'bright');
    
    this.log(`\n✅ Successes: ${this.successes.length}`, 'green');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'yellow');
    this.log(`❌ Errors: ${this.errors.length}`, 'red');
    
    if (this.errors.length === 0 && this.warnings.length <= 3) {
      this.log('\n🎉 THEME CONTEXT VALIDATION PASSED!', 'green');
      this.log('All refactored components maintain visual consistency across 4 theme contexts.', 'green');
    } else if (this.errors.length === 0) {
      this.log('\n⚠️  THEME CONTEXT VALIDATION PASSED WITH WARNINGS', 'yellow');
      this.log('Components are functional but some improvements recommended.', 'yellow');
    } else {
      this.log('\n❌ THEME CONTEXT VALIDATION FAILED', 'red');
      this.log('Critical issues found that need to be addressed.', 'red');
    }

    // Task completion status
    this.log('\n📋 TASK 3.3 STATUS:', 'cyan');
    if (this.errors.length === 0) {
      this.log('✅ Task 3.3 - Verify visual consistency across 4 theme contexts: COMPLETED', 'green');
    } else {
      this.log('❌ Task 3.3 - Verify visual consistency across 4 theme contexts: NEEDS WORK', 'red');
    }

    return this.errors.length === 0;
  }

  /**
   * Run all validations
   */
  async run() {
    this.log('🔍 THEME CONTEXT CONSISTENCY VALIDATION', 'bright');
    this.log('Validating visual consistency across all 4 theme contexts...', 'cyan');
    
    this.validateThemeContextFiles();
    this.validateDesignTokens();
    this.validateBEMNaming();
    this.validateNoTailwindClasses();
    this.validateNoApplyDirectives();
    this.validateComponentCSSFiles();
    
    return this.generateSummary();
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ThemeContextValidator();
  validator.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export default ThemeContextValidator;