#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Colores para output
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

class CSSFallbackAuditor {
  constructor() {
    this.cssFiles = [];
    this.cssVariables = new Map();
    this.fallbackUsage = new Map();
    this.issues = [];
    this.stats = {
      totalVariables: 0,
      withFallbacks: 0,
      withoutFallbacks: 0,
      correctFallbacks: 0,
      incorrectFallbacks: 0,
      criticalMissing: 0
    };
  }

  // Buscar todos los archivos CSS
  findCSSFiles(dir = 'src') {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        this.findCSSFiles(fullPath);
      } else if (file.name.endsWith('.css')) {
        this.cssFiles.push(fullPath);
      }
    }
  }

  // Analizar variables CSS y sus fallbacks
  analyzeCSSFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Buscar definiciones de variables CSS
    const variableDefRegex = /--[\w-]+:\s*([^;]+);/g;
    let match;
    
    while ((match = variableDefRegex.exec(content)) !== null) {
      const varName = match[0].split(':')[0].trim();
      const value = match[1].trim();
      
      if (!this.cssVariables.has(varName)) {
        this.cssVariables.set(varName, {
          definition: value,
          file: filePath,
          usages: []
        });
      }
    }

    // Buscar uso de variables con fallbacks
    const fallbackRegex = /var\((--[\w-]+)(?:,\s*([^)]+))?\)/g;
    
    while ((match = fallbackRegex.exec(content)) !== null) {
      const varName = match[1];
      const fallback = match[2] || null;
      const fullMatch = match[0];
      
      if (!this.fallbackUsage.has(varName)) {
        this.fallbackUsage.set(varName, []);
      }
      
      this.fallbackUsage.get(varName).push({
        file: filePath,
        fallback: fallback,
        fullExpression: fullMatch,
        line: this.getLineNumber(content, match.index)
      });
    }
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // Categorizar variables por criticidad
  categorizeCriticality(varName) {
    const critical = [
      '--font-size-h1', '--font-size-h2', '--font-size-h3', '--font-size-h4',
      '--font-size-body', '--font-size-caption', '--font-size-label',
      '--color-text-primary', '--color-text-secondary', '--color-background-primary'
    ];
    
    const important = [
      '--font-weight', '--line-height', '--color-border', '--color-accent'
    ];
    
    if (critical.some(c => varName.includes(c.replace('--', '')))) return 'critical';
    if (important.some(i => varName.includes(i.replace('--', '')))) return 'important';
    return 'normal';
  }

  // Validar fallbacks
  validateFallbacks() {
    for (const [varName, usages] of this.fallbackUsage.entries()) {
      const criticality = this.categorizeCriticality(varName);
      
      for (const usage of usages) {
        this.stats.totalVariables++;
        
        if (!usage.fallback) {
          this.stats.withoutFallbacks++;
          if (criticality === 'critical') {
            this.stats.criticalMissing++;
            this.issues.push({
              type: 'critical-missing',
              varName,
              file: usage.file,
              line: usage.line,
              message: `Critical variable ${varName} missing fallback`
            });
          } else {
            this.issues.push({
              type: 'warning',
              varName,
              file: usage.file,
              line: usage.line,
              message: `Variable ${varName} missing fallback`
            });
          }
        } else {
          this.stats.withFallbacks++;
          
          // Validar que el fallback sea apropiado
          if (this.isValidFallback(varName, usage.fallback)) {
            this.stats.correctFallbacks++;
          } else {
            this.stats.incorrectFallbacks++;
            this.issues.push({
              type: 'incorrect-fallback',
              varName,
              file: usage.file,
              line: usage.line,
              fallback: usage.fallback,
              message: `Inappropriate fallback for ${varName}: ${usage.fallback}`
            });
          }
        }
      }
    }
  }

  isValidFallback(varName, fallback) {
    // Validaciones específicas por tipo de variable
    if (varName.includes('font-size')) {
      // Font sizes should have px, rem, or em fallbacks
      return /\d+(px|rem|em)/.test(fallback) && this.extractNumber(fallback) >= 12;
    }
    
    if (varName.includes('color')) {
      // Colors should have hex, rgb, or named color fallbacks
      return /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(|hsla\(|^(black|white|gray|red|blue|green)$/.test(fallback);
    }
    
    if (varName.includes('spacing') || varName.includes('margin') || varName.includes('padding')) {
      // Spacing should have px, rem, or em values
      return /\d+(px|rem|em)/.test(fallback);
    }
    
    return true; // Default to valid for other types
  }

  extractNumber(value) {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  // Generar reporte
  generateReport() {
    console.log(`${colors.bright}${colors.cyan}🔍 CSS FALLBACK AUDIT REPORT${colors.reset}\n`);
    
    // Estadísticas generales
    console.log(`${colors.bright}📊 GENERAL STATISTICS${colors.reset}`);
    console.log(`Total CSS variables analyzed: ${colors.yellow}${this.stats.totalVariables}${colors.reset}`);
    console.log(`With fallbacks: ${colors.green}${this.stats.withFallbacks}${colors.reset}`);
    console.log(`Without fallbacks: ${colors.red}${this.stats.withoutFallbacks}${colors.reset}`);
    console.log(`Correct fallbacks: ${colors.green}${this.stats.correctFallbacks}${colors.reset}`);
    console.log(`Incorrect fallbacks: ${colors.yellow}${this.stats.incorrectFallbacks}${colors.reset}`);
    console.log(`Critical missing: ${colors.red}${this.stats.criticalMissing}${colors.reset}\n`);

    // Score de robustez
    const robustnessScore = this.stats.totalVariables > 0 
      ? Math.round((this.stats.correctFallbacks / this.stats.totalVariables) * 100)
      : 0;
    
    console.log(`${colors.bright}🎯 ROBUSTNESS SCORE: ${this.getScoreColor(robustnessScore)}${robustnessScore}%${colors.reset}\n`);

    // Issues por categoría
    const criticalIssues = this.issues.filter(i => i.type === 'critical-missing');
    const warnings = this.issues.filter(i => i.type === 'warning');
    const incorrectFallbacks = this.issues.filter(i => i.type === 'incorrect-fallback');

    if (criticalIssues.length > 0) {
      console.log(`${colors.bright}${colors.red}❌ CRITICAL ISSUES (${criticalIssues.length})${colors.reset}`);
      criticalIssues.slice(0, 10).forEach(issue => {
        console.log(`  ${colors.red}•${colors.reset} ${issue.message}`);
        console.log(`    ${colors.cyan}${issue.file}:${issue.line}${colors.reset}`);
      });
      if (criticalIssues.length > 10) {
        console.log(`    ${colors.yellow}... and ${criticalIssues.length - 10} more${colors.reset}`);
      }
      console.log();
    }

    if (incorrectFallbacks.length > 0) {
      console.log(`${colors.bright}${colors.yellow}⚠️  INCORRECT FALLBACKS (${incorrectFallbacks.length})${colors.reset}`);
      incorrectFallbacks.slice(0, 5).forEach(issue => {
        console.log(`  ${colors.yellow}•${colors.reset} ${issue.message}`);
        console.log(`    ${colors.cyan}${issue.file}:${issue.line}${colors.reset}`);
      });
      if (incorrectFallbacks.length > 5) {
        console.log(`    ${colors.yellow}... and ${incorrectFallbacks.length - 5} more${colors.reset}`);
      }
      console.log();
    }

    if (warnings.length > 0) {
      console.log(`${colors.bright}${colors.yellow}⚠️  WARNINGS (${warnings.length})${colors.reset}`);
      console.log(`  Missing fallbacks in non-critical variables`);
      console.log(`  ${colors.cyan}Run with --verbose to see details${colors.reset}\n`);
    }

    // Recomendaciones
    this.generateRecommendations();
  }

  getScoreColor(score) {
    if (score >= 90) return colors.green;
    if (score >= 70) return colors.yellow;
    return colors.red;
  }

  generateRecommendations() {
    console.log(`${colors.bright}💡 RECOMMENDATIONS${colors.reset}`);
    
    if (this.stats.criticalMissing > 0) {
      console.log(`${colors.red}1.${colors.reset} Add fallbacks to critical typography variables`);
    }
    
    if (this.stats.incorrectFallbacks > 0) {
      console.log(`${colors.yellow}2.${colors.reset} Review and fix inappropriate fallback values`);
    }
    
    if (this.stats.withoutFallbacks > this.stats.withFallbacks) {
      console.log(`${colors.yellow}3.${colors.reset} Consider adding fallbacks to more variables for better robustness`);
    }
    
    console.log(`${colors.green}4.${colors.reset} Maintain consistency in fallback patterns across components`);
  }

  async run() {
    console.log(`${colors.bright}🚀 Starting CSS Fallback Audit...${colors.reset}\n`);
    
    this.findCSSFiles();
    console.log(`Found ${this.cssFiles.length} CSS files to analyze\n`);
    
    for (const file of this.cssFiles) {
      this.analyzeCSSFile(file);
    }
    
    this.validateFallbacks();
    this.generateReport();
  }
}

// Ejecutar auditoría
const auditor = new CSSFallbackAuditor();
auditor.run().catch(console.error);