#!/usr/bin/env node

/**
 * Comprehensive AI Compliance Validation Script
 * 
 * Runs all AI-related validations and provides a comprehensive report
 * Combines BEM compliance, design token usage, and AI pattern validation
 */

import AIPatternValidator from './validate-ai-patterns.js';
import AIDesignTokenValidator from './validate-ai-design-tokens.js';
import BEMComplianceValidator from './validate-bem-compliance.js';

class AIComplianceValidator {
  constructor() {
    this.results = {
      patterns: null,
      tokens: null,
      bem: null,
    };
  }

  /**
   * Run all AI compliance validations
   */
  async validateAll() {
    console.log('🤖 Comprehensive AI Compliance Validation');
    console.log('='.repeat(60));
    console.log('Running all AI-related validations...\n');

    let allPassed = true;

    // Run AI Pattern Validation
    console.log('1️⃣ AI Pattern Validation');
    console.log('-'.repeat(30));
    try {
      const patternValidator = new AIPatternValidator();
      const patternsPassed = patternValidator.validateAllFiles();
      this.results.patterns = {
        passed: patternsPassed,
        stats: patternValidator.stats,
        errors: patternValidator.errors,
        warnings: patternValidator.warnings,
      };
      allPassed = allPassed && patternsPassed;
    } catch (error) {
      console.error('❌ AI Pattern validation failed:', error.message);
      allPassed = false;
    }

    console.log('\n');

    // Run Design Token Validation
    console.log('2️⃣ Design Token Validation');
    console.log('-'.repeat(30));
    try {
      const tokenValidator = new AIDesignTokenValidator();
      const tokensPassed = tokenValidator.validateAllFiles();
      this.results.tokens = {
        passed: tokensPassed,
        stats: tokenValidator.stats,
        errors: tokenValidator.errors,
        warnings: tokenValidator.warnings,
        score: tokenValidator.calculateAIScore(),
      };
      allPassed = allPassed && tokensPassed;
    } catch (error) {
      console.error('❌ Design Token validation failed:', error.message);
      allPassed = false;
    }

    console.log('\n');

    // Run BEM Compliance Validation
    console.log('3️⃣ BEM Compliance Validation');
    console.log('-'.repeat(30));
    try {
      const bemValidator = new BEMComplianceValidator();
      const bemPassed = bemValidator.validateAllFiles();
      this.results.bem = {
        passed: bemPassed,
        stats: bemValidator.stats,
        errors: bemValidator.errors,
        warnings: bemValidator.warnings,
      };
      allPassed = allPassed && bemPassed;
    } catch (error) {
      console.error('❌ BEM Compliance validation failed:', error.message);
      allPassed = false;
    }

    // Generate comprehensive report
    this.generateComprehensiveReport();

    return allPassed;
  }

  /**
   * Generate comprehensive AI compliance report
   */
  generateComprehensiveReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 COMPREHENSIVE AI COMPLIANCE REPORT');
    console.log('='.repeat(80));

    // Overall Status
    const overallPassed = this.results.patterns?.passed && 
                         this.results.tokens?.passed && 
                         this.results.bem?.passed;

    console.log('\n🎯 Overall Status:');
    if (overallPassed) {
      console.log('  ✅ ALL VALIDATIONS PASSED - AI-READY ARCHITECTURE!');
    } else {
      console.log('  ❌ Some validations failed - see details below');
    }

    // Detailed Results
    console.log('\n📊 Detailed Results:');
    
    // AI Patterns
    if (this.results.patterns) {
      const status = this.results.patterns.passed ? '✅' : '❌';
      console.log(`  ${status} AI Patterns: ${this.results.patterns.errors.length} errors, ${this.results.patterns.warnings.length} warnings`);
      console.log(`      AI validation comments: ${this.results.patterns.stats.aiValidationComments}`);
      console.log(`      Anti-patterns found: ${this.results.patterns.stats.antiPatternsFound}`);
    }

    // Design Tokens
    if (this.results.tokens) {
      const status = this.results.tokens.passed ? '✅' : '❌';
      console.log(`  ${status} Design Tokens: ${this.results.tokens.errors.length} errors, ${this.results.tokens.warnings.length} warnings`);
      console.log(`      Token usages: ${this.results.tokens.stats.tokensFound}`);
      console.log(`      Theme tokens: ${this.results.tokens.stats.themeTokensFound}`);
      console.log(`      AI Score: ${this.results.tokens.score}/100`);
    }

    // BEM Compliance
    if (this.results.bem) {
      const status = this.results.bem.passed ? '✅' : '❌';
      console.log(`  ${status} BEM Compliance: ${this.results.bem.errors.length} errors, ${this.results.bem.warnings.length} warnings`);
      if (this.results.bem.stats.overallCompliance) {
        console.log(`      Overall compliance: ${this.results.bem.stats.overallCompliance.toFixed(1)}%`);
      }
    }

    // AI-Friendly Metrics
    console.log('\n🤖 AI-Friendly Architecture Metrics:');
    
    const totalFiles = this.results.patterns?.stats.filesChecked || 0;
    const totalValidationComments = this.results.patterns?.stats.aiValidationComments || 0;
    const totalTokenUsages = this.results.tokens?.stats.tokensFound || 0;
    const totalAntiPatterns = this.results.patterns?.stats.antiPatternsFound || 0;

    console.log(`  📁 Files analyzed: ${totalFiles}`);
    console.log(`  💬 AI validation comments: ${totalValidationComments}`);
    console.log(`  🎨 Design token usages: ${totalTokenUsages}`);
    console.log(`  ⚠️  Anti-patterns detected: ${totalAntiPatterns}`);

    // Calculate overall AI readiness score
    const aiReadinessScore = this.calculateAIReadinessScore();
    console.log(`  🎯 AI Readiness Score: ${aiReadinessScore}/100`);

    // Recommendations
    console.log('\n💡 AI Development Recommendations:');
    
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      recommendations.forEach(rec => console.log(`  • ${rec}`));
    } else {
      console.log('  🎉 No recommendations - excellent AI-friendly architecture!');
    }

    // Next Steps
    console.log('\n🚀 Next Steps for AI Development:');
    
    if (overallPassed) {
      console.log('  ✅ Architecture is AI-ready!');
      console.log('  📝 Use the patterns documented in docs/architecture/ai-css-development-guide.md');
      console.log('  🔄 Run this validation regularly during development');
      console.log('  📚 Refer to example-component.css for new components');
    } else {
      console.log('  🔧 Fix validation errors before proceeding');
      console.log('  📖 Review AI development guidelines in docs/architecture/ai-css-development-guide.md');
      console.log('  🎯 Focus on areas with lowest compliance scores');
      console.log('  🔄 Re-run validation after fixes');
    }

    // Validation Commands
    console.log('\n🛠️  Available Validation Commands:');
    console.log('  npm run test:ai-patterns     # AI pattern validation');
    console.log('  npm run test:ai-tokens       # Design token validation');
    console.log('  npm run test:bem             # BEM compliance validation');
    console.log('  npm run test:ai-compliance   # This comprehensive validation');
  }

  /**
   * Calculate overall AI readiness score
   */
  calculateAIReadinessScore() {
    let score = 0;
    let components = 0;

    // AI Patterns score (30%)
    if (this.results.patterns) {
      let patternScore = 100;
      patternScore -= this.results.patterns.errors.length * 10;
      patternScore -= this.results.patterns.warnings.length * 2;
      patternScore -= this.results.patterns.stats.antiPatternsFound * 5;
      
      const avgComments = this.results.patterns.stats.filesChecked > 0
        ? this.results.patterns.stats.aiValidationComments / this.results.patterns.stats.filesChecked
        : 0;
      
      if (avgComments < 2) patternScore -= (2 - avgComments) * 10;
      
      score += Math.max(0, patternScore) * 0.3;
      components++;
    }

    // Design Tokens score (40%)
    if (this.results.tokens) {
      score += this.results.tokens.score * 0.4;
      components++;
    }

    // BEM Compliance score (30%)
    if (this.results.bem) {
      let bemScore = 100;
      bemScore -= this.results.bem.errors.length * 15;
      bemScore -= this.results.bem.warnings.length * 3;
      
      if (this.results.bem.stats.overallCompliance) {
        bemScore = Math.min(bemScore, this.results.bem.stats.overallCompliance);
      }
      
      score += Math.max(0, bemScore) * 0.3;
      components++;
    }

    return components > 0 ? Math.round(score / components * components) : 0;
  }

  /**
   * Generate AI development recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Pattern recommendations
    if (this.results.patterns) {
      if (this.results.patterns.stats.antiPatternsFound > 0) {
        recommendations.push('Eliminate anti-patterns (Tailwind classes, direct colors)');
      }
      
      const avgComments = this.results.patterns.stats.filesChecked > 0
        ? this.results.patterns.stats.aiValidationComments / this.results.patterns.stats.filesChecked
        : 0;
      
      if (avgComments < 2) {
        recommendations.push('Add more AI validation comments to CSS files');
      }
    }

    // Token recommendations
    if (this.results.tokens) {
      if (this.results.tokens.stats.directColorsFound > 0) {
        recommendations.push('Replace direct colors with design tokens');
      }
      
      const themeTokenRatio = this.results.tokens.stats.tokensFound > 0
        ? (this.results.tokens.stats.themeTokensFound / this.results.tokens.stats.tokensFound) * 100
        : 0;
      
      if (themeTokenRatio < 80) {
        recommendations.push('Prefer --theme-* tokens over semantic tokens in components');
      }
    }

    // BEM recommendations
    if (this.results.bem) {
      if (this.results.bem.stats.overallCompliance < 90) {
        recommendations.push('Improve BEM naming compliance (target: 90%+)');
      }
    }

    return recommendations;
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new AIComplianceValidator();
  validator.validateAll().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export default AIComplianceValidator;