#!/usr/bin/env node

/**
 * CSS Fallbacks Validation Script
 * 
 * Audits CSS Custom Properties fallback consistency and robustness
 * Validates that fallback values match defined variable values
 */

import fs from 'fs';
import path from 'path';

class FallbackValidator {
  constructor() {
    this.variables = new Map(); // Store variable definitions
    this.usages = []; // Store variable usages with fallbacks
    this.issues = [];
    this.warnings = [];
    this.fixes = [];
    this.score = 100;
  }

  // Extract variable definitions from typography.css
  extractVariableDefinitions(content) {
    const variableRegex = /--([a-zA-Z-]+):\s*([^;]+);/g;
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const varName = match[1];
      const varValue = match[2].trim();
      
      // Store the variable definition
      if (!this.variables.has(varName)) {
        this.variables.set(varName, []);
      }
      this.variables.get(varName).push(varValue);
    }
  }

  // Extract variable usages with fallbacks
  extractVariableUsages(content, fileName) {
    const usageRegex = /var\(--([a-zA-Z-]+)(?:,\s*([^)]+))?\)/g;
    let match;

    while ((match = usageRegex.exec(content)) !== null) {
      const varName = match[1];
      const fallback = match[2] ? match[2].trim() : null;
      
      this.usages.push({
        variable: varName,
        fallback: fallback,
        file: fileName,
        fullMatch: match[0]
      });
    }
  }

  // Validate fallback consistency
  validateFallbacks() {
    console.log('\n🔍 Validating CSS Fallbacks...\n');

    this.usages.forEach(usage => {
      const { variable, fallback, file, fullMatch } = usage;
      
      // Check if variable is defined
      if (!this.variables.has(variable)) {
        this.issues.push(`❌ ${file}: Undefined variable --${variable} in ${fullMatch}`);
        this.score -= 10;
        return;
      }

      const definitions = this.variables.get(variable);
      
      // Check if fallback exists
      if (!fallback) {
        // Check if this variable needs a fallback
        if (this.shouldHaveFallback(variable)) {
          this.warnings.push(`⚠️  ${file}: Missing fallback for --${variable}`);
          this.score -= 2;
        } else {
          this.fixes.push(`✅ ${file}: --${variable} correctly used without fallback`);
        }
        return;
      }

      // Validate fallback consistency
      const isConsistent = this.validateFallbackConsistency(variable, fallback, definitions);
      
      if (isConsistent) {
        this.fixes.push(`✅ ${file}: --${variable} fallback matches definition (${fallback})`);
      } else {
        this.issues.push(`❌ ${file}: --${variable} fallback "${fallback}" doesn't match definitions: ${definitions.join(', ')}`);
        this.score -= 5;
      }
    });
  }

  // Check if variable should have a fallback
  shouldHaveFallback(variable) {
    // Typography variables should have fallbacks for robustness
    const typographyVars = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];
    const fontWeightVars = ['font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold'];
    const lineHeightVars = ['leading-none', 'leading-tight', 'leading-snug', 'leading-normal'];
    const trackingVars = ['tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider'];
    
    return typographyVars.includes(variable) || 
           fontWeightVars.includes(variable) || 
           lineHeightVars.includes(variable) ||
           trackingVars.includes(variable);
  }

  // Validate if fallback matches any definition
  validateFallbackConsistency(variable, fallback, definitions) {
    // Remove quotes and normalize values
    const normalizedFallback = fallback.replace(/['"]/g, '').trim();
    
    return definitions.some(def => {
      const normalizedDef = def.replace(/['"]/g, '').trim();
      return normalizedDef === normalizedFallback;
    });
  }

  // Check for responsive consistency
  validateResponsiveConsistency() {
    console.log('\n🔍 Validating Responsive Consistency...\n');

    // Check if responsive variables have appropriate fallbacks
    const responsiveVars = ['text-xs', 'text-sm', 'text-base'];
    
    responsiveVars.forEach(varName => {
      const usagesWithFallback = this.usages.filter(u => 
        u.variable === varName && u.fallback
      );
      
      if (usagesWithFallback.length > 0) {
        const fallbacks = [...new Set(usagesWithFallback.map(u => u.fallback))];
        
        if (fallbacks.length === 1) {
          this.fixes.push(`✅ Responsive: --${varName} has consistent fallback across files`);
        } else {
          this.warnings.push(`⚠️  Responsive: --${varName} has inconsistent fallbacks: ${fallbacks.join(', ')}`);
          this.score -= 3;
        }
      }
    });
  }

  // Analyze robustness scenarios
  analyzeRobustness() {
    console.log('\n🔍 Analyzing System Robustness...\n');

    // Scenario 1: Typography system fails to load
    const criticalVars = ['text-xs', 'text-sm', 'text-base'];
    const criticalUsages = this.usages.filter(u => criticalVars.includes(u.variable));
    
    const withFallbacks = criticalUsages.filter(u => u.fallback).length;
    const withoutFallbacks = criticalUsages.length - withFallbacks;
    
    if (withoutFallbacks === 0) {
      this.fixes.push(`✅ Robustness: All critical typography variables have fallbacks`);
    } else {
      this.issues.push(`❌ Robustness: ${withoutFallbacks} critical variables lack fallbacks`);
      this.score -= withoutFallbacks * 5;
    }

    // Scenario 2: Check minimum legible fallbacks
    const legibilityCheck = this.usages.filter(u => {
      if (!u.fallback) return false;
      
      const remMatch = u.fallback.match(/([0-9.]+)rem/);
      if (remMatch) {
        const remValue = parseFloat(remMatch[1]);
        return remValue < 0.75; // Below 12px
      }
      return false;
    });

    if (legibilityCheck.length === 0) {
      this.fixes.push(`✅ Legibility: All fallbacks meet minimum size requirements`);
    } else {
      legibilityCheck.forEach(usage => {
        this.issues.push(`❌ Legibility: ${usage.file} has illegible fallback ${usage.fallback} for --${usage.variable}`);
      });
      this.score -= legibilityCheck.length * 8;
    }
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];

    // Missing fallbacks
    const missingFallbacks = this.usages.filter(u => 
      !u.fallback && this.shouldHaveFallback(u.variable)
    );

    if (missingFallbacks.length > 0) {
      recommendations.push({
        type: 'CRITICAL',
        title: 'Add Missing Fallbacks',
        description: `${missingFallbacks.length} critical variables need fallbacks`,
        fixes: missingFallbacks.map(u => ({
          file: u.file,
          current: `var(--${u.variable})`,
          recommended: `var(--${u.variable}, ${this.getRecommendedFallback(u.variable)})`
        }))
      });
    }

    // Inconsistent fallbacks
    const inconsistentFallbacks = this.usages.filter(u => {
      if (!u.fallback || !this.variables.has(u.variable)) return false;
      const definitions = this.variables.get(u.variable);
      return !this.validateFallbackConsistency(u.variable, u.fallback, definitions);
    });

    if (inconsistentFallbacks.length > 0) {
      recommendations.push({
        type: 'HIGH',
        title: 'Fix Inconsistent Fallbacks',
        description: `${inconsistentFallbacks.length} fallbacks don't match variable definitions`,
        fixes: inconsistentFallbacks.map(u => ({
          file: u.file,
          current: `var(--${u.variable}, ${u.fallback})`,
          recommended: `var(--${u.variable}, ${this.variables.get(u.variable)[0]})`
        }))
      });
    }

    return recommendations;
  }

  // Get recommended fallback for a variable
  getRecommendedFallback(variable) {
    const fallbackMap = {
      'text-xs': '0.75rem',
      'text-sm': '0.875rem',
      'text-base': '1rem',
      'text-lg': '1.125rem',
      'text-xl': '1.25rem',
      'text-2xl': '1.5rem',
      'text-3xl': '1.875rem',
      'font-normal': '400',
      'font-medium': '500',
      'font-semibold': '600',
      'font-bold': '700',
      'leading-none': '1',
      'leading-tight': '1.25',
      'leading-snug': '1.375',
      'leading-normal': '1.5',
      'tracking-tight': '-0.025em',
      'tracking-normal': '0em',
      'tracking-wide': '0.025em'
    };

    return fallbackMap[variable] || 'inherit';
  }

  // Main validation method
  validateFiles(files) {
    console.log('🔍 Starting CSS Fallbacks Audit...\n');

    // First, extract variable definitions from typography.css
    const typographyFile = files.find(f => f.includes('typography.css'));
    if (typographyFile && fs.existsSync(typographyFile)) {
      const content = fs.readFileSync(typographyFile, 'utf8');
      this.extractVariableDefinitions(content);
      console.log(`📚 Extracted ${this.variables.size} variable definitions from typography.css`);
    }

    // Then analyze usage in all files
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file);
        this.extractVariableUsages(content, fileName);
      }
    });

    console.log(`🔍 Found ${this.usages.length} variable usages across ${files.length} files`);

    // Run validations
    this.validateFallbacks();
    this.validateResponsiveConsistency();
    this.analyzeRobustness();

    return this.generateReport();
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CSS FALLBACKS AUDIT REPORT');
    console.log('='.repeat(60));

    // Summary statistics
    console.log('\n📈 STATISTICS:');
    console.log(`  📚 Variables Defined: ${this.variables.size}`);
    console.log(`  🔍 Variable Usages: ${this.usages.length}`);
    console.log(`  ✅ With Fallbacks: ${this.usages.filter(u => u.fallback).length}`);
    console.log(`  ❌ Without Fallbacks: ${this.usages.filter(u => !u.fallback).length}`);

    // Results
    if (this.fixes.length > 0) {
      console.log('\n✅ CORRECT IMPLEMENTATIONS:');
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

    // Recommendations
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      recommendations.forEach(rec => {
        console.log(`\n  ${rec.type}: ${rec.title}`);
        console.log(`  ${rec.description}`);
        rec.fixes.slice(0, 3).forEach(fix => {
          console.log(`    📝 ${fix.file}: ${fix.current} → ${fix.recommended}`);
        });
        if (rec.fixes.length > 3) {
          console.log(`    ... and ${rec.fixes.length - 3} more`);
        }
      });
    }

    // Final score
    console.log('\n' + '='.repeat(60));
    console.log('📊 FALLBACK ROBUSTNESS SCORE:');
    console.log(`  ✅ Correct: ${this.fixes.length}`);
    console.log(`  ⚠️  Warnings: ${this.warnings.length}`);
    console.log(`  ❌ Issues: ${this.issues.length}`);
    console.log(`  🏆 Score: ${Math.max(0, this.score)}/100`);

    if (this.score >= 90) {
      console.log('  🎉 EXCELLENT: Fallback system is robust and well-implemented!');
    } else if (this.score >= 70) {
      console.log('  👍 GOOD: Fallback system needs minor improvements');
    } else if (this.score >= 50) {
      console.log('  ⚠️  FAIR: Fallback system needs significant improvements');
    } else {
      console.log('  ❌ POOR: Fallback system requires major fixes');
    }

    console.log('='.repeat(60));

    return {
      score: Math.max(0, this.score),
      issues: this.issues.length,
      warnings: this.warnings.length,
      fixes: this.fixes.length,
      recommendations
    };
  }
}

// Files to analyze
const FILES_TO_ANALYZE = [
  'src/styles/design-system/typography.css',
  'src/styles/components/module-card.css',
  'src/styles/components/header.css',
  'src/index.css'
];

// Run validation
const validator = new FallbackValidator();
const results = validator.validateFiles(FILES_TO_ANALYZE);

// Exit with appropriate code
process.exit(results.issues === 0 ? 0 : 1);