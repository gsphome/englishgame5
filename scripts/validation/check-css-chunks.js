#!/usr/bin/env node

/**
 * CSS Chunk Size Validator
 * Ensures all CSS chunks remain under 500KB target
 * Part of CSS Architecture Refactor - Task 6.1
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CSS_CHUNK_TARGET = 500; // KB
const WARNING_THRESHOLD = 400; // KB (80% of target)

/**
 * Gets file size in KB
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return Math.round(stats.size / 1024 * 100) / 100;
  } catch (error) {
    return 0;
  }
}

/**
 * Validates CSS chunk sizes
 */
async function validateCSSChunks() {
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  try {
    const files = await fs.readdir(assetsPath);
    const cssFiles = files.filter(file => file.endsWith('.css'));
    
    const results = {
      chunks: [],
      totalSize: 0,
      compliance: {
        passed: 0,
        warnings: 0,
        failed: 0
      },
      status: 'PASS'
    };
    
    for (const file of cssFiles) {
      const filePath = path.join(assetsPath, file);
      const size = await getFileSize(filePath);
      
      const chunk = {
        name: file,
        size,
        status: 'PASS',
        message: `${size}KB < ${CSS_CHUNK_TARGET}KB target`
      };
      
      if (size >= CSS_CHUNK_TARGET) {
        chunk.status = 'FAIL';
        chunk.message = `${size}KB >= ${CSS_CHUNK_TARGET}KB target - EXCEEDS LIMIT`;
        results.compliance.failed++;
        results.status = 'FAIL';
      } else if (size >= WARNING_THRESHOLD) {
        chunk.status = 'WARNING';
        chunk.message = `${size}KB >= ${WARNING_THRESHOLD}KB warning threshold`;
        results.compliance.warnings++;
        if (results.status === 'PASS') results.status = 'WARNING';
      } else {
        results.compliance.passed++;
      }
      
      results.chunks.push(chunk);
      results.totalSize += size;
    }
    
    // Sort by size (largest first)
    results.chunks.sort((a, b) => b.size - a.size);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error validating CSS chunks:', error.message);
    return null;
  }
}

/**
 * Displays validation results
 */
function displayValidationResults(results) {
  console.log('📏 CSS Chunk Size Validation');
  console.log('============================');
  
  // Overall status
  const statusIcon = {
    'PASS': '✅',
    'WARNING': '⚠️',
    'FAIL': '❌'
  }[results.status];
  
  console.log(`\n${statusIcon} Overall Status: ${results.status}`);
  console.log(`📊 Total CSS Size: ${results.totalSize}KB`);
  console.log(`📦 Total Chunks: ${results.chunks.length}`);
  
  // Compliance summary
  console.log(`\n📈 Compliance Summary:`);
  console.log(`  ✅ Passed: ${results.compliance.passed} chunks`);
  if (results.compliance.warnings > 0) {
    console.log(`  ⚠️ Warnings: ${results.compliance.warnings} chunks`);
  }
  if (results.compliance.failed > 0) {
    console.log(`  ❌ Failed: ${results.compliance.failed} chunks`);
  }
  
  // Chunk details
  console.log(`\n📦 Chunk Details:`);
  results.chunks.forEach(chunk => {
    const icon = {
      'PASS': '✅',
      'WARNING': '⚠️',
      'FAIL': '❌'
    }[chunk.status];
    
    console.log(`  ${icon} ${chunk.name}: ${chunk.message}`);
  });
  
  // Recommendations
  if (results.status !== 'PASS') {
    console.log(`\n💡 Recommendations:`);
    
    results.chunks.forEach(chunk => {
      if (chunk.status === 'FAIL') {
        console.log(`  🚨 ${chunk.name}:`);
        console.log(`     - Split into smaller chunks`);
        console.log(`     - Remove unused CSS rules`);
        console.log(`     - Implement CSS tree-shaking`);
      } else if (chunk.status === 'WARNING') {
        console.log(`  ⚠️ ${chunk.name}:`);
        console.log(`     - Monitor size growth`);
        console.log(`     - Consider optimization`);
      }
    });
  }
}

/**
 * Saves validation results
 */
async function saveValidationResults(results) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    target: CSS_CHUNK_TARGET,
    warningThreshold: WARNING_THRESHOLD,
    results,
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      generatedBy: 'check-css-chunks.js'
    }
  };
  
  const reportsDir = path.join(process.cwd(), 'docs/performance-snapshots');
  await fs.mkdir(reportsDir, { recursive: true });
  
  const filename = `css-chunk-validation-${Date.now()}.json`;
  const filepath = path.join(reportsDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(report, null, 2));
  
  return filepath;
}

/**
 * Main validation function
 */
async function validateCSSChunksMain() {
  console.log('🔍 Validating CSS chunk sizes...');
  
  const results = await validateCSSChunks();
  if (!results) {
    console.error('❌ Failed to validate CSS chunks. Make sure to run "npm run build" first.');
    process.exit(1);
  }
  
  displayValidationResults(results);
  
  // Save results
  try {
    const reportPath = await saveValidationResults(results);
    console.log(`\n📄 Validation report saved: ${path.basename(reportPath)}`);
  } catch (error) {
    console.error('⚠️ Failed to save validation report:', error.message);
  }
  
  // Exit with appropriate code
  if (results.status === 'FAIL') {
    console.log('\n❌ CSS chunk validation FAILED - some chunks exceed 500KB limit');
    process.exit(1);
  } else if (results.status === 'WARNING') {
    console.log('\n⚠️ CSS chunk validation passed with WARNINGS');
    process.exit(0);
  } else {
    console.log('\n✅ CSS chunk validation PASSED - all chunks under 500KB');
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateCSSChunksMain().catch(console.error);
}

export { validateCSSChunksMain, validateCSSChunks };