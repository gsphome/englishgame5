#!/usr/bin/env node

/**
 * Comprehensive Consistency Audit Script
 * 
 * Performs a complete audit of visual consistency across the application
 * after implementing unified design system changes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConsistencyAuditor {
  constructor() {
    this.results = {
      passed: [],
      warnings: [],
      errors: [],
      summary: {}
    };
    this.srcPath = path.join(process.cwd(), 'src');
  }

  // Audit container widths
  auditContainerWidths() {
    console.log('🔍 Auditing container widths...');
    
    const expectedWidth = '42rem';
    const componentsToCheck = [
      'src/styles/components/main-menu.css',
      'src/styles/components/flashcard-component.css',
      'src/styles/components/quiz-component.css',
      'src/styles/components/completion-component.css',
      'src/styles/components/sorting-component.css',
      'src/styles/components/matching-component.css',
      'src/styles/components/header.css'
    ];

    componentsToCheck.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for max-width: 42rem
        if (content.includes('max-width: 42rem') || content.includes('max-width: var(--container-width)')) {
          this.results.passed.push(`✅ ${filePath}: Container width standardized`);
        } else if (content.includes('max-width:')) {
          const matches = content.match(/max-width:\s*([^;]+)/g);
          if (matches) {
            matches.forEach(match => {
              if (!match.includes('42rem') && !match.includes('24rem')) {
                this.results.warnings.push(`⚠️  ${filePath}: Non-standard width found: ${match}`);
              }
            });
          }
        }
      }
    });
  }

  // Audit padding consistency
  auditPaddingConsistency() {
    console.log('🔍 Auditing padding consistency...');
    
    const standardPadding = ['0.5rem', '0.75rem'];
    const componentsToCheck = [
      'src/styles/components/main-menu.css',
      'src/styles/components/flashcard-component.css',
      'src/styles/components/quiz-component.css',
      'src/styles/components/completion-component.css',
      'src/styles/components/sorting-component.css',
      'src/styles/components/matching-component.css',
      'src/styles/components/header.css'
    ];

    componentsToCheck.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for non-standard padding values
        const paddingMatches = content.match(/padding:\s*([^;]+)/g);
        if (paddingMatches) {
          paddingMatches.forEach(match => {
            const hasStandardPadding = standardPadding.some(std => match.includes(std));
            if (!hasStandardPadding && !match.includes('var(--')) {
              this.results.warnings.push(`⚠️  ${filePath}: Non-standard padding: ${match}`);
            }
          });
        }
      }
    });
  }

  // Audit design system variable usage
  auditDesignSystemUsage() {
    console.log('🔍 Auditing design system variable usage...');
    
    const designSystemVars = [
      '--radius-sm',
      '--radius-md', 
      '--radius-lg',
      '--shadow-subtle',
      '--shadow-medium',
      '--shadow-strong',
      '--shadow-interactive'
    ];

    const cssFiles = this.getAllCSSFiles();
    
    cssFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for old hardcoded values that should use variables
      const oldBorderRadius = content.match(/border-radius:\s*0\.(25|375|5|75)rem/g);
      if (oldBorderRadius) {
        oldBorderRadius.forEach(match => {
          this.results.warnings.push(`⚠️  ${filePath}: Hardcoded border-radius should use design system: ${match}`);
        });
      }

      // Check for old shadow values
      const oldShadows = content.match(/box-shadow:\s*0\s+\d+px\s+\d+px[^;]+rgba\([^)]+\)/g);
      if (oldShadows) {
        oldShadows.forEach(match => {
          if (!match.includes('var(--shadow')) {
            this.results.warnings.push(`⚠️  ${filePath}: Hardcoded shadow should use design system: ${match.substring(0, 50)}...`);
          }
        });
      }

      // Check for design system variable usage
      designSystemVars.forEach(varName => {
        if (content.includes(`var(${varName})`)) {
          this.results.passed.push(`✅ ${filePath}: Uses design system variable ${varName}`);
        }
      });
    });
  }

  // Audit progress counter implementation
  auditProgressCounters() {
    console.log('🔍 Auditing progress counter implementation...');
    
    const learningComponents = [
      'src/components/learning/FlashcardComponent.tsx',
      'src/components/learning/QuizComponent.tsx',
      'src/components/learning/CompletionComponent.tsx',
      'src/components/learning/SortingComponent.tsx',
      'src/components/learning/MatchingComponent.tsx'
    ];

    learningComponents.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('LearningProgressHeader')) {
          this.results.passed.push(`✅ ${filePath}: Uses unified LearningProgressHeader`);
        } else {
          this.results.errors.push(`❌ ${filePath}: Missing unified progress header`);
        }

        // Check for old progress counter implementations
        const oldCounterPatterns = [
          '__counter',
          '__progress-badge',
          '__header-top'
        ];

        oldCounterPatterns.forEach(pattern => {
          if (content.includes(pattern)) {
            this.results.warnings.push(`⚠️  ${filePath}: Contains old progress counter pattern: ${pattern}`);
          }
        });
      }
    });
  }

  // Audit modal consistency
  auditModalConsistency() {
    console.log('🔍 Auditing modal consistency...');
    
    const modalFiles = [
      'src/styles/components/compact-about.css',
      'src/styles/components/compact-profile.css',
      'src/styles/components/compact-progress-dashboard.css',
      'src/styles/components/compact-advanced-settings.css',
      'src/styles/components/compact-learning-path.css',
      'src/styles/components/matching-modal.css',
      'src/styles/components/sorting-modal.css'
    ];

    modalFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for design system usage
        if (content.includes('var(--radius-lg)')) {
          this.results.passed.push(`✅ ${filePath}: Uses standardized border radius`);
        }
        
        if (content.includes('var(--shadow-strong)')) {
          this.results.passed.push(`✅ ${filePath}: Uses standardized shadow system`);
        }

        // Check for old hardcoded values
        if (content.includes('border-radius: 0.5rem') && !content.includes('var(--radius')) {
          this.results.warnings.push(`⚠️  ${filePath}: Contains hardcoded border-radius`);
        }
      }
    });
  }

  // Get all CSS files
  getAllCSSFiles() {
    const cssFiles = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.css')) {
          cssFiles.push(fullPath);
        }
      });
    };

    scanDirectory(this.srcPath);
    return cssFiles;
  }

  // Check for unused CSS
  auditUnusedCSS() {
    console.log('🔍 Auditing for unused CSS...');
    
    const cssFiles = this.getAllCSSFiles();
    let unusedSelectors = 0;
    
    cssFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for old component-specific progress counter classes
      const oldProgressClasses = [
        'flashcard-component__counter',
        'quiz-component__counter', 
        'completion-component__counter',
        'sorting-component__progress-badge',
        'matching-component__progress-badge'
      ];

      oldProgressClasses.forEach(className => {
        if (content.includes(className)) {
          this.results.warnings.push(`⚠️  ${filePath}: Contains potentially unused class: ${className}`);
          unusedSelectors++;
        }
      });
    });

    if (unusedSelectors === 0) {
      this.results.passed.push('✅ No unused progress counter CSS found');
    }
  }

  // Generate summary
  generateSummary() {
    this.results.summary = {
      totalPassed: this.results.passed.length,
      totalWarnings: this.results.warnings.length,
      totalErrors: this.results.errors.length,
      overallScore: this.calculateScore()
    };
  }

  calculateScore() {
    const total = this.results.passed.length + this.results.warnings.length + this.results.errors.length;
    if (total === 0) return 100;
    
    const score = (this.results.passed.length / total) * 100;
    return Math.round(score);
  }

  // Run complete audit
  async runAudit() {
    console.log('🚀 Starting Comprehensive Consistency Audit...\n');
    
    this.auditContainerWidths();
    this.auditPaddingConsistency();
    this.auditDesignSystemUsage();
    this.auditProgressCounters();
    this.auditModalConsistency();
    this.auditUnusedCSS();
    
    this.generateSummary();
    this.printResults();
  }

  // Print results
  printResults() {
    console.log('\n📊 AUDIT RESULTS\n');
    console.log('='.repeat(50));
    
    console.log(`\n✅ PASSED (${this.results.passed.length}):`);
    this.results.passed.forEach(item => console.log(`  ${item}`));
    
    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.results.warnings.length}):`);
      this.results.warnings.forEach(item => console.log(`  ${item}`));
    }
    
    if (this.results.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.results.errors.length}):`);
      this.results.errors.forEach(item => console.log(`  ${item}`));
    }
    
    console.log('\n📈 SUMMARY:');
    console.log('='.repeat(30));
    console.log(`Overall Score: ${this.results.summary.overallScore}%`);
    console.log(`Passed: ${this.results.summary.totalPassed}`);
    console.log(`Warnings: ${this.results.summary.totalWarnings}`);
    console.log(`Errors: ${this.results.summary.totalErrors}`);
    
    if (this.results.summary.overallScore >= 90) {
      console.log('\n🎉 EXCELLENT! Consistency implementation is highly successful.');
    } else if (this.results.summary.overallScore >= 75) {
      console.log('\n👍 GOOD! Minor improvements needed.');
    } else {
      console.log('\n⚠️  NEEDS ATTENTION! Several issues require fixing.');
    }
  }
}

// Run audit if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new ConsistencyAuditor();
  auditor.runAudit().catch(console.error);
}

export default ConsistencyAuditor;