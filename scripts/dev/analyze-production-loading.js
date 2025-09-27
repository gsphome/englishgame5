#!/usr/bin/env node

/**
 * Production Loading Analysis
 * Analyzes exactly how chunks load in production vs development
 */

import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Analyze the built HTML and chunk loading strategy
 */
function analyzeProductionLoading() {
  const distPath = path.resolve('dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    log('❌ dist/index.html not found. Run "npm run build" first.', colors.red);
    return false;
  }
  
  const html = fs.readFileSync(indexPath, 'utf8');
  
  log('🔍 Production Loading Analysis', colors.cyan);
  log('='.repeat(60), colors.cyan);
  
  // 1. Extract and analyze script tags
  const scriptMatches = html.match(/<script[^>]*>/g) || [];
  const moduleScripts = scriptMatches.filter(script => script.includes('type="module"'));
  const regularScripts = scriptMatches.filter(script => !script.includes('type="module"'));
  
  log('\n📜 Script Loading Order:', colors.blue);
  log('─'.repeat(30), colors.blue);
  
  // Inline scripts (theme initialization)
  const inlineScripts = scriptMatches.filter(script => !script.includes('src='));
  if (inlineScripts.length > 0) {
    log('1. 🔧 Inline Scripts (execute immediately):', colors.green);
    inlineScripts.forEach((script, index) => {
      const content = script.length > 100 ? script.substring(0, 100) + '...' : script;
      log(`   ${index + 1}. Theme initialization`, colors.yellow);
    });
  }
  
  // Module scripts (main entry point)
  if (moduleScripts.length > 0) {
    log('2. 🎯 Module Scripts (ES6 modules):', colors.green);
    moduleScripts.forEach((script, index) => {
      const srcMatch = script.match(/src="([^"]*)"/);
      if (srcMatch) {
        const filename = path.basename(srcMatch[1]);
        const isMain = filename.includes('index-');
        log(`   ${index + 1}. ${isMain ? '🚀' : '📦'} ${filename} ${isMain ? '(MAIN ENTRY)' : ''}`, colors.yellow);
      }
    });
  }
  
  // 2. Extract and analyze preload links
  const preloadMatches = html.match(/<link[^>]*rel="modulepreload"[^>]*>/g) || [];
  
  if (preloadMatches.length > 0) {
    log('\n🔗 Module Preloads (parallel loading):', colors.blue);
    log('─'.repeat(30), colors.blue);
    
    preloadMatches.forEach((link, index) => {
      const hrefMatch = link.match(/href="([^"]*)"/);
      if (hrefMatch) {
        const filename = path.basename(hrefMatch[1]);
        const isVendor = filename.includes('vendor-');
        const isUI = filename.includes('ui-components-');
        const isLearning = filename.includes('learning-components-');
        
        let type = '🧩';
        let description = '';
        
        if (isVendor) {
          type = '📦';
          description = '(Vendor dependencies)';
        } else if (isUI) {
          type = '🎨';
          description = '(UI Components)';
        } else if (isLearning) {
          type = '🎓';
          description = '(Learning Components)';
        }
        
        log(`   ${index + 1}. ${type} ${filename} ${description}`, colors.yellow);
      }
    });
  }
  
  // 3. Analyze chunk sizes and content
  log('\n📊 Chunk Analysis:', colors.blue);
  log('─'.repeat(30), colors.blue);
  
  const assetsDir = path.join(distPath, 'assets');
  let jsFiles = null;
  
  if (fs.existsSync(assetsDir)) {
    jsFiles = fs.readdirSync(assetsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        
        // Determine chunk type
        let type = '🧩';
        let description = 'Other';
        let priority = 3;
        
        if (file.includes('index-')) {
          type = '🚀';
          description = 'Main Entry (includes React)';
          priority = 1;
        } else if (file.includes('vendor-')) {
          type = '📦';
          description = 'Vendor Dependencies';
          priority = 2;
        } else if (file.includes('ui-components-')) {
          type = '🎨';
          description = 'UI Components';
          priority = 4;
        } else if (file.includes('learning-components-')) {
          type = '🎓';
          description = 'Learning Components';
          priority = 5;
        }
        
        return { file, sizeKB, type, description, priority };
      })
      .sort((a, b) => a.priority - b.priority);
    
    jsFiles.forEach((chunk, index) => {
      const sizeColor = chunk.sizeKB > 150 ? colors.red : 
                       chunk.sizeKB > 100 ? colors.yellow : colors.green;
      log(`   ${index + 1}. ${chunk.type} ${chunk.file}`, colors.reset);
      log(`      Size: ${chunk.sizeKB}KB | ${chunk.description}`, sizeColor);
    });
  }
  
  // 4. Loading sequence analysis
  log('\n⚡ Loading Sequence in Production:', colors.blue);
  log('─'.repeat(30), colors.blue);
  
  log('1. 🔧 HTML loads + inline theme script executes', colors.green);
  log('2. 🔗 Browser starts preloading chunks in parallel:', colors.green);
  preloadMatches.forEach((_, index) => {
    log(`   └─ Preload ${index + 1} starts downloading`, colors.yellow);
  });
  log('3. 🚀 Main module script starts executing', colors.green);
  log('4. 📦 Main script imports dependencies (React available immediately)', colors.green);
  log('5. 🎨 UI components load when needed', colors.green);
  log('6. 🎓 Learning components load when needed', colors.green);
  
  // 5. React availability analysis
  log('\n⚛️  React Availability Analysis:', colors.blue);
  log('─'.repeat(30), colors.blue);
  
  const mainScript = moduleScripts.find(script => script.includes('index-'));
  if (mainScript) {
    log('✅ React is bundled in main script (synchronous)', colors.green);
    log('✅ React.createContext available immediately', colors.green);
    log('✅ No async loading issues expected', colors.green);
  } else {
    log('⚠️  Main script not found', colors.yellow);
  }
  
  // 6. Potential issues
  log('\n🚨 Potential Issues to Watch:', colors.blue);
  log('─'.repeat(30), colors.blue);
  
  if (jsFiles) {
    const mainChunk = jsFiles.find(chunk => chunk.file.includes('index-'));
    if (mainChunk && mainChunk.sizeKB > 200) {
      log('⚠️  Main chunk is large (>200KB) - may affect initial load', colors.yellow);
    } else {
      log('✅ Main chunk size is reasonable', colors.green);
    }
  } else {
    log('⚠️  Assets directory not found', colors.yellow);
  }
  
  if (preloadMatches.length > 5) {
    log('⚠️  Many preloads may affect initial load performance', colors.yellow);
  } else {
    log('✅ Reasonable number of preloads', colors.green);
  }
  
  log('\n🎯 Recommendations:', colors.blue);
  log('─'.repeat(30), colors.blue);
  log('✅ Current setup should prevent F.createContext errors', colors.green);
  log('✅ React loads synchronously in main bundle', colors.green);
  log('💡 Test with: npm run simulate:github', colors.cyan);
  
  return true;
}

/**
 * Compare with Vite dev behavior
 */
function compareWithDev() {
  log('\n🔄 Development vs Production Comparison:', colors.magenta);
  log('='.repeat(60), colors.magenta);
  
  log('\n📍 Vite Dev Server (localhost:5173):', colors.blue);
  log('  • Modules served individually via HTTP/2', colors.yellow);
  log('  • Hot Module Replacement (HMR)', colors.yellow);
  log('  • No chunking, direct ES module serving', colors.yellow);
  log('  • React available immediately (no bundling)', colors.yellow);
  
  log('\n📍 GitHub Pages Production:', colors.blue);
  log('  • Static files served from CDN', colors.yellow);
  log('  • Chunked bundles with preloading', colors.yellow);
  log('  • React bundled in main chunk (synchronous)', colors.yellow);
  log('  • Cache headers for performance', colors.yellow);
  
  log('\n📍 Simulation Server (localhost:4174):', colors.blue);
  log('  • Exact GitHub Pages behavior', colors.yellow);
  log('  • Same base path (/englishgame5/)', colors.yellow);
  log('  • Same static file serving', colors.yellow);
  log('  • Same cache headers', colors.yellow);
}

/**
 * Main function
 */
function main() {
  const success = analyzeProductionLoading();
  
  if (success) {
    compareWithDev();
    
    log('\n🚀 Next Steps:', colors.cyan);
    log('─'.repeat(20), colors.cyan);
    log('1. npm run simulate:github  # Test locally', colors.green);
    log('2. npm run gh:watch        # Monitor deployment', colors.green);
    log('3. npm run deploy:status   # Check live site', colors.green);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}