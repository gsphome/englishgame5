#!/usr/bin/env node

/**
 * AI Pattern Validation Script
 * 
 * Validates that CSS files follow AI-friendly patterns and documentation standards
 * Checks for proper AI_VALIDATION comments and design token usage
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI validation patterns to check for
const AI_VALIDATION_PATTERNS = {
  BEM_BLOCK: /\/\* AI_VALIDATION: BEM_BLOCK/,
  BEM_ELEMENT: /\/\* AI_VALIDATION: BEM_ELEMENT/,
  BEM_MODIFIER: /\/\* AI_VALIDATION: BEM_MODIFIER/,
  DESIGN_TOKEN_USAGE: /var\(--theme-[a-z-]+\)/g,
  THEME_CONTEXT_USAGE: /\/\* AI_VALIDATION: THEME_CONTEXT_USAGE/,
  ACCESSIBILITY_COMPLIANCE: /\/\* AI_VALIDATION: ACCESSIBILITY_COMPLIANCE/,
  RESPONSIVE_DESIGN: /\/\* AI_VALIDATION: RESPONSIVE_DESIGN/,
  PERFORMANCE_OPTIMIZATION: /\/\* AI_VALIDATION: PERFORMANCE_OPTIMIZATION/,
};

// Anti-patterns that should not exist
const AI_ANTI_PATTERNS = {
  TAILWIND_CLASSES: /@apply\s+[a-z-]+/g,
  DIRECT_COLORS: /#[0-9a-fA-F]{3,6}(?![^{]*var\()/g,
  NON_BEM_CLASSES: /\.[a-zA-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*/g, // camelCase classes
  MISSING_AI_CONTEXT: /\/\*(?!.*AI_CONTEXT).*\*\//g,
};

class AIPatternValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      filesChecked: 0,
      aiValidationComments: 0,
      designTokenUsage: 0,
      antiPatternsFound: 0,
    };
  }

  /**
   * Validate all CSS files in the styles directory
   */
  validateAllFiles() {
    console.log('🤖 AI Pattern Validation Starting...\n');

    const stylesDir = path.join(process.cwd(), 'src/styles');
    this.validateDirectory(stylesDir);

    this.printResults();
    return this.errors.length === 0;
  }

  /**
   * Recursively validate CSS files in a directory
   */
  validateDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      this.errors.push(`Directory not found: ${dirPath}`);
      return;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        this.validateDirectory(itemPath);
      } else if (item.endsWith('.css')) {
        this.validateCSSFile(itemPath);
      }
    }
  }

  /**
   * Validate a single CSS file
   */
  validateCSSFile(filePath) {
    this.stats.filesChecked++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    console.log(`📄 Checking: ${relativePath}`);

    // Check for AI validation patterns
    this.checkAIValidationPatterns(content, relativePath);
    
    // Check for design token usage
    this.checkDesignTokenUsage(content, relativePath);
    
    // Check for anti-patterns
    this.checkAntiPatterns(content, relativePath);
    
    // Check BEM compliance
    this.checkBEMCompliance(content, relativePath);
  }

  /**
   * Check for AI validation comments
   */
  checkAIValidationPatterns(content, filePath) {
    const aiValidationMatches = content.match(/\/\* AI_VALIDATION:/g);
    if (aiValidationMatches) {
      this.stats.aiValidationComments += aiValidationMatches.length;
      console.log(`  ✅ Found ${aiValidationMatches.length} AI validation comments`);
    }

    // Check for AI_CONTEXT comments
    const aiContextMatches = content.match(/\/\* AI_CONTEXT:/g);
    if (aiContextMatches) {
      console.log(`  ✅ Found ${aiContextMatches.length} AI context comments`);
    }

    // Check for AI_USAGE comments
    const aiUsageMatches = content.match(/\/\* AI_USAGE:/g);
    if (aiUsageMatches) {
      console.log(`  ✅ Found ${aiUsageMatches.length} AI usage comments`);
    }

    // Warn if component file lacks AI documentation
    if (filePath.includes('components/') && !aiValidationMatches && !aiContextMatches) {
      this.warnings.push(`${filePath}: Component file lacks AI documentation`);
    }
  }

  /**
   * Check for proper design token usage
   */
  checkDesignTokenUsage(content, filePath) {
    const tokenMatches = content.match(AI_VALIDATION_PATTERNS.DESIGN_TOKEN_USAGE);
    if (tokenMatches) {
      this.stats.designTokenUsage += tokenMatches.length;
      console.log(`  ✅ Found ${tokenMatches.length} design token usages`);
    }

    // Check for theme-aware variables specifically
    const themeTokens = content.match(/var\(--theme-[a-z-]+\)/g);
    if (themeTokens) {
      console.log(`  ✅ Found ${themeTokens.length} theme-aware tokens`);
    }
  }

  /**
   * Check for anti-patterns that should not exist
   */
  checkAntiPatterns(content, filePath) {
    // Check for @apply directives
    const applyMatches = content.match(AI_ANTI_PATTERNS.TAILWIND_CLASSES);
    if (applyMatches) {
      this.errors.push(`${filePath}: Found @apply directives (forbidden): ${applyMatches.join(', ')}`);
      this.stats.antiPatternsFound += applyMatches.length;
    }

    // Check for direct color values (excluding CSS custom properties)
    const colorMatches = content.match(AI_ANTI_PATTERNS.DIRECT_COLORS);
    if (colorMatches) {
      // Filter out colors that are part of CSS custom property definitions
      const problematicColors = colorMatches.filter(color => {
        const colorIndex = content.indexOf(color);
        const beforeColor = content.substring(Math.max(0, colorIndex - 20), colorIndex);
        return !beforeColor.includes('--') && !beforeColor.includes('rgba') && !beforeColor.includes('hsla');
      });
      
      if (problematicColors.length > 0) {
        this.warnings.push(`${filePath}: Found direct color values (prefer design tokens): ${problematicColors.join(', ')}`);
      }
    }

    // Check for camelCase class names (non-BEM)
    const camelCaseMatches = content.match(AI_ANTI_PATTERNS.NON_BEM_CLASSES);
    if (camelCaseMatches) {
      const nonBemClasses = camelCaseMatches.filter(cls => 
        !cls.includes('__') && !cls.includes('--') && /[A-Z]/.test(cls)
      );
      
      if (nonBemClasses.length > 0) {
        this.warnings.push(`${filePath}: Found non-BEM class names: ${nonBemClasses.join(', ')}`);
      }
    }
  }

  /**
   * Check BEM compliance
   */
  checkBEMCompliance(content, filePath) {
    // Extract class names from CSS
    const classMatches = content.match(/\.[a-zA-Z][a-zA-Z0-9_-]*(?=\s*\{)/g);
    if (!classMatches) return;

    const classes = classMatches.map(cls => cls.substring(1)); // Remove leading dot
    const bemClasses = classes.filter(cls => 
      cls.includes('__') || cls.includes('--') || /^[a-z][a-z0-9-]*$/.test(cls)
    );

    const bemCompliance = (bemClasses.length / classes.length) * 100;
    
    if (bemCompliance < 90) {
      this.warnings.push(`${filePath}: BEM compliance is ${bemCompliance.toFixed(1)}% (target: 90%+)`);
    } else {
      console.log(`  ✅ BEM compliance: ${bemCompliance.toFixed(1)}%`);
    }
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 AI Pattern Validation Results');
    console.log('='.repeat(60));

    // Statistics
    console.log('\n📊 Statistics:');
    console.log(`  Files checked: ${this.stats.filesChecked}`);
    console.log(`  AI validation comments: ${this.stats.aiValidationComments}`);
    console.log(`  Design token usages: ${this.stats.designTokenUsage}`);
    console.log(`  Anti-patterns found: ${this.stats.antiPatternsFound}`);

    // Errors
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    // Summary
    console.log('\n📋 Summary:');
    if (this.errors.length === 0) {
      console.log('  ✅ All AI pattern validations passed!');
    } else {
      console.log(`  ❌ ${this.errors.length} errors found`);
    }

    if (this.warnings.length > 0) {
      console.log(`  ⚠️  ${this.warnings.length} warnings (consider addressing)`);
    }

    // AI-friendly metrics
    console.log('\n🤖 AI-Friendly Metrics:');
    const avgValidationComments = this.stats.filesChecked > 0 
      ? (this.stats.aiValidationComments / this.stats.filesChecked).toFixed(1)
      : 0;
    const avgDesignTokens = this.stats.filesChecked > 0
      ? (this.stats.designTokenUsage / this.stats.filesChecked).toFixed(1)
      : 0;

    console.log(`  Average AI validation comments per file: ${avgValidationComments}`);
    console.log(`  Average design token usage per file: ${avgDesignTokens}`);
    console.log(`  Anti-pattern density: ${this.stats.antiPatternsFound} total`);

    if (this.stats.antiPatternsFound === 0 && this.stats.aiValidationComments > 0) {
      console.log('  🎉 Excellent AI-friendly architecture!');
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new AIPatternValidator();
  const success = validator.validateAllFiles();
  process.exit(success ? 0 : 1);
}

export default AIPatternValidator;