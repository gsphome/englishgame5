#!/usr/bin/env node

/**
 * Bundle Size Checker
 * Clean and informative bundle size validation
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

/**
 * Format file size in human readable format
 */
function formatSize(sizeKB) {
  if (sizeKB < 1024) {
    return `${sizeKB}KB`;
  } else {
    return `${(sizeKB / 1024).toFixed(1)}MB`;
  }
}

/**
 * Check CSS chunk sizes
 */
function checkCSSChunks() {
  try {
    // Run the existing CSS chunk validator
    execSync('node scripts/validation/check-css-chunks.js', { stdio: 'pipe' });
    return true;
  } catch (error) {
    logError('CSS chunk validation failed');
    return false;
  }
}

/**
 * Check JavaScript bundle sizes
 */
function checkJSBundles() {
  const assetsDir = path.join('dist', 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    logError('Assets directory not found');
    return false;
  }

  try {
    // Find all JS files and get their sizes
    const jsFiles = fs.readdirSync(assetsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        return { file, sizeKB };
      })
      .sort((a, b) => b.sizeKB - a.sizeKB); // Sort by size descending

    if (jsFiles.length === 0) {
      logWarning('No JavaScript files found');
      return false;
    }

    // Check for oversized bundles
    const oversized = jsFiles.filter(f => f.sizeKB > 1000); // > 1MB
    const large = jsFiles.filter(f => f.sizeKB > 500 && f.sizeKB <= 1000); // 500KB - 1MB

    // Report results
    const totalSize = jsFiles.reduce((sum, f) => sum + f.sizeKB, 0);
    
    if (oversized.length > 0) {
      logWarning(`Large bundles detected (${formatSize(totalSize)} total):`);
      oversized.forEach(f => {
        logWarning(`  ${f.file}: ${formatSize(f.sizeKB)} (>1MB)`);
      });
    } else if (large.length > 0) {
      logInfo(`Bundle sizes (${formatSize(totalSize)} total):`);
      large.forEach(f => {
        logInfo(`  ${f.file}: ${formatSize(f.sizeKB)}`);
      });
      logSuccess('All bundles under 1MB');
    } else {
      logSuccess(`Bundle sizes OK (${formatSize(totalSize)} total, largest: ${formatSize(jsFiles[0].sizeKB)})`);
    }

    return oversized.length === 0;
  } catch (error) {
    logError(`Failed to check bundle sizes: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  let success = true;

  // Check CSS chunks (silent - it has its own output)
  const cssOk = checkCSSChunks();
  
  // Check JS bundles
  const jsOk = checkJSBundles();

  success = cssOk && jsOk;

  if (success) {
    logSuccess('Bundle size validation completed');
  } else {
    logError('Bundle size validation failed');
  }

  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}