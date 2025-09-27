#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

class FallbackAdder {
  constructor() {
    this.cssFiles = [];
    this.fallbackMap = new Map([
      // Theme variables - most used
      ['--theme-text-primary', '#374151'],
      ['--theme-text-secondary', '#6b7280'],
      ['--theme-text-tertiary', '#9ca3af'],
      ['--theme-text-on-colored', '#ffffff'],
      ['--theme-bg-elevated', '#ffffff'],
      ['--theme-bg-primary', '#f9fafb'],
      ['--theme-bg-subtle', '#fafafa'],
      ['--theme-bg-soft', '#f9fafb'],
      ['--theme-primary-blue', '#3b82f6'],
      ['--theme-border-soft', '#f3f4f6'],
      ['--theme-border-medium', '#e5e7eb'],
      ['--theme-border-subtle', '#f9fafb'],
      ['--theme-border-primary', '#e5e7eb'],
      ['--theme-border-light', '#f3f4f6'],
      
      // Radius variables
      ['--radius-md', '0.375rem'],
      ['--radius-sm', '0.25rem'],
      ['--radius-lg', '0.5rem'],
      
      // Shadow variables
      ['--shadow-subtle', '0 1px 3px rgba(0, 0, 0, 0.1)'],
      ['--shadow-interactive', '0 2px 4px rgba(0, 0, 0, 0.1)'],
      ['--shadow-medium', '0 4px 6px rgba(0, 0, 0, 0.1)'],
      ['--shadow-strong', '0 10px 15px rgba(0, 0, 0, 0.1)'],
      
      // Spacing variables
      ['--padding-xs', '0.25rem'],
      ['--padding-sm', '0.5rem'],
      ['--padding-md', '1rem'],
      ['--padding-lg', '1.5rem'],
      ['--padding-xl', '2rem'],
      
      // Other common variables
      ['--font-primary', 'system-ui, -apple-system, sans-serif'],
      ['--header-text-primary', '#111827'],
      ['--header-border', '#e5e7eb'],
      ['--error', '#ef4444'],
      ['--border-soft', '#f3f4f6']
    ]);
    
    this.processedFiles = 0;
    this.addedFallbacks = 0;
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

  processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileChanges = 0;

    // Para cada variable en nuestro mapa de fallbacks
    for (const [varName, fallback] of this.fallbackMap.entries()) {
      // Buscar usos sin fallback: var(--variable) pero no var(--variable, algo)
      const regex = new RegExp(`var\\(${varName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\)(?!\\s*,)`, 'g');
      
      const matches = content.match(regex);
      if (matches) {
        // Reemplazar con fallback
        const replacement = `var(${varName}, ${fallback})`;
        content = content.replace(regex, replacement);
        modified = true;
        fileChanges += matches.length;
        this.addedFallbacks += matches.length;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.relative('src', filePath)}: Added ${fileChanges} fallbacks`);
      this.processedFiles++;
    }

    return modified;
  }

  async run() {
    console.log('🚀 Adding priority fallbacks to CSS variables...\n');
    
    this.findCSSFiles();
    console.log(`Found ${this.cssFiles.length} CSS files to process\n`);
    
    for (const file of this.cssFiles) {
      this.processFile(file);
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`Files modified: ${this.processedFiles}`);
    console.log(`Total fallbacks added: ${this.addedFallbacks}`);
    console.log(`\n🎯 Run audit again to see improved robustness score!`);
  }
}

const adder = new FallbackAdder();
adder.run().catch(console.error);