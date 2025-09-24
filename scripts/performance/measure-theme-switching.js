#!/usr/bin/env node

/**
 * Theme Switching Performance Measurement
 * Measures baseline performance for theme switching operations
 */

import { performance } from 'perf_hooks';
import { JSDOM } from 'jsdom';

// Mock DOM environment for testing
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
  <meta name="theme-color" content="#ffffff">
  <style>
    :root {
      --theme-text-primary: #374151;
      --theme-bg-primary: #ffffff;
    }
    html.dark {
      --theme-text-primary: #f9fafb;
      --theme-bg-primary: #1f2937;
    }
    .test-element {
      color: var(--theme-text-primary);
      background-color: var(--theme-bg-primary);
      transition: all 0.2s ease;
    }
  </style>
</head>
<body>
  <div class="test-element">Test content</div>
</body>
</html>
`);

global.window = dom.window;
global.document = dom.window.document;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);

// Import theme utilities after setting up DOM
const { applyThemeToDOM } = await import('../../src/utils/themeInitializer.js');

/**
 * Measures time to switch from one theme to another
 */
function measureThemeSwitch(fromTheme, toTheme, iterations = 10) {
  const measurements = [];
  
  for (let i = 0; i < iterations; i++) {
    // Set initial theme
    applyThemeToDOM(fromTheme);
    
    // Measure switch time
    const startTime = performance.now();
    applyThemeToDOM(toTheme);
    const endTime = performance.now();
    
    measurements.push(endTime - startTime);
  }
  
  return {
    min: Math.min(...measurements),
    max: Math.max(...measurements),
    average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
    measurements
  };
}

/**
 * Measures CSS custom property re-evaluation time
 */
function measureCSSPropertyEvaluation() {
  const testElement = document.querySelector('.test-element');
  const startTime = performance.now();
  
  // Force style recalculation
  const computedStyle = window.getComputedStyle(testElement);
  const color = computedStyle.color;
  const backgroundColor = computedStyle.backgroundColor;
  
  const endTime = performance.now();
  
  return {
    time: endTime - startTime,
    color,
    backgroundColor
  };
}

/**
 * Main performance measurement function
 */
async function measureThemePerformance() {
  console.log('🎨 Theme Switching Performance Baseline');
  console.log('=====================================');
  
  // Measure light to dark switching
  console.log('\n📊 Light → Dark Theme Switching:');
  const lightToDark = measureThemeSwitch('light', 'dark', 20);
  console.log(`  Average: ${lightToDark.average.toFixed(2)}ms`);
  console.log(`  Min: ${lightToDark.min.toFixed(2)}ms`);
  console.log(`  Max: ${lightToDark.max.toFixed(2)}ms`);
  
  // Measure dark to light switching
  console.log('\n📊 Dark → Light Theme Switching:');
  const darkToLight = measureThemeSwitch('dark', 'light', 20);
  console.log(`  Average: ${darkToLight.average.toFixed(2)}ms`);
  console.log(`  Min: ${darkToLight.min.toFixed(2)}ms`);
  console.log(`  Max: ${darkToLight.max.toFixed(2)}ms`);
  
  // Measure CSS property evaluation
  console.log('\n📊 CSS Custom Property Evaluation:');
  const cssEval = measureCSSPropertyEvaluation();
  console.log(`  Time: ${cssEval.time.toFixed(2)}ms`);
  
  // Overall assessment
  const overallAverage = (lightToDark.average + darkToLight.average) / 2;
  console.log('\n🎯 Performance Assessment:');
  console.log(`  Overall Average: ${overallAverage.toFixed(2)}ms`);
  console.log(`  Target: < 100ms`);
  console.log(`  Status: ${overallAverage < 100 ? '✅ PASS' : '❌ FAIL'}`);
  
  // Return data for documentation
  return {
    lightToDark,
    darkToLight,
    cssEvaluation: cssEval,
    overallAverage,
    targetMet: overallAverage < 100
  };
}

// Run measurements if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const results = await measureThemePerformance();
    
    // Write results to baseline document
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const baselineFile = path.join(process.cwd(), 'docs/css-architecture-baseline.md');
    let content = await fs.readFile(baselineFile, 'utf8');
    
    // Add performance measurements section
    const performanceSection = `

## Theme Switching Performance Baseline

### Measurement Results (Node.js Environment)
- **Light → Dark Average**: ${results.lightToDark.average.toFixed(2)}ms
- **Dark → Light Average**: ${results.darkToLight.average.toFixed(2)}ms
- **CSS Property Evaluation**: ${results.cssEvaluation.time.toFixed(2)}ms
- **Overall Average**: ${results.overallAverage.toFixed(2)}ms

### Performance Status
- **Target**: < 100ms
- **Current Status**: ${results.targetMet ? '✅ PASS' : '❌ FAIL'}

### Notes
- Measurements taken in Node.js JSDOM environment
- Real browser performance may vary
- Baseline established for migration comparison`;

    content += performanceSection;
    await fs.writeFile(baselineFile, content);
    
    console.log('\n📝 Results written to docs/css-architecture-baseline.md');
    
  } catch (error) {
    console.error('❌ Error measuring theme performance:', error);
    process.exit(1);
  }
}

export { measureThemePerformance, measureThemeSwitch };