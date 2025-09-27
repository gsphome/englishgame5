#!/usr/bin/env node

/**
 * Build Verification Script
 * Simple and clean build output verification
 */

import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

/**
 * Verify build output
 */
function verifyBuild() {
  const distDir = 'dist';
  const indexFile = path.join(distDir, 'index.html');
  
  // Check if dist directory exists
  if (!fs.existsSync(distDir)) {
    logError('Build directory not found');
    return false;
  }
  
  // Check if index.html exists
  if (!fs.existsSync(indexFile)) {
    logError('index.html not found in build');
    return false;
  }
  
  // Check for assets
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const assets = fs.readdirSync(assetsDir);
    const jsFiles = assets.filter(file => file.endsWith('.js')).length;
    const cssFiles = assets.filter(file => file.endsWith('.css')).length;
    
    logSuccess(`Build verified (${jsFiles} JS, ${cssFiles} CSS files)`);
  } else {
    logSuccess('Build verified');
  }
  
  return true;
}

/**
 * Main function
 */
function main() {
  const success = verifyBuild();
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}