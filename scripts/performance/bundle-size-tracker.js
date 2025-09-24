#!/usr/bin/env node

/**
 * Bundle Size Tracking Tool
 * Monitors CSS and JS bundle sizes for performance regression detection
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Gets file size in KB
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return Math.round(stats.size / 1024 * 100) / 100; // KB with 2 decimal places
  } catch (error) {
    return 0;
  }
}

/**
 * Scans dist directory for bundle files
 */
async function scanBundleFiles() {
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  try {
    const files = await fs.readdir(assetsPath);
    const bundles = {
      css: [],
      js: [],
      total: { css: 0, js: 0 }
    };
    
    for (const file of files) {
      const filePath = path.join(assetsPath, file);
      const size = await getFileSize(filePath);
      
      if (file.endsWith('.css')) {
        bundles.css.push({ name: file, size });
        bundles.total.css += size;
      } else if (file.endsWith('.js')) {
        bundles.js.push({ name: file, size });
        bundles.total.js += size;
      }
    }
    
    // Sort by size (largest first)
    bundles.css.sort((a, b) => b.size - a.size);
    bundles.js.sort((a, b) => b.size - a.size);
    
    return bundles;
    
  } catch (error) {
    console.error('❌ Error scanning bundle files:', error.message);
    return null;
  }
}

/**
 * Analyzes bundle sizes against targets
 */
function analyzeBundleSizes(bundles) {
  const analysis = {
    css: {
      withinTarget: true,
      issues: [],
      largest: bundles.css[0] || null
    },
    js: {
      withinTarget: true,
      issues: [],
      largest: bundles.js[0] || null
    },
    overall: {
      status: 'PASS',
      warnings: []
    }
  };
  
  // Check CSS bundle targets (500KB per chunk)
  bundles.css.forEach(bundle => {
    if (bundle.size > 500) {
      analysis.css.withinTarget = false;
      analysis.css.issues.push(`${bundle.name}: ${bundle.size}KB > 500KB target`);
    }
  });
  
  // Check JS bundle targets (1MB warning threshold)
  bundles.js.forEach(bundle => {
    if (bundle.size > 1000) {
      analysis.js.issues.push(`${bundle.name}: ${bundle.size}KB > 1MB warning threshold`);
    }
  });
  
  // Overall assessment
  if (!analysis.css.withinTarget || analysis.js.issues.length > 0) {
    analysis.overall.status = 'WARNING';
  }
  
  if (bundles.total.css > 1000) {
    analysis.overall.warnings.push(`Total CSS size (${bundles.total.css}KB) exceeds 1MB`);
  }
  
  return analysis;
}

/**
 * Saves bundle size snapshot
 */
async function saveBundleSnapshot(bundles, analysis) {
  const timestamp = new Date().toISOString();
  const snapshot = {
    timestamp,
    bundles,
    analysis,
    metadata: {
      nodeVersion: process.version,
      platform: process.platform
    }
  };
  
  const snapshotDir = path.join(process.cwd(), 'docs/performance-snapshots');
  await fs.mkdir(snapshotDir, { recursive: true });
  
  const filename = `bundle-snapshot-${Date.now()}.json`;
  const filepath = path.join(snapshotDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(snapshot, null, 2));
  
  // Also update latest snapshot
  const latestPath = path.join(snapshotDir, 'latest-bundle-snapshot.json');
  await fs.writeFile(latestPath, JSON.stringify(snapshot, null, 2));
  
  return filepath;
}

/**
 * Displays bundle size report
 */
function displayBundleReport(bundles, analysis) {
  console.log('📦 Bundle Size Analysis');
  console.log('======================');
  
  // CSS Bundles
  console.log('\n🎨 CSS Bundles:');
  if (bundles.css.length === 0) {
    console.log('  No CSS bundles found');
  } else {
    bundles.css.forEach(bundle => {
      const status = bundle.size > 500 ? '⚠️' : '✅';
      console.log(`  ${status} ${bundle.name}: ${bundle.size}KB`);
    });
    console.log(`  📊 Total CSS: ${bundles.total.css}KB`);
  }
  
  // JS Bundles
  console.log('\n📜 JavaScript Bundles:');
  if (bundles.js.length === 0) {
    console.log('  No JS bundles found');
  } else {
    bundles.js.forEach(bundle => {
      const status = bundle.size > 1000 ? '⚠️' : '✅';
      console.log(`  ${status} ${bundle.name}: ${bundle.size}KB`);
    });
    console.log(`  📊 Total JS: ${bundles.total.js}KB`);
  }
  
  // Analysis
  console.log('\n🎯 Analysis:');
  console.log(`  CSS Target Compliance: ${analysis.css.withinTarget ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Overall Status: ${analysis.overall.status === 'PASS' ? '✅' : '⚠️'} ${analysis.overall.status}`);
  
  if (analysis.css.issues.length > 0) {
    console.log('\n⚠️ CSS Issues:');
    analysis.css.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  if (analysis.js.issues.length > 0) {
    console.log('\n⚠️ JS Warnings:');
    analysis.js.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  if (analysis.overall.warnings.length > 0) {
    console.log('\n⚠️ Overall Warnings:');
    analysis.overall.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
}

/**
 * Main bundle tracking function
 */
async function trackBundleSizes() {
  console.log('🔍 Scanning bundle files...');
  
  const bundles = await scanBundleFiles();
  if (!bundles) {
    console.error('❌ Failed to scan bundle files. Make sure to run "npm run build" first.');
    process.exit(1);
  }
  
  const analysis = analyzeBundleSizes(bundles);
  displayBundleReport(bundles, analysis);
  
  // Save snapshot
  try {
    const snapshotPath = await saveBundleSnapshot(bundles, analysis);
    console.log(`\n📸 Snapshot saved: ${path.basename(snapshotPath)}`);
  } catch (error) {
    console.error('⚠️ Failed to save snapshot:', error.message);
  }
  
  return { bundles, analysis };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  trackBundleSizes().catch(console.error);
}

export { trackBundleSizes, scanBundleFiles, analyzeBundleSizes };