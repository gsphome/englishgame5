#!/usr/bin/env node

/**
 * AI Design Token Validation Script
 * 
 * Validates that components use design tokens correctly and consistently
 * Checks for proper theme-aware variable usage and token definitions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIDesignTokenValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      filesChecked: 0,
      tokensFound: 0,
      themeTokensFound: 0,
      directColorsFound: 0,
    };
    
    // Load design tokens from color-palette.css
    this.loadDesignTokens();
  }

  /**
   * Load design tokens from the color palette file
   */
  loadDesignTokens() {
    const colorPalettePath = path.join(process.cwd(), 'src/styles/design-system/color-palette.css');
    
    if (!fs.existsSync(colorPalettePath)) {
      this.errors.push('Design system color-palette.css not found');
      return;
    }

    const content = fs.readFileSync(colorPalettePath, 'utf8');
    
    // Extract all CSS custom properties
    this.semanticTokens = new Set();
    this.themeTokens = new Set();
    
    // Find semantic tokens (--text-primary, --bg-elevated, etc.)
    const semanticMatches = content.match(/--[a-z-]+:\s*[^;]+;/g);
    if (semanticMatches) {
      semanticMatches.forEach(match => {
        const tokenName = match.match(/--([a-z-]+):/)[1];
        this.semanticTokens.add(tokenName);
      });
    }
    
    // Find theme tokens (--theme-text-primary, etc.)
    const themeMatches = content.match(/--theme-[a-z-]+:\s*[^;]+;/g);
    if (themeMatches) {
      themeMatches.forEach(match => {
        const tokenName = match.match(/--theme-([a-z-]+):/)[1];
        this.themeTokens.add(`theme-${tokenName}`);
      });
    }

    console.log(`📋 Loaded ${this.semanticTokens.size} semantic tokens and ${this.themeTokens.size} theme tokens`);
  }

  /**
   * Validate all CSS files for design token usage
   */
  validateAllFiles() {
    console.log('🎨 AI Design Token Validation Starting...\n');

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
   * Validate design token usage in a CSS file
   */
  validateCSSFile(filePath) {
    this.stats.filesChecked++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    console.log(`🎨 Checking: ${relativePath}`);

    // Skip design system files (they define tokens)
    if (relativePath.includes('design-system/')) {
      console.log('  ⏭️  Skipping design system file');
      return;
    }

    this.checkDesignTokenUsage(content, relativePath);
    this.checkThemeTokenUsage(content, relativePath);
    this.checkDirectColorUsage(content, relativePath);
    this.checkTokenConsistency(content, relativePath);
  }

  /**
   * Check for proper design token usage
   */
  checkDesignTokenUsage(content, filePath) {
    // Find all CSS custom property usages
    const tokenUsages = content.match(/var\(--[a-z-]+\)/g);
    
    if (tokenUsages) {
      this.stats.tokensFound += tokenUsages.length;
      console.log(`  ✅ Found ${tokenUsages.length} design token usages`);
      
      // Check if tokens are defined
      tokenUsages.forEach(usage => {
        const tokenName = usage.match(/var\(--([a-z-]+)\)/)[1];
        
        if (!this.semanticTokens.has(tokenName) && !this.themeTokens.has(tokenName)) {
          this.warnings.push(`${filePath}: Unknown token used: --${tokenName}`);
        }
      });
    } else {
      // Component files should use design tokens
      if (filePath.includes('components/')) {
        this.warnings.push(`${filePath}: Component file uses no design tokens`);
      }
    }
  }

  /**
   * Check for theme-aware token usage
   */
  checkThemeTokenUsage(content, filePath) {
    const themeTokenUsages = content.match(/var\(--theme-[a-z-]+\)/g);
    
    if (themeTokenUsages) {
      this.stats.themeTokensFound += themeTokenUsages.length;
      console.log(`  ✅ Found ${themeTokenUsages.length} theme-aware token usages`);
      
      // Validate theme token names
      themeTokenUsages.forEach(usage => {
        const tokenName = usage.match(/var\(--theme-([a-z-]+)\)/)[1];
        
        if (!this.themeTokens.has(`theme-${tokenName}`)) {
          this.warnings.push(`${filePath}: Unknown theme token used: --theme-${tokenName}`);
        }
      });
    }

    // Component files should prefer theme tokens
    if (filePath.includes('components/')) {
      const semanticTokenUsages = content.match(/var\(--(?!theme-)[a-z-]+\)/g);
      const themeTokenCount = themeTokenUsages ? themeTokenUsages.length : 0;
      const semanticTokenCount = semanticTokenUsages ? semanticTokenUsages.length : 0;
      
      if (semanticTokenCount > themeTokenCount && themeTokenCount === 0) {
        this.warnings.push(`${filePath}: Component uses semantic tokens instead of theme-aware tokens`);
      }
    }
  }

  /**
   * Check for direct color usage (anti-pattern)
   */
  checkDirectColorUsage(content, filePath) {
    // Find hex colors, rgb(), rgba(), hsl(), hsla()
    const colorPatterns = [
      /#[0-9a-fA-F]{3,6}(?![^{]*--)/g,  // Hex colors not in CSS custom properties
      /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
      /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
      /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g,
      /hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)/g,
    ];

    colorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        // Filter out colors that are part of design token definitions
        const problematicColors = matches.filter(color => {
          const colorIndex = content.indexOf(color);
          const beforeColor = content.substring(Math.max(0, colorIndex - 30), colorIndex);
          
          // Allow colors in token definitions and fallbacks
          return !beforeColor.includes('--') && 
                 !beforeColor.includes('fallback') &&
                 !beforeColor.includes('rgba(0, 0, 0,'); // Allow shadow colors
        });

        if (problematicColors.length > 0) {
          this.stats.directColorsFound += problematicColors.length;
          this.warnings.push(`${filePath}: Direct color usage found (prefer design tokens): ${problematicColors.join(', ')}`);
        }
      }
    });
  }

  /**
   * Check for token consistency and best practices
   */
  checkTokenConsistency(content, filePath) {
    // Check for consistent token usage patterns
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for mixed token types in same property
      if (line.includes('color:') || line.includes('background-color:') || line.includes('border-color:')) {
        const hasThemeToken = line.includes('--theme-');
        const hasSemanticToken = line.match(/--(?!theme-)[a-z-]+/);
        
        if (hasThemeToken && hasSemanticToken) {
          this.warnings.push(`${filePath}:${lineNum}: Mixed token types in same property`);
        }
      }
      
      // Check for AI validation comments on token usage
      if (line.includes('var(--theme-') && !content.includes('AI_VALIDATION: DESIGN_TOKEN_USAGE')) {
        // Only warn once per file
        if (!this.warnings.some(w => w.includes(filePath) && w.includes('missing AI validation'))) {
          this.warnings.push(`${filePath}: Theme token usage missing AI validation comment`);
        }
      }
    });
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🎨 AI Design Token Validation Results');
    console.log('='.repeat(60));

    // Statistics
    console.log('\n📊 Statistics:');
    console.log(`  Files checked: ${this.stats.filesChecked}`);
    console.log(`  Design tokens found: ${this.stats.tokensFound}`);
    console.log(`  Theme tokens found: ${this.stats.themeTokensFound}`);
    console.log(`  Direct colors found: ${this.stats.directColorsFound}`);

    // Token coverage
    const tokenCoverage = this.stats.filesChecked > 0 
      ? ((this.stats.tokensFound / this.stats.filesChecked) * 100).toFixed(1)
      : 0;
    console.log(`  Token coverage: ${tokenCoverage}% (tokens per file)`);

    // Theme token preference
    const themeTokenRatio = this.stats.tokensFound > 0
      ? ((this.stats.themeTokensFound / this.stats.tokensFound) * 100).toFixed(1)
      : 0;
    console.log(`  Theme token preference: ${themeTokenRatio}%`);

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

    // Recommendations
    console.log('\n💡 AI Development Recommendations:');
    
    if (this.stats.directColorsFound > 0) {
      console.log('  • Replace direct colors with design tokens for theme consistency');
    }
    
    if (parseFloat(themeTokenRatio) < 80) {
      console.log('  • Prefer --theme-* tokens over semantic tokens in components');
    }
    
    if (parseFloat(tokenCoverage) < 50) {
      console.log('  • Increase design token usage for better theme support');
    }

    // Summary
    console.log('\n📋 Summary:');
    if (this.errors.length === 0) {
      console.log('  ✅ All design token validations passed!');
    } else {
      console.log(`  ❌ ${this.errors.length} errors found`);
    }

    if (this.warnings.length > 0) {
      console.log(`  ⚠️  ${this.warnings.length} warnings (consider addressing)`);
    }

    // AI-friendly score
    const aiScore = this.calculateAIScore();
    console.log(`\n🤖 AI-Friendly Score: ${aiScore}/100`);
    
    if (aiScore >= 90) {
      console.log('  🎉 Excellent! Very AI-friendly design token usage');
    } else if (aiScore >= 70) {
      console.log('  👍 Good AI-friendly design token usage');
    } else {
      console.log('  📈 Room for improvement in AI-friendly patterns');
    }
  }

  /**
   * Calculate AI-friendly score based on token usage
   */
  calculateAIScore() {
    let score = 100;

    // Deduct points for direct colors
    score -= Math.min(this.stats.directColorsFound * 5, 30);

    // Deduct points for low theme token usage
    const themeTokenRatio = this.stats.tokensFound > 0
      ? (this.stats.themeTokensFound / this.stats.tokensFound) * 100
      : 0;
    
    if (themeTokenRatio < 80) {
      score -= (80 - themeTokenRatio) * 0.5;
    }

    // Deduct points for low token coverage
    const tokenCoverage = this.stats.filesChecked > 0 
      ? (this.stats.tokensFound / this.stats.filesChecked) * 100
      : 0;
    
    if (tokenCoverage < 50) {
      score -= (50 - tokenCoverage) * 0.3;
    }

    // Deduct points for errors and warnings
    score -= this.errors.length * 10;
    score -= this.warnings.length * 2;

    return Math.max(0, Math.round(score));
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new AIDesignTokenValidator();
  const success = validator.validateAllFiles();
  process.exit(success ? 0 : 1);
}

export default AIDesignTokenValidator;