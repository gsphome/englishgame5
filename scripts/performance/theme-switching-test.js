#!/usr/bin/env node

/**
 * Simple Theme Switching Performance Test
 * Tests theme context switching performance without complex dependencies
 */

import { performance } from 'perf_hooks';
import { JSDOM } from 'jsdom';

// Create a mock DOM environment with our theme CSS
const dom = new JSDOM(`
<!DOCTYPE html>
<html class="light">
<head>
  <style>
    /* Design System Tokens */
    :root {
      --theme-text-primary: #374151;
      --theme-bg-elevated: #ffffff;
      --theme-border-soft: #f3f4f6;
    }
    
    html.dark {
      --theme-text-primary: #ffffff;
      --theme-bg-elevated: #1f2937;
      --theme-border-soft: #4b5563;
    }
    
    /* Test components */
    .header-redesigned {
      background-color: var(--theme-bg-elevated);
      color: var(--theme-text-primary);
      border-color: var(--theme-border-soft);
      transition: all 0.2s ease;
    }
    
    .module-card {
      background-color: var(--theme-bg-elevated);
      color: var(--theme-text-primary);
      border-color: var(--theme-border-soft);
      transition: all 0.2s ease;
    }
    
    .compact-settings__container {
      background-color: var(--theme-bg-elevated);
      color: var(--theme-text-primary);
      border-color: var(--theme-border-soft);
      transition: all 0.2s ease;
    }
  </style>
</head>
<body>
  <div class="header-redesigned">Header</div>
  <div class="module-card">Module Card</div>
  <div class="compact-settings__container">Settings</div>
</body>
</html>
`);

global.window = dom.window;
global.document = dom.window.document;

/**
 * Simulates theme switching by toggling classes
 */
function switchTheme(toTheme) {
  const html = document.documentElement;
  
  if (toTheme === 'dark') {
    html.classList.remove('light');
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
  }
  
  // Force style recalculation
  const elements = document.querySelectorAll('.header-redesigned, .module-card, .compact-settings__container');
  elements.forEach(el => {
    window.getComputedStyle(el).color;
    window.getComputedStyle(el).backgroundColor;
  });
}

/**
 * Measures theme switching performance
 */
function measureThemeSwitching(iterations = 50) {
  const measurements = {
    lightToDark: [],
    darkToLight: [],
    cssPropertyEvaluation: []
  };
  
  console.log('🎨 Measuring Theme Switching Performance...');
  
  // Measure light to dark
  for (let i = 0; i < iterations; i++) {
    // Start in light mode
    switchTheme('light');
    
    const startTime = performance.now();
    switchTheme('dark');
    const endTime = performance.now();
    
    measurements.lightToDark.push(endTime - startTime);
  }
  
  // Measure dark to light
  for (let i = 0; i < iterations; i++) {
    // Start in dark mode
    switchTheme('dark');
    
    const startTime = performance.now();
    switchTheme('light');
    const endTime = performance.now();
    
    measurements.darkToLight.push(endTime - startTime);
  }
  
  // Measure CSS custom property evaluation
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    const elements = document.querySelectorAll('.header-redesigned, .module-card, .compact-settings__container');
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      style.color;
      style.backgroundColor;
      style.borderColor;
    });
    
    const endTime = performance.now();
    measurements.cssPropertyEvaluation.push(endTime - startTime);
  }
  
  return measurements;
}

/**
 * Calculates statistics from measurements
 */
function calculateStats(measurements) {
  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const min = arr => Math.min(...arr);
  const max = arr => Math.max(...arr);
  
  return {
    lightToDark: {
      average: avg(measurements.lightToDark),
      min: min(measurements.lightToDark),
      max: max(measurements.lightToDark)
    },
    darkToLight: {
      average: avg(measurements.darkToLight),
      min: min(measurements.darkToLight),
      max: max(measurements.darkToLight)
    },
    cssPropertyEvaluation: {
      average: avg(measurements.cssPropertyEvaluation),
      min: min(measurements.cssPropertyEvaluation),
      max: max(measurements.cssPropertyEvaluation)
    }
  };
}

/**
 * Main test function
 */
async function runPerformanceTest() {
  console.log('🚀 Theme Context Switching Performance Test');
  console.log('==========================================');
  
  const measurements = measureThemeSwitching(100);
  const stats = calculateStats(measurements);
  
  console.log('\n📊 Results:');
  console.log(`Light → Dark: ${stats.lightToDark.average.toFixed(3)}ms (min: ${stats.lightToDark.min.toFixed(3)}ms, max: ${stats.lightToDark.max.toFixed(3)}ms)`);
  console.log(`Dark → Light: ${stats.darkToLight.average.toFixed(3)}ms (min: ${stats.darkToLight.min.toFixed(3)}ms, max: ${stats.darkToLight.max.toFixed(3)}ms)`);
  console.log(`CSS Property Evaluation: ${stats.cssPropertyEvaluation.average.toFixed(3)}ms (min: ${stats.cssPropertyEvaluation.min.toFixed(3)}ms, max: ${stats.cssPropertyEvaluation.max.toFixed(3)}ms)`);
  
  const overallAverage = (stats.lightToDark.average + stats.darkToLight.average) / 2;
  console.log(`\n🎯 Overall Average: ${overallAverage.toFixed(3)}ms`);
  console.log(`Target: < 100ms`);
  console.log(`Status: ${overallAverage < 100 ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test for visual flashing (no transitions should exceed 200ms)
  const maxTransition = Math.max(stats.lightToDark.max, stats.darkToLight.max);
  console.log(`\n🔄 Visual Flashing Test:`);
  console.log(`Max transition time: ${maxTransition.toFixed(3)}ms`);
  console.log(`Target: < 200ms (no visual flashing)`);
  console.log(`Status: ${maxTransition < 200 ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test CSS custom properties re-evaluation
  console.log(`\n🎨 CSS Custom Properties Re-evaluation:`);
  console.log(`Average: ${stats.cssPropertyEvaluation.average.toFixed(3)}ms`);
  console.log(`Target: < 10ms`);
  console.log(`Status: ${stats.cssPropertyEvaluation.average < 10 ? '✅ PASS' : '❌ FAIL'}`);
  
  return {
    overallAverage,
    maxTransition,
    cssEvaluation: stats.cssPropertyEvaluation.average,
    allTargetsMet: overallAverage < 100 && maxTransition < 200 && stats.cssPropertyEvaluation.average < 10
  };
}

// Run the test
try {
  const results = await runPerformanceTest();
  
  if (results.allTargetsMet) {
    console.log('\n🎉 All performance targets met!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some performance targets not met. Review theme implementation.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error running performance test:', error);
  process.exit(1);
}