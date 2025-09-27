#!/usr/bin/env node

/**
 * Production Readiness Validator
 * Simplified validation for build:full pipeline
 * Focuses on critical production issues only
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

/**
 * Validate production readiness - focused on critical issues
 */
function validateProductionReadiness() {
  const distPath = path.resolve('dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    logError('Build output not found');
    return false;
  }
  
  const html = fs.readFileSync(indexPath, 'utf8');
  let issues = 0;
  
  // 1. CRITICAL: Verify React is in main bundle (synchronous loading)
  const moduleScripts = html.match(/<script[^>]*type="module"[^>]*src="[^"]*"[^>]*>/g) || [];
  const mainScript = moduleScripts.find(script => script.includes('index-'));
  
  if (!mainScript) {
    logError('Main module script not found');
    issues++;
  } else {
    // Check main bundle size (should include React)
    const srcMatch = mainScript.match(/src="([^"]*)"/);
    if (srcMatch) {
      const scriptPath = srcMatch[1].replace('/englishgame5/', '');
      const fullPath = path.join(distPath, scriptPath);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const sizeKB = Math.round(stats.size / 1024);
        
        if (sizeKB < 100) {
          logWarning(`Main bundle unusually small (${sizeKB}KB) - React may not be included`);
          issues++;
        } else {
          logSuccess(`React bundled in main script (${sizeKB}KB)`);
        }
      }
    }
  }
  
  // 2. CRITICAL: Check for problematic async React loading
  const preloads = html.match(/<link[^>]*rel="modulepreload"[^>]*href="[^"]*react[^"]*"/g);
  if (preloads && preloads.length > 0) {
    logWarning('React detected in preload chunks - may cause F.createContext errors');
    issues++;
  } else {
    logSuccess('React not in separate chunks (good for sync loading)');
  }
  
  // 3. PERFORMANCE: Check chunk count and sizes
  const allPreloads = html.match(/<link[^>]*rel="modulepreload"[^>]*>/g) || [];
  if (allPreloads.length > 6) {
    logWarning(`Many preload chunks (${allPreloads.length}) - may impact initial load`);
  } else {
    logSuccess(`Reasonable chunk count (${allPreloads.length} preloads)`);
  }
  
  // 4. ARCHITECTURE: Verify chunk strategy
  const assetsDir = path.join(distPath, 'assets');
  if (fs.existsSync(assetsDir)) {
    const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
    const totalSize = jsFiles.reduce((sum, file) => {
      const stats = fs.statSync(path.join(assetsDir, file));
      return sum + stats.size;
    }, 0);
    const totalKB = Math.round(totalSize / 1024);
    
    if (totalKB > 1000) {
      logWarning(`Large total bundle size (${totalKB}KB)`);
    } else {
      logSuccess(`Bundle size OK (${totalKB}KB total)`);
    }
  }
  
  // 5. CRITICAL: Theme initialization check
  if (!html.includes('Theme initialization script') && !html.includes('applyMobileTheme')) {
    logWarning('Theme initialization script not found');
  } else {
    logSuccess('Theme initialization present');
  }
  
  return issues === 0;
}

/**
 * Main function - designed for build pipeline integration
 */
function main() {
  const success = validateProductionReadiness();
  
  if (success) {
    logSuccess('Production readiness validation passed');
  } else {
    logError('Production readiness validation failed');
    log('💡 Run "npm run analyze:production" for detailed analysis', colors.blue);
  }
  
  // Exit with appropriate code for pipeline
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateProductionReadiness };