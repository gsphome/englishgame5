#!/usr/bin/env node

/**
 * Typography Consistency Verification Script
 * 
 * Validates that the typography system fixes have been properly applied
 * and identifies any remaining inconsistencies.
 */

import fs from 'fs';
import path from 'path';

// WCAG minimum font sizes (in rem)
const MIN_FONT_SIZE = 0.75; // 12px
const RECOMMENDED_MIN_SIZE = 0.875; // 14px

// Expected typography tokens
const EXPECTED_TOKENS = [
  '--text-xs',
  '--text-sm', 
  '--text-base',
  '--text-lg',
  '--text-xl',
  '--text-2xl',
  '--text-3xl'
];

// Files to check
const CSS_FILES = [
  'src/styles/design-system/typography.css',
  'src/styles/components/module-card.css',
  'src/styles/components/header.css',
  'src/index.css'
];

class TypographyValidator {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.warnings = [];
  }

  validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      this.issues.push(`❌ File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    console.log(`\n🔍 Validating ${fileName}...`);

    // Check for hardcoded small font sizes
    this.checkHardcodedSizes(content, fileName);
    
    // Check for typography token usage
    this.checkTokenUsage(content, fileName);
    
    // Check for accessibility compliance
    this.checkAccessibility(content, fileName);
  }

  checkHardcodedSizes(content, fileName) {
    // Regex to find font-size declarations
    const fontSizeRegex = /font-size:\s*([0-9.]+)(rem|px|em)/g;
    let match;

    while ((match = fontSizeRegex.exec(content)) !== null) {
      const size = parseFloat(match[1]);
      const unit = match[2];
      
      if (unit === 'rem' && size < MIN_FONT_SIZE) {
        this.issues.push(`❌ ${fileName}: Font size ${size}rem (${size * 16}px) below minimum ${MIN_FONT_SIZE}rem (12px)`);
      } else if (unit === 'px' && size < 12) {
        this.issues.push(`❌ ${fileName}: Font size ${size}px below minimum 12px`);
      } else if (unit === 'rem' && size >= MIN_FONT_SIZE && size < RECOMMENDED_MIN_SIZE) {
        this.warnings.push(`⚠️  ${fileName}: Font size ${size}rem (${size * 16}px) meets minimum but below recommended ${RECOMMENDED_MIN_SIZE}rem (14px)`);
      }
    }
  }

  checkTokenUsage(content, fileName) {
    // Check if file uses typography tokens
    const hasTokens = EXPECTED_TOKENS.some(token => content.includes(token));
    
    if (fileName.includes('component') && !hasTokens && content.includes('font-size')) {
      this.warnings.push(`⚠️  ${fileName}: Uses hardcoded font-size instead of typography tokens`);
    }

    // Check for proper token usage in critical components
    if (fileName === 'module-card.css') {
      if (!content.includes('var(--text-sm') && !content.includes('var(--text-xs')) {
        this.issues.push(`❌ ${fileName}: Module card should use typography tokens for legibility`);
      } else {
        this.fixes.push(`✅ ${fileName}: Module card now uses typography tokens`);
      }
    }
  }

  checkAccessibility(content, fileName) {
    // Check for proper responsive scaling
    if (content.includes('@media') && content.includes('font-size')) {
      const mobileScaling = content.includes('max-width: 640px') && 
                           (content.includes('1rem') || content.includes('16px'));
      
      if (mobileScaling) {
        this.fixes.push(`✅ ${fileName}: Includes mobile-friendly font scaling`);
      }
    }

    // Check for high contrast support
    if (content.includes('prefers-contrast: high')) {
      this.fixes.push(`✅ ${fileName}: Includes high contrast accessibility support`);
    }

    // Check for reduced motion support
    if (content.includes('prefers-reduced-motion')) {
      this.fixes.push(`✅ ${fileName}: Includes reduced motion accessibility support`);
    }
  }

  validateTypographySystem() {
    const typographyFile = 'src/styles/design-system/typography.css';
    
    if (!fs.existsSync(typographyFile)) {
      this.issues.push(`❌ Typography system file missing: ${typographyFile}`);
      return;
    }

    const content = fs.readFileSync(typographyFile, 'utf8');

    // Check for all expected tokens
    EXPECTED_TOKENS.forEach(token => {
      if (!content.includes(token)) {
        this.issues.push(`❌ Typography system missing token: ${token}`);
      } else {
        this.fixes.push(`✅ Typography system includes token: ${token}`);
      }
    });

    // Check for component-specific classes
    const componentClasses = [
      'typography-card-title',
      'typography-card-type', 
      'typography-card-level',
      'typography-modal-title',
      'typography-header-title'
    ];

    componentClasses.forEach(className => {
      if (!content.includes(className)) {
        this.warnings.push(`⚠️  Typography system missing component class: ${className}`);
      } else {
        this.fixes.push(`✅ Typography system includes component class: ${className}`);
      }
    });
  }

  checkModuleCardFixes() {
    const moduleCardFile = 'src/styles/components/module-card.css';
    
    if (!fs.existsSync(moduleCardFile)) {
      this.issues.push(`❌ Module card file not found: ${moduleCardFile}`);
      return;
    }

    const content = fs.readFileSync(moduleCardFile, 'utf8');

    // Check for critical fixes
    const criticalFixes = [
      { pattern: /font-size:\s*var\(--text-sm/, description: 'Module card title uses typography token' },
      { pattern: /font-size:\s*var\(--text-xs/, description: 'Module card type/level uses minimum legible size' },
      { pattern: /0\.875rem|14px/, description: 'Module card includes 14px+ font sizes' }
    ];

    criticalFixes.forEach(fix => {
      if (fix.pattern.test(content)) {
        this.fixes.push(`✅ Module Cards: ${fix.description}`);
      } else {
        this.issues.push(`❌ Module Cards: Missing ${fix.description}`);
      }
    });

    // Check that old illegible sizes are removed
    const illegibleSizes = ['0.4375rem', '0.5rem', '0.625rem'];
    illegibleSizes.forEach(size => {
      if (content.includes(`font-size: ${size}`) && !content.includes('CRITICAL FIX')) {
        this.issues.push(`❌ Module Cards: Still contains illegible font size ${size}`);
      }
    });
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TYPOGRAPHY CONSISTENCY VALIDATION REPORT');
    console.log('='.repeat(60));

    if (this.fixes.length > 0) {
      console.log('\n✅ FIXES APPLIED:');
      this.fixes.forEach(fix => console.log(`  ${fix}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    if (this.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      this.issues.forEach(issue => console.log(`  ${issue}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY:');
    console.log(`  ✅ Fixes Applied: ${this.fixes.length}`);
    console.log(`  ⚠️  Warnings: ${this.warnings.length}`);
    console.log(`  ❌ Issues: ${this.issues.length}`);

    const score = Math.max(0, 100 - (this.issues.length * 10) - (this.warnings.length * 2));
    console.log(`  📊 Typography Score: ${score}/100`);

    if (score >= 90) {
      console.log('  🎉 EXCELLENT: Typography system is well implemented!');
    } else if (score >= 70) {
      console.log('  👍 GOOD: Typography system needs minor improvements');
    } else if (score >= 50) {
      console.log('  ⚠️  FAIR: Typography system needs significant improvements');
    } else {
      console.log('  ❌ POOR: Typography system requires major fixes');
    }

    console.log('='.repeat(60));

    return this.issues.length === 0;
  }

  run() {
    console.log('🔍 Starting Typography Consistency Validation...');

    // Validate typography system
    this.validateTypographySystem();

    // Validate individual files
    CSS_FILES.forEach(file => this.validateFile(file));

    // Check specific module card fixes
    this.checkModuleCardFixes();

    // Generate and return report
    return this.generateReport();
  }
}

// Run validation
const validator = new TypographyValidator();
const success = validator.run();

process.exit(success ? 0 : 1);