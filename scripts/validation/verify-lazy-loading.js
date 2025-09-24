#!/usr/bin/env node

/**
 * Lazy Loading Verification Script
 * Verifies React.lazy components and CSS chunk loading preservation
 * Part of CSS Architecture Refactor - Task 6.2
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Analyzes lazy loading patterns in source files
 */
async function analyzeLazyLoadingPatterns() {
  const srcPath = path.join(process.cwd(), 'src');
  
  const patterns = {
    reactLazy: [],
    dynamicImports: [],
    suspenseUsage: [],
    cssImports: []
  };
  
  // Find React.lazy usage
  const appRouterPath = path.join(srcPath, 'components/layout/AppRouter.tsx');
  try {
    const content = await fs.readFile(appRouterPath, 'utf-8');
    
    // Extract lazy component definitions
    const lazyMatches = content.match(/const\s+(\w+)\s*=\s*lazy\s*\(\s*\(\)\s*=>\s*import\(['"`]([^'"`]+)['"`]\)/g);
    if (lazyMatches) {
      lazyMatches.forEach(match => {
        const componentMatch = match.match(/const\s+(\w+)/);
        const pathMatch = match.match(/import\(['"`]([^'"`]+)['"`]\)/);
        
        if (componentMatch && pathMatch) {
          patterns.reactLazy.push({
            component: componentMatch[1],
            importPath: pathMatch[1],
            fullMatch: match
          });
        }
      });
    }
    
    // Check for Suspense usage
    if (content.includes('<Suspense')) {
      patterns.suspenseUsage.push({
        file: 'AppRouter.tsx',
        hasErrorBoundary: content.includes('fallback='),
        hasLoadingComponent: content.includes('ComponentLoader')
      });
    }
    
  } catch (error) {
    console.error('Error analyzing AppRouter.tsx:', error.message);
  }
  
  // Analyze component CSS imports
  const componentsPath = path.join(srcPath, 'components/learning');
  try {
    const files = await fs.readdir(componentsPath);
    const componentFiles = files.filter(file => file.endsWith('.tsx'));
    
    for (const file of componentFiles) {
      const filePath = path.join(componentsPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Check for CSS imports
      const cssImportMatches = content.match(/import\s+['"`][^'"`]*\.css['"`]/g);
      if (cssImportMatches) {
        patterns.cssImports.push({
          component: file,
          imports: cssImportMatches
        });
      }
    }
    
  } catch (error) {
    console.error('Error analyzing component CSS imports:', error.message);
  }
  
  return patterns;
}

/**
 * Verifies CSS chunks are generated for lazy components
 */
async function verifyCSSChunks() {
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  try {
    const files = await fs.readdir(assetsPath);
    const cssFiles = files.filter(file => file.endsWith('.css'));
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    const chunks = {
      css: cssFiles,
      js: jsFiles,
      componentChunks: []
    };
    
    // Identify component-specific chunks (individual or consolidated)
    const componentNames = ['FlashcardComponent', 'QuizComponent', 'CompletionComponent', 'SortingComponent', 'MatchingComponent'];
    
    // Check for consolidated component chunks first
    const consolidatedCSSChunk = cssFiles.find(file => file.includes('components-'));
    const consolidatedJSChunk = jsFiles.find(file => file.includes('components-'));
    
    componentNames.forEach(componentName => {
      // Look for individual chunks first
      let cssChunk = cssFiles.find(file => file.includes(componentName));
      let jsChunk = jsFiles.find(file => file.includes(componentName));
      
      // If no individual chunks, check if consolidated chunks exist
      if (!cssChunk && consolidatedCSSChunk) {
        cssChunk = consolidatedCSSChunk;
      }
      if (!jsChunk && consolidatedJSChunk) {
        jsChunk = consolidatedJSChunk;
      }
      
      chunks.componentChunks.push({
        component: componentName,
        hasCSSChunk: !!cssChunk,
        hasJSChunk: !!jsChunk,
        cssFile: cssChunk || null,
        jsFile: jsChunk || null,
        isConsolidated: cssChunk === consolidatedCSSChunk || jsChunk === consolidatedJSChunk
      });
    });
    
    return chunks;
    
  } catch (error) {
    console.error('Error verifying CSS chunks:', error.message);
    return null;
  }
}

/**
 * Tests theme CSS loading behavior
 */
async function verifyThemeLoading() {
  const themesPath = path.join(process.cwd(), 'src/styles/themes');
  
  try {
    const files = await fs.readdir(themesPath);
    const themeFiles = files.filter(file => file.endsWith('.css'));
    
    const themes = {
      available: themeFiles,
      contexts: [],
      loadingStrategy: 'static' // Will be 'dynamic' when theme context switching is implemented
    };
    
    // Analyze theme files
    for (const file of themeFiles) {
      const filePath = path.join(themesPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      const context = {
        file,
        hasMediaQueries: content.includes('@media'),
        hasDarkModeRules: content.includes('.dark'),
        hasCustomProperties: content.includes('--'),
        size: Math.round((await fs.stat(filePath)).size / 1024 * 100) / 100
      };
      
      themes.contexts.push(context);
    }
    
    return themes;
    
  } catch (error) {
    console.error('Error verifying theme loading:', error.message);
    return null;
  }
}

/**
 * Validates lazy loading configuration
 */
function validateLazyLoadingConfig(patterns, chunks, themes) {
  const validation = {
    reactLazy: {
      status: 'PASS',
      issues: [],
      components: patterns.reactLazy.length
    },
    cssChunks: {
      status: 'PASS',
      issues: [],
      chunks: chunks?.componentChunks.length || 0
    },
    themeLoading: {
      status: 'PASS',
      issues: [],
      themes: themes?.contexts.length || 0
    },
    overall: 'PASS'
  };
  
  // Validate React.lazy usage
  if (patterns.reactLazy.length === 0) {
    validation.reactLazy.status = 'FAIL';
    validation.reactLazy.issues.push('No React.lazy components found');
    validation.overall = 'FAIL';
  }
  
  const expectedComponents = ['FlashcardComponent', 'QuizComponent', 'CompletionComponent', 'SortingComponent', 'MatchingComponent'];
  const foundComponents = patterns.reactLazy.map(p => p.component);
  const missingComponents = expectedComponents.filter(comp => !foundComponents.includes(comp));
  
  if (missingComponents.length > 0) {
    validation.reactLazy.status = 'WARNING';
    validation.reactLazy.issues.push(`Missing lazy loading for: ${missingComponents.join(', ')}`);
    if (validation.overall === 'PASS') validation.overall = 'WARNING';
  }
  
  // Validate CSS chunks
  if (chunks) {
    const componentsWithoutCSS = chunks.componentChunks.filter(chunk => !chunk.hasCSSChunk);
    if (componentsWithoutCSS.length > 0) {
      validation.cssChunks.status = 'WARNING';
      validation.cssChunks.issues.push(`Components without CSS chunks: ${componentsWithoutCSS.map(c => c.component).join(', ')}`);
      if (validation.overall === 'PASS') validation.overall = 'WARNING';
    }
    
    const componentsWithoutJS = chunks.componentChunks.filter(chunk => !chunk.hasJSChunk);
    if (componentsWithoutJS.length > 0) {
      validation.cssChunks.status = 'FAIL';
      validation.cssChunks.issues.push(`Components without JS chunks: ${componentsWithoutJS.map(c => c.component).join(', ')}`);
      validation.overall = 'FAIL';
    }
  }
  
  // Validate theme loading
  if (themes) {
    const expectedThemes = ['web-light.css', 'web-dark.css', 'mobile-light.css', 'mobile-dark.css'];
    const foundThemes = themes.available;
    const missingThemes = expectedThemes.filter(theme => !foundThemes.includes(theme));
    
    if (missingThemes.length > 0) {
      validation.themeLoading.status = 'WARNING';
      validation.themeLoading.issues.push(`Missing theme files: ${missingThemes.join(', ')}`);
      if (validation.overall === 'PASS') validation.overall = 'WARNING';
    }
  }
  
  return validation;
}

/**
 * Displays lazy loading verification report
 */
function displayLazyLoadingReport(patterns, chunks, themes, validation) {
  console.log('🔄 Lazy Loading Verification Report');
  console.log('===================================');
  
  // Overall status
  const statusIcon = {
    'PASS': '✅',
    'WARNING': '⚠️',
    'FAIL': '❌'
  }[validation.overall];
  
  console.log(`\n${statusIcon} Overall Status: ${validation.overall}`);
  
  // React.lazy components
  console.log(`\n🔄 React.lazy Components:`);
  console.log(`  Status: ${validation.reactLazy.status === 'PASS' ? '✅' : validation.reactLazy.status === 'WARNING' ? '⚠️' : '❌'} ${validation.reactLazy.status}`);
  console.log(`  Components: ${validation.reactLazy.components}`);
  
  patterns.reactLazy.forEach(component => {
    console.log(`    ✅ ${component.component} → ${component.importPath}`);
  });
  
  if (validation.reactLazy.issues.length > 0) {
    console.log(`  Issues:`);
    validation.reactLazy.issues.forEach(issue => {
      console.log(`    - ${issue}`);
    });
  }
  
  // CSS chunks
  console.log(`\n🎨 CSS Chunks:`);
  console.log(`  Status: ${validation.cssChunks.status === 'PASS' ? '✅' : validation.cssChunks.status === 'WARNING' ? '⚠️' : '❌'} ${validation.cssChunks.status}`);
  console.log(`  Component Chunks: ${validation.cssChunks.chunks}`);
  
  if (chunks) {
    chunks.componentChunks.forEach(chunk => {
      const cssStatus = chunk.hasCSSChunk ? '✅' : '❌';
      const jsStatus = chunk.hasJSChunk ? '✅' : '❌';
      const consolidatedNote = chunk.isConsolidated ? ' (consolidated)' : '';
      console.log(`    ${chunk.component}:`);
      console.log(`      CSS: ${cssStatus} ${chunk.cssFile || 'Not found'}${consolidatedNote}`);
      console.log(`      JS:  ${jsStatus} ${chunk.jsFile || 'Not found'}${consolidatedNote}`);
    });
  }
  
  if (validation.cssChunks.issues.length > 0) {
    console.log(`  Issues:`);
    validation.cssChunks.issues.forEach(issue => {
      console.log(`    - ${issue}`);
    });
  }
  
  // Theme loading
  console.log(`\n🎭 Theme Loading:`);
  console.log(`  Status: ${validation.themeLoading.status === 'PASS' ? '✅' : validation.themeLoading.status === 'WARNING' ? '⚠️' : '❌'} ${validation.themeLoading.status}`);
  console.log(`  Theme Files: ${validation.themeLoading.themes}`);
  
  if (themes) {
    themes.contexts.forEach(theme => {
      console.log(`    ✅ ${theme.file} (${theme.size}KB)`);
      if (theme.hasMediaQueries) console.log(`      📱 Has media queries`);
      if (theme.hasDarkModeRules) console.log(`      🌙 Has dark mode rules`);
      if (theme.hasCustomProperties) console.log(`      🎨 Has custom properties`);
    });
  }
  
  if (validation.themeLoading.issues.length > 0) {
    console.log(`  Issues:`);
    validation.themeLoading.issues.forEach(issue => {
      console.log(`    - ${issue}`);
    });
  }
  
  // Suspense usage
  if (patterns.suspenseUsage.length > 0) {
    console.log(`\n⏳ Suspense Usage:`);
    patterns.suspenseUsage.forEach(usage => {
      console.log(`    ✅ ${usage.file}`);
      console.log(`      Error Boundary: ${usage.hasErrorBoundary ? '✅' : '❌'}`);
      console.log(`      Loading Component: ${usage.hasLoadingComponent ? '✅' : '❌'}`);
    });
  }
}

/**
 * Saves verification results
 */
async function saveVerificationResults(patterns, chunks, themes, validation) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    patterns,
    chunks,
    themes,
    validation,
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      generatedBy: 'verify-lazy-loading.js'
    }
  };
  
  const reportsDir = path.join(process.cwd(), 'docs/performance-snapshots');
  await fs.mkdir(reportsDir, { recursive: true });
  
  const filename = `lazy-loading-verification-${Date.now()}.json`;
  const filepath = path.join(reportsDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(report, null, 2));
  
  return filepath;
}

/**
 * Main verification function
 */
async function verifyLazyLoadingMain() {
  console.log('🔍 Verifying lazy loading preservation...');
  
  const patterns = await analyzeLazyLoadingPatterns();
  const chunks = await verifyCSSChunks();
  const themes = await verifyThemeLoading();
  
  const validation = validateLazyLoadingConfig(patterns, chunks, themes);
  
  displayLazyLoadingReport(patterns, chunks, themes, validation);
  
  // Save results
  try {
    const reportPath = await saveVerificationResults(patterns, chunks, themes, validation);
    console.log(`\n📄 Verification report saved: ${path.basename(reportPath)}`);
  } catch (error) {
    console.error('⚠️ Failed to save verification report:', error.message);
  }
  
  // Exit with appropriate code
  if (validation.overall === 'FAIL') {
    console.log('\n❌ Lazy loading verification FAILED');
    process.exit(1);
  } else if (validation.overall === 'WARNING') {
    console.log('\n⚠️ Lazy loading verification passed with WARNINGS');
    process.exit(0);
  } else {
    console.log('\n✅ Lazy loading verification PASSED');
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyLazyLoadingMain().catch(console.error);
}

export { verifyLazyLoadingMain, analyzeLazyLoadingPatterns, verifyCSSChunks };