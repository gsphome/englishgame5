#!/usr/bin/env node

/**
 * Chunk Order Verification
 * Verifies that critical dependencies (React) load before other chunks
 */

import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
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

function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

/**
 * Verify chunk loading order in built HTML
 */
function verifyChunkOrder() {
  const indexPath = path.join('dist', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    logError('dist/index.html not found. Run build first.');
    return false;
  }
  
  const html = fs.readFileSync(indexPath, 'utf8');
  
  // Extract script tags in order
  const scriptMatches = html.match(/<script[^>]*src="[^"]*"[^>]*>/g) || [];
  const scripts = scriptMatches.map(script => {
    const srcMatch = script.match(/src="([^"]*)"/);
    return srcMatch ? srcMatch[1] : null;
  }).filter(Boolean);
  
  logInfo('Script loading order:');
  scripts.forEach((script, index) => {
    const filename = path.basename(script);
    log(`  ${index + 1}. ${filename}`, colors.blue);
  });
  
  // Check if vendor chunk loads first
  const vendorIndex = scripts.findIndex(script => script.includes('vendor-'));
  const otherChunks = scripts.filter((script, index) => 
    index !== vendorIndex && 
    (script.includes('learning-components-') || 
     script.includes('ui-components-') || 
     script.includes('index-'))
  );
  
  let success = true;
  
  if (vendorIndex === -1) {
    logWarning('No vendor chunk found - React may be bundled elsewhere');
  } else if (vendorIndex === 0) {
    logSuccess('Vendor chunk loads first ✓');
  } else {
    logError(`Vendor chunk loads at position ${vendorIndex + 1}, should be first`);
    success = false;
  }
  
  // Check for React-related chunks
  const reactChunks = scripts.filter(script => 
    script.includes('react') || script.includes('vendor')
  );
  
  if (reactChunks.length > 0) {
    logSuccess(`Found ${reactChunks.length} React-related chunk(s)`);
  } else {
    logWarning('No explicit React chunks found - may be in main bundle');
  }
  
  // Analyze chunk sizes if available
  const assetsDir = path.join('dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const jsFiles = fs.readdirSync(assetsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: Math.round(stats.size / 1024)
        };
      })
      .sort((a, b) => b.size - a.size);
    
    logInfo('\nChunk sizes:');
    jsFiles.forEach(file => {
      const sizeColor = file.size > 200 ? colors.yellow : colors.green;
      log(`  ${file.name}: ${file.size}KB`, sizeColor);
    });
  }
  
  return success;
}

/**
 * Main function
 */
function main() {
  log('🔍 Verifying chunk loading order...', colors.blue);
  console.log('='.repeat(50));
  
  const success = verifyChunkOrder();
  
  console.log('='.repeat(50));
  
  if (success) {
    logSuccess('Chunk order verification passed');
  } else {
    logError('Chunk order verification failed');
  }
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}