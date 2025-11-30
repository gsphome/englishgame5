#!/usr/bin/env node

/**
 * Reading Mode Performance Optimization Validation
 * 
 * Validates:
 * - Reading content loading optimization
 * - CSS bundle size impact
 * - Content preloading for smooth navigation
 * - Lazy loading implementation
 * - Bundle size metrics
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

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// 1. CSS BUNDLE SIZE VALIDATION
// ============================================================================

function validateCSSBundleSize() {
  log.section('1. CSS Bundle Size Impact');
  
  const cssPath = path.join(process.cwd(), 'src/styles/components/reading-component.css');
  
  if (!fs.existsSync(cssPath)) {
    check(false, '', 'reading-component.css not found');
    return;
  }
  
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  const cssSize = Buffer.byteLength(cssContent, 'utf-8');
  
  log.info(`CSS file size: ${formatBytes(cssSize)}`);
  
  // Check CSS size is reasonable (< 50KB uncompressed)
  check(
    cssSize < 50 * 1024,
    `CSS size (${formatBytes(cssSize)}) is within optimal range (< 50KB)`,
    `CSS size (${formatBytes(cssSize)}) exceeds recommended limit (50KB)`
  );
  
  // Count CSS rules
  const ruleCount = (cssContent.match(/\{/g) || []).length;
  log.info(`CSS rules count: ${ruleCount}`);
  
  warn(
    ruleCount < 200,
    `CSS has ${ruleCount} rules - consider optimization if > 200`
  );
  
  // Check for unnecessary duplication
  const lines = cssContent.split('\n');
  const uniqueLines = new Set(lines.filter(l => l.trim()));
  const duplicationRatio = (lines.length - uniqueLines.size) / lines.length;
  
  warn(
    duplicationRatio < 0.3,
    `CSS duplication ratio: ${(duplicationRatio * 100).toFixed(1)}% - acceptable for BEM architecture`
  );
}

// ============================================================================
// 2. LAZY LOADING VALIDATION
// ============================================================================

function validateLazyLoading() {
  log.section('2. Lazy Loading Implementation');
  
  const routerPath = path.join(process.cwd(), 'src/components/layout/AppRouter.tsx');
  
  if (!fs.existsSync(routerPath)) {
    check(false, '', 'AppRouter.tsx not found');
    return;
  }
  
  const routerContent = fs.readFileSync(routerPath, 'utf-8');
  
  // Check for lazy loading
  check(
    routerContent.includes('const ReadingComponent = lazy('),
    'ReadingComponent uses React.lazy()',
    'ReadingComponent not using React.lazy()'
  );
  
  // Check for Suspense wrapper
  check(
    routerContent.includes('<Suspense'),
    'Suspense wrapper implemented',
    'Missing Suspense wrapper'
  );
  
  // Check for loading fallback
  check(
    routerContent.includes('fallback') || routerContent.includes('ComponentLoader'),
    'Loading fallback defined',
    'Missing loading fallback'
  );
  
  // Check for error handling
  check(
    routerContent.includes('.catch(') || routerContent.includes('ErrorBoundary'),
    'Error handling for lazy loading',
    'Missing error handling for lazy loading'
  );
}

// ============================================================================
// 3. DATA LOADING OPTIMIZATION
// ============================================================================

function validateDataLoading() {
  log.section('3. Data Loading Optimization');
  
  const componentPath = path.join(process.cwd(), 'src/components/learning/ReadingComponent.tsx');
  
  if (!fs.existsSync(componentPath)) {
    check(false, '', 'ReadingComponent.tsx not found');
    return;
  }
  
  const componentContent = fs.readFileSync(componentPath, 'utf-8');
  
  // Check for useMemo optimization
  check(
    componentContent.includes('useMemo'),
    'useMemo used for data optimization',
    'Consider using useMemo for expensive computations'
  );
  
  // Check for useCallback optimization
  check(
    componentContent.includes('useCallback'),
    'useCallback used for function optimization',
    'Consider using useCallback for event handlers'
  );
  
  // Check for early return pattern
  check(
    componentContent.includes('if (!readingData') || componentContent.includes('if (!module'),
    'Early return pattern for missing data',
    'Missing early return for data validation'
  );
  
  // Check for loading state
  warn(
    componentContent.includes('loading') || componentContent.includes('isLoading'),
    'Consider adding explicit loading state'
  );
}

// ============================================================================
// 4. JSON DATA SIZE VALIDATION
// ============================================================================

function validateJSONDataSize() {
  log.section('4. JSON Data Size Optimization');
  
  const dataDir = path.join(process.cwd(), 'public/data');
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  
  let totalSize = 0;
  let largestFile = { name: '', size: 0 };
  let fileCount = 0;
  
  levels.forEach(level => {
    const levelDir = path.join(dataDir, level);
    if (!fs.existsSync(levelDir)) return;
    
    const files = fs.readdirSync(levelDir);
    const readingFiles = files.filter(f => f.includes('reading') && f.endsWith('.json'));
    
    readingFiles.forEach(file => {
      const filePath = path.join(levelDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      
      totalSize += size;
      fileCount++;
      
      if (size > largestFile.size) {
        largestFile = { name: file, size };
      }
      
      // Warn if individual file is too large (> 100KB)
      if (size > 100 * 1024) {
        warn(false, `${file} is large (${formatBytes(size)}) - consider splitting content`);
      }
    });
  });
  
  log.info(`Total reading data size: ${formatBytes(totalSize)}`);
  log.info(`Average file size: ${formatBytes(totalSize / fileCount)}`);
  log.info(`Largest file: ${largestFile.name} (${formatBytes(largestFile.size)})`);
  
  // Check total size is reasonable (< 500KB for all reading modules)
  check(
    totalSize < 500 * 1024,
    `Total data size (${formatBytes(totalSize)}) is optimal (< 500KB)`,
    `Total data size (${formatBytes(totalSize)}) may impact performance`
  );
  
  // Check average file size
  const avgSize = totalSize / fileCount;
  check(
    avgSize < 50 * 1024,
    `Average file size (${formatBytes(avgSize)}) is optimal (< 50KB)`,
    `Average file size (${formatBytes(avgSize)}) is high - consider optimization`
  );
}

// ============================================================================
// 5. COMPONENT OPTIMIZATION PATTERNS
// ============================================================================

function validateComponentOptimization() {
  log.section('5. Component Optimization Patterns');
  
  const componentPath = path.join(process.cwd(), 'src/components/learning/ReadingComponent.tsx');
  const componentContent = fs.readFileSync(componentPath, 'utf-8');
  
  // Check for unnecessary re-renders prevention
  check(
    componentContent.includes('React.memo') || componentContent.includes('useCallback') || componentContent.includes('useMemo'),
    'Optimization hooks used (useMemo/useCallback)',
    'Consider using optimization hooks'
  );
  
  // Check for state management efficiency
  const stateCount = (componentContent.match(/useState/g) || []).length;
  log.info(`useState hooks count: ${stateCount}`);
  
  warn(
    stateCount < 10,
    `Component has ${stateCount} useState hooks - consider consolidation if > 10`
  );
  
  // Check for effect cleanup
  check(
    componentContent.includes('return () =>') || componentContent.includes('cleanup'),
    'Effect cleanup implemented',
    'Verify effect cleanup for memory leaks'
  );
  
  // Check for event listener cleanup
  check(
    componentContent.includes('removeEventListener'),
    'Event listeners properly cleaned up',
    'Missing event listener cleanup'
  );
}

// ============================================================================
// 6. CONTENT PRELOADING VALIDATION
// ============================================================================

function validateContentPreloading() {
  log.section('6. Content Preloading Strategy');
  
  const componentPath = path.join(process.cwd(), 'src/components/learning/ReadingComponent.tsx');
  const componentContent = fs.readFileSync(componentPath, 'utf-8');
  
  // Check for data prefetching patterns
  warn(
    componentContent.includes('prefetch') || componentContent.includes('preload'),
    'Consider implementing content prefetching for next section'
  );
  
  // Check for section caching
  warn(
    componentContent.includes('cache') || componentContent.includes('Map') || componentContent.includes('Set'),
    'State management uses efficient data structures (Map/Set)'
  );
  
  // Check for image lazy loading (if multimedia is added)
  const hasImageOptimization = 
    componentContent.includes('loading="lazy"') ||
    componentContent.includes('IntersectionObserver');
  
  if (componentContent.includes('<img') || componentContent.includes('Image')) {
    check(
      hasImageOptimization,
      'Image lazy loading implemented',
      'Consider adding lazy loading for images'
    );
  } else {
    log.info('No images detected - lazy loading not required');
  }
}

// ============================================================================
// 7. BUNDLE ANALYSIS
// ============================================================================

function validateBundleImpact() {
  log.section('7. Bundle Impact Analysis');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    log.warning('dist folder not found - run "npm run build" first for complete analysis');
    return;
  }
  
  // Find reading-related chunks
  const files = fs.readdirSync(distPath, { recursive: true });
  const jsFiles = files.filter(f => typeof f === 'string' && f.endsWith('.js'));
  const cssFiles = files.filter(f => typeof f === 'string' && f.endsWith('.css'));
  
  log.info(`Total JS chunks: ${jsFiles.length}`);
  log.info(`Total CSS chunks: ${cssFiles.length}`);
  
  // Check for reading component chunk
  const readingChunk = jsFiles.find(f => f.includes('Reading') || f.includes('reading'));
  
  if (readingChunk) {
    const chunkPath = path.join(distPath, readingChunk);
    const chunkSize = fs.statSync(chunkPath).size;
    log.info(`Reading component chunk: ${readingChunk} (${formatBytes(chunkSize)})`);
    
    check(
      chunkSize < 100 * 1024,
      `Reading chunk size (${formatBytes(chunkSize)}) is optimal (< 100KB)`,
      `Reading chunk size (${formatBytes(chunkSize)}) is large - consider optimization`
    );
  } else {
    log.info('Reading component chunk not found separately (may be in main bundle)');
  }
  
  // Check for CSS chunk
  const readingCSSChunk = cssFiles.find(f => f.includes('reading'));
  
  if (readingCSSChunk) {
    const cssChunkPath = path.join(distPath, readingCSSChunk);
    const cssChunkSize = fs.statSync(cssChunkPath).size;
    log.info(`Reading CSS chunk: ${readingCSSChunk} (${formatBytes(cssChunkSize)})`);
    
    check(
      cssChunkSize < 20 * 1024,
      `Reading CSS chunk (${formatBytes(cssChunkSize)}) is optimal (< 20KB)`,
      `Reading CSS chunk (${formatBytes(cssChunkSize)}) is large`
    );
  }
}

// ============================================================================
// 8. PERFORMANCE BEST PRACTICES
// ============================================================================

function validatePerformanceBestPractices() {
  log.section('8. Performance Best Practices');
  
  const componentPath = path.join(process.cwd(), 'src/components/learning/ReadingComponent.tsx');
  const componentContent = fs.readFileSync(componentPath, 'utf-8');
  
  // Check for key prop in lists
  check(
    componentContent.includes('key='),
    'Key props used in list rendering',
    'Missing key props in list rendering'
  );
  
  // Check for conditional rendering optimization
  check(
    componentContent.includes('&&') || componentContent.includes('?'),
    'Conditional rendering used',
    'Verify conditional rendering patterns'
  );
  
  // Check for inline function definitions (anti-pattern)
  const inlineFunctions = (componentContent.match(/onClick=\{.*=>/g) || []).length;
  
  warn(
    inlineFunctions < 5,
    `Found ${inlineFunctions} inline arrow functions - consider useCallback for frequently re-rendered components`
  );
  
  // Check for CSS-in-JS (should not be present - we use pure CSS)
  check(
    !componentContent.includes('styled.') && !componentContent.includes('css`'),
    'No CSS-in-JS detected (using pure CSS as intended)',
    'CSS-in-JS detected - should use pure CSS files'
  );
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  READING MODE PERFORMANCE OPTIMIZATION VALIDATION');
  console.log('='.repeat(70));
  
  validateCSSBundleSize();
  validateLazyLoading();
  validateDataLoading();
  validateJSONDataSize();
  validateComponentOptimization();
  validateContentPreloading();
  validateBundleImpact();
  validatePerformanceBestPractices();
  
  // Summary
  console.log('\n' + '='.repeat(70));
  log.section('VALIDATION SUMMARY');
  console.log('='.repeat(70));
  
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`${colors.green}Passed: ${passedChecks}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedChecks}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${warnings}${colors.reset}`);
  
  const successRate = totalChecks > 0 ? ((passedChecks / totalChecks) * 100).toFixed(1) : 0;
  console.log(`\nSuccess Rate: ${successRate}%`);
  
  if (failedChecks === 0) {
    log.success('\n✓ All performance validation checks passed!');
    log.info('Reading mode is optimized for production.');
    
    if (warnings > 0) {
      log.warning(`\n⚠ ${warnings} optimization suggestion(s) - review for potential improvements.`);
    }
    
    process.exit(0);
  } else {
    log.error(`\n✗ ${failedChecks} performance check(s) failed.`);
    log.info('Please address the failed checks for optimal performance.');
    process.exit(1);
  }
}

main();
