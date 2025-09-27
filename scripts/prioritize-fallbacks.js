#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

class FallbackPrioritizer {
  constructor() {
    this.cssFiles = [];
    this.variableUsage = new Map();
    this.missingFallbacks = [];
  }

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

  analyzeCSSFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar uso de variables sin fallbacks
    const noFallbackRegex = /var\((--[\w-]+)\)(?!\s*,)/g;
    let match;
    
    while ((match = noFallbackRegex.exec(content)) !== null) {
      const varName = match[1];
      
      if (!this.variableUsage.has(varName)) {
        this.variableUsage.set(varName, {
          count: 0,
          files: new Set(),
          category: this.categorizeVariable(varName)
        });
      }
      
      const usage = this.variableUsage.get(varName);
      usage.count++;
      usage.files.add(filePath);
    }
  }

  categorizeVariable(varName) {
    if (varName.includes('color')) return 'color';
    if (varName.includes('font-size') || varName.includes('text-size')) return 'typography';
    if (varName.includes('spacing') || varName.includes('margin') || varName.includes('padding')) return 'spacing';
    if (varName.includes('border')) return 'border';
    if (varName.includes('shadow')) return 'shadow';
    if (varName.includes('radius')) return 'radius';
    if (varName.includes('transition') || varName.includes('duration')) return 'animation';
    return 'other';
  }

  getSuggestedFallback(varName, category) {
    switch (category) {
      case 'color':
        if (varName.includes('text')) return '#374151';
        if (varName.includes('background')) return '#ffffff';
        if (varName.includes('border')) return '#e5e7eb';
        if (varName.includes('accent') || varName.includes('primary')) return '#3b82f6';
        return '#6b7280';
      
      case 'typography':
        if (varName.includes('h1')) return '2rem';
        if (varName.includes('h2')) return '1.5rem';
        if (varName.includes('h3')) return '1.25rem';
        if (varName.includes('h4')) return '1.125rem';
        if (varName.includes('body')) return '1rem';
        if (varName.includes('caption') || varName.includes('small')) return '0.875rem';
        return '1rem';
      
      case 'spacing':
        if (varName.includes('xs')) return '0.25rem';
        if (varName.includes('sm')) return '0.5rem';
        if (varName.includes('md')) return '1rem';
        if (varName.includes('lg')) return '1.5rem';
        if (varName.includes('xl')) return '2rem';
        return '1rem';
      
      case 'border':
        return '1px solid #e5e7eb';
      
      case 'shadow':
        return '0 1px 3px rgba(0, 0, 0, 0.1)';
      
      case 'radius':
        if (varName.includes('sm')) return '0.25rem';
        if (varName.includes('md')) return '0.375rem';
        if (varName.includes('lg')) return '0.5rem';
        return '0.25rem';
      
      case 'animation':
        return '0.2s ease';
      
      default:
        return 'auto';
    }
  }

  generatePriorityList() {
    // Convertir a array y ordenar por uso
    const sortedVariables = Array.from(this.variableUsage.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 50); // Top 50 más usadas

    console.log('🎯 TOP 50 VARIABLES WITHOUT FALLBACKS (by usage)\n');
    
    const categories = {};
    
    sortedVariables.forEach(([varName, data], index) => {
      if (!categories[data.category]) {
        categories[data.category] = [];
      }
      
      categories[data.category].push({
        varName,
        count: data.count,
        files: data.files.size,
        suggestedFallback: this.getSuggestedFallback(varName, data.category)
      });
    });

    // Mostrar por categorías
    Object.entries(categories).forEach(([category, variables]) => {
      console.log(`\n📂 ${category.toUpperCase()} (${variables.length} variables)`);
      console.log('─'.repeat(60));
      
      variables.slice(0, 10).forEach(variable => {
        console.log(`${variable.varName}`);
        console.log(`  Usage: ${variable.count} times in ${variable.files} files`);
        console.log(`  Suggested: var(${variable.varName}, ${variable.suggestedFallback})`);
        console.log();
      });
      
      if (variables.length > 10) {
        console.log(`  ... and ${variables.length - 10} more variables\n`);
      }
    });

    return categories;
  }

  async run() {
    console.log('🚀 Analyzing CSS variables without fallbacks...\n');
    
    this.findCSSFiles();
    
    for (const file of this.cssFiles) {
      this.analyzeCSSFile(file);
    }
    
    console.log(`Found ${this.variableUsage.size} unique variables without fallbacks\n`);
    
    return this.generatePriorityList();
  }
}

const prioritizer = new FallbackPrioritizer();
prioritizer.run().catch(console.error);