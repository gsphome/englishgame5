#!/usr/bin/env node

/**
 * Reading Mode Responsive Integration Validation
 * 
 * Validates complete responsive integration across:
 * - 4 modes: web-light, web-dark, mobile-light, mobile-dark
 * - All breakpoints: mobile, tablet, desktop, ultra-wide
 * - Device orientations: portrait, landscape
 * - Touch targets and navigation
 * - Content readability and layout optimization
 * - Theme switching transitions
 * - Prerequisite chains
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
let warnings = 0;

function check(condition, successMsg, errorMsg) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    log.success(successMsg);
    return true;
  } else {
    failedChecks++;
    log.error(errorMsg);
    return false;
  }
}

function warn(condition, msg) {
  if (!condition) {
    warnings++;
    log.warning(msg);
  }
}

// ============================================================================
// 1. CSS RESPONSIVE BREAKPOINTS VALIDATION
// ============================================================================

function validateCSSBreakpoints() {
  log.section('1. CSS Responsive Breakpoints');
  
  const cssPath = path.join(process.cwd(), 'src/styles/components/reading-component.css');
  
  if (!fs.existsSync(cssPath)) {
    check(false, '', 'reading-component.css not found');
    return;
  }
  
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  
  // Check for mobile-first base styles
  check(
    cssContent.includes('.reading-component__container {'),
    'Base container styles defined (mobile-first)',
    'Missing base container styles'
  );
  
  // Check for tablet breakpoint (768px)
  check(
    cssContent.includes('@media (min-width: 768px)'),
    'Tablet breakpoint (768px) defined',
    'Missing tablet breakpoint'
  );
  
  // Check for desktop breakpoint (1024px)
  check(
    cssContent.includes('@media (min-width: 1024px)'),
    'Desktop breakpoint (1024px) defined',
    'Missing desktop breakpoint'
  );
  
  // Check for ultra-wide breakpoint (1440px)
  check(
    cssContent.includes('@media (min-width: 1440px)'),
    'Ultra-wide breakpoint (1440px) defined',
    'Missing ultra-wide breakpoint'
  );
  
  // Check for mobile-specific styles
  check(
    cssContent.includes('@media (max-width: 767px)'),
    'Mobile-specific styles (< 768px) defined',
    'Missing mobile-specific styles'
  );
  
  // Check for landscape orientation support
  check(
    cssContent.includes('orientation: landscape'),
    'Landscape orientation support defined',
    'Missing landscape orientation support'
  );
  
  // Check for responsive grid columns
  const hasResponsiveGrid = 
    cssContent.includes('grid-template-columns: 1fr') &&
    cssContent.includes('grid-template-columns: repeat(2, 1fr)') &&
    cssContent.includes('grid-template-columns: repeat(3, 1fr)');
  
  check(
    hasResponsiveGrid,
    'Responsive grid columns (1, 2, 3) defined',
    'Missing responsive grid column definitions'
  );
  
  // Check for responsive font sizes
  const hasResponsiveFonts = 
    cssContent.includes('--reading-font-size-base: 1rem') &&
    cssContent.includes('--reading-font-size-base: 1.0625rem') &&
    cssContent.includes('--reading-font-size-base: 1.125rem');
  
  check(
    hasResponsiveFonts,
    'Responsive font sizes across breakpoints defined',
    'Missing responsive font size definitions'
  );
}

// ============================================================================
// 2. THEME SUPPORT VALIDATION
// ============================================================================

function validateThemeSupport() {
  log.section('2. Theme Support (Light/Dark)');
  
  const cssPath = path.join(process.cwd(), 'src/styles/components/reading-component.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  
  // Check for dark theme support
  check(
    cssContent.includes('html.dark .reading-component'),
    'Dark theme styles defined',
    'Missing dark theme styles'
  );
  
  // Check for theme variables
  const hasThemeVars = 
    cssContent.includes('--reading-bg-primary: var(--theme-bg-primary)') &&
    cssContent.includes('--reading-text-primary: var(--theme-text-primary)') &&
    cssContent.includes('--reading-accent-primary: var(--theme-accent-primary)');
  
  check(
    hasThemeVars,
    'Theme CSS variables properly defined',
    'Missing theme CSS variable definitions'
  );
  
  // Check for smooth transitions
  warn(
    cssContent.includes('transition'),
    'Consider adding transition properties for smooth theme switching'
  );
  
  // Check for prefers-color-scheme support
  warn(
    cssContent.includes('@media (prefers-color-scheme: dark)'),
    'Consider adding prefers-color-scheme media query for system theme detection'
  );
}

// ============================================================================
// 3. TOUCH TARGETS VALIDATION
// ============================================================================

function validateTouchTargets() {
  log.section('3. Touch Targets (44px minimum)');
  
  const cssPath = path.join(process.cwd(), 'src/styles/components/reading-component.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  
  // Check for touch target variable
  check(
    cssContent.includes('--reading-touch-target: 44px'),
    'Touch target variable (44px) defined',
    'Missing touch target variable definition'
  );
  
  // Check for min-height on interactive elements
  const hasMinHeight = 
    cssContent.includes('min-height: var(--reading-touch-target)');
  
  check(
    hasMinHeight,
    'Touch target min-height applied to interactive elements',
    'Missing touch target min-height on interactive elements'
  );
  
  // Check for button touch targets
  const buttonClasses = [
    '.reading-component__no-data-btn',
    '.reading-component__tooltip-trigger',
    '.reading-component__expandable-trigger'
  ];
  
  buttonClasses.forEach(className => {
    warn(
      cssContent.includes(`${className} {`) || cssContent.includes(`${className}:`),
      `Verify ${className} has adequate touch target size`
    );
  });
}

// ============================================================================
// 4. ACCESSIBILITY VALIDATION
// ============================================================================

function validateAccessibility() {
  log.section('4. Accessibility Features');
  
  const cssPath = path.join(process.cwd(), 'src/styles/components/reading-component.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  
  // Check for focus indicators
  check(
    cssContent.includes(':focus') || cssContent.includes(':focus-visible'),
    'Focus indicators defined',
    'Missing focus indicator styles'
  );
  
  // Check for reduced motion support
  check(
    cssContent.includes('@media (prefers-reduced-motion: reduce)'),
    'Reduced motion support defined',
    'Missing reduced motion media query'
  );
  
  // Check for high contrast support
  check(
    cssContent.includes('@media (prefers-contrast: high)'),
    'High contrast mode support defined',
    'Missing high contrast media query'
  );
  
  // Check for print styles
  check(
    cssContent.includes('@media print'),
    'Print styles defined',
    'Missing print media query'
  );
  
  // Check for outline styles
  warn(
    cssContent.includes('outline:') && cssContent.includes('outline-offset:'),
    'Verify focus outlines have adequate offset for visibility'
  );
}

// ============================================================================
// 5. COMPONENT INTEGRATION VALIDATION
// ============================================================================

function validateComponentIntegration() {
  log.section('5. Component Integration');
  
  const componentPath = path.join(process.cwd(), 'src/components/learning/ReadingComponent.tsx');
  
  if (!fs.existsSync(componentPath)) {
    check(false, '', 'ReadingComponent.tsx not found');
    return;
  }
  
  const componentContent = fs.readFileSync(componentPath, 'utf-8');
  
  // Check for CSS import
  check(
    componentContent.includes("import '../../styles/components/reading-component.css'"),
    'CSS file imported in component',
    'Missing CSS import in ReadingComponent'
  );
  
  // Check for responsive hooks
  check(
    componentContent.includes('useSettingsStore'),
    'Settings store integrated (for theme)',
    'Missing useSettingsStore integration'
  );
  
  // Check for keyboard navigation
  check(
    componentContent.includes('keydown') || componentContent.includes('KeyboardEvent'),
    'Keyboard navigation implemented',
    'Missing keyboard navigation'
  );
  
  // Check for progress tracking
  check(
    componentContent.includes('addProgressEntry'),
    'Progress tracking integrated',
    'Missing progress tracking integration'
  );
  
  // Check for i18n
  check(
    componentContent.includes('useTranslation'),
    'Internationalization integrated',
    'Missing i18n integration'
  );
}

// ============================================================================
// 6. DATA STRUCTURE VALIDATION
// ============================================================================

function validateDataStructure() {
  log.section('6. Reading Module Data Structure');
  
  const dataDir = path.join(process.cwd(), 'public/data');
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  
  let totalModules = 0;
  let validModules = 0;
  
  levels.forEach(level => {
    const levelDir = path.join(dataDir, level);
    if (!fs.existsSync(levelDir)) {
      log.warning(`Level directory ${level} not found`);
      return;
    }
    
    const files = fs.readdirSync(levelDir);
    const readingFiles = files.filter(f => f.includes('reading') && f.endsWith('.json'));
    
    readingFiles.forEach(file => {
      totalModules++;
      const filePath = path.join(levelDir, file);
      
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Validate required fields
        const hasRequiredFields = 
          data.title &&
          data.sections &&
          Array.isArray(data.sections) &&
          data.learningObjectives &&
          Array.isArray(data.learningObjectives) &&
          data.keyVocabulary &&
          Array.isArray(data.keyVocabulary) &&
          typeof data.estimatedReadingTime === 'number';
        
        if (hasRequiredFields) {
          validModules++;
        }
      } catch (error) {
        log.error(`Invalid JSON in ${file}: ${error.message}`);
      }
    });
  });
  
  check(
    totalModules >= 18,
    `Found ${totalModules} reading modules (minimum 18 required)`,
    `Only ${totalModules} reading modules found (need 18 minimum)`
  );
  
  check(
    validModules === totalModules,
    `All ${validModules} reading modules have valid structure`,
    `${totalModules - validModules} modules have invalid structure`
  );
}

// ============================================================================
// 7. PREREQUISITE CHAIN VALIDATION
// ============================================================================

function validatePrerequisiteChains() {
  log.section('7. Prerequisite Chain Validation');
  
  const modulesPath = path.join(process.cwd(), 'public/data/learningModules.json');
  
  if (!fs.existsSync(modulesPath)) {
    check(false, '', 'learningModules.json not found');
    return;
  }
  
  const modules = JSON.parse(fs.readFileSync(modulesPath, 'utf-8'));
  const readingModules = modules.filter(m => m.learningMode === 'reading');
  
  check(
    readingModules.length >= 18,
    `${readingModules.length} reading modules registered in learningModules.json`,
    `Only ${readingModules.length} reading modules registered (need 18 minimum)`
  );
  
  // Check that all reading modules have valid structure
  let validRegistrations = 0;
  readingModules.forEach(module => {
    if (
      module.id &&
      module.name &&
      module.dataPath &&
      module.level &&
      module.category === 'Reading' &&
      Array.isArray(module.prerequisites)
    ) {
      validRegistrations++;
    }
  });
  
  check(
    validRegistrations === readingModules.length,
    `All ${validRegistrations} reading modules properly registered`,
    `${readingModules.length - validRegistrations} modules have invalid registration`
  );
  
  // Check for prerequisite relationships
  const hasPrerequisites = readingModules.some(m => m.prerequisites.length > 0);
  warn(
    hasPrerequisites,
    'Some reading modules have prerequisites defined (good for progression)'
  );
}

// ============================================================================
// 8. LAYOUT OPTIMIZATION VALIDATION
// ============================================================================

function validateLayoutOptimization() {
  log.section('8. Layout Optimization');
  
  const cssPath = path.join(process.cwd(), 'src/styles/components/reading-component.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  
  // Check for max-width constraints (readability)
  check(
    cssContent.includes('max-width: 65ch') || cssContent.includes('max-width: 70ch'),
    'Optimal reading width (65-70ch) defined',
    'Missing optimal reading width constraint'
  );
  
  // Check for line-height optimization
  const hasOptimalLineHeight = 
    cssContent.includes('--reading-line-height-normal: 1.6') ||
    cssContent.includes('--reading-line-height-relaxed: 1.7');
  
  check(
    hasOptimalLineHeight,
    'Optimal line-height (1.6-1.7) for readability defined',
    'Missing optimal line-height for readability'
  );
  
  // Check for responsive padding
  const hasResponsivePadding = 
    cssContent.includes('padding: var(--reading-spacing-sm)') &&
    cssContent.includes('padding: var(--reading-spacing-md)') &&
    cssContent.includes('padding: var(--reading-spacing-lg)');
  
  check(
    hasResponsivePadding,
    'Responsive padding across breakpoints defined',
    'Missing responsive padding definitions'
  );
  
  // Check for flexbox/grid layouts
  check(
    cssContent.includes('display: flex') || cssContent.includes('display: grid'),
    'Modern layout methods (flexbox/grid) used',
    'Consider using flexbox or grid for layouts'
  );
}

// ============================================================================
// 9. ROUTER AND LAZY LOADING VALIDATION
// ============================================================================

function validateRouterIntegration() {
  log.section('9. Router and Lazy Loading');
  
  const routerPath = path.join(process.cwd(), 'src/components/layout/AppRouter.tsx');
  
  if (!fs.existsSync(routerPath)) {
    check(false, '', 'AppRouter.tsx not found');
    return;
  }
  
  const routerContent = fs.readFileSync(routerPath, 'utf-8');
  
  // Check for lazy loading
  check(
    routerContent.includes('lazy') && routerContent.includes('ReadingComponent'),
    'ReadingComponent lazy loaded',
    'ReadingComponent not lazy loaded'
  );
  
  // Check for Suspense wrapper
  check(
    routerContent.includes('Suspense') && routerContent.includes("case 'reading':"),
    'Suspense wrapper for reading mode',
    'Missing Suspense wrapper for reading mode'
  );
  
  // Check for reading case in router
  check(
    routerContent.includes("case 'reading':"),
    'Reading mode case in router',
    'Missing reading mode case in router'
  );
}

// ============================================================================
// 10. TYPE SYSTEM VALIDATION
// ============================================================================

function validateTypeSystem() {
  log.section('10. Type System Integration');
  
  const typesPath = path.join(process.cwd(), 'src/types/index.ts');
  
  if (!fs.existsSync(typesPath)) {
    check(false, '', 'types/index.ts not found');
    return;
  }
  
  const typesContent = fs.readFileSync(typesPath, 'utf-8');
  
  // Check for reading in LearningMode
  check(
    typesContent.includes("'reading'") && typesContent.includes('LearningMode'),
    "'reading' added to LearningMode type",
    "Missing 'reading' in LearningMode type"
  );
  
  // Check for ReadingData interface
  check(
    typesContent.includes('interface ReadingData'),
    'ReadingData interface defined',
    'Missing ReadingData interface'
  );
  
  // Check for ReadingSection interface
  check(
    typesContent.includes('interface ReadingSection'),
    'ReadingSection interface defined',
    'Missing ReadingSection interface'
  );
  
  // Check for KeyTerm interface
  check(
    typesContent.includes('interface KeyTerm'),
    'KeyTerm interface defined',
    'Missing KeyTerm interface'
  );
  
  // Check for GrammarPoint interface
  check(
    typesContent.includes('interface GrammarPoint'),
    'GrammarPoint interface defined',
    'Missing GrammarPoint interface'
  );
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  READING MODE RESPONSIVE INTEGRATION VALIDATION');
  console.log('='.repeat(70));
  
  validateCSSBreakpoints();
  validateThemeSupport();
  validateTouchTargets();
  validateAccessibility();
  validateComponentIntegration();
  validateDataStructure();
  validatePrerequisiteChains();
  validateLayoutOptimization();
  validateRouterIntegration();
  validateTypeSystem();
  
  // Summary
  console.log('\n' + '='.repeat(70));
  log.section('VALIDATION SUMMARY');
  console.log('='.repeat(70));
  
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`${colors.green}Passed: ${passedChecks}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedChecks}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${warnings}${colors.reset}`);
  
  const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%`);
  
  if (failedChecks === 0) {
    log.success('\n✓ All validation checks passed!');
    log.info('Reading mode responsive integration is complete and validated.');
    process.exit(0);
  } else {
    log.error(`\n✗ ${failedChecks} validation check(s) failed.`);
    log.info('Please address the failed checks before proceeding.');
    process.exit(1);
  }
}

main();
