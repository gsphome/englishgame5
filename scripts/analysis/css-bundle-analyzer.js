#!/usr/bin/env node

/**
 * CSS Bundle Analyzer - Detailed analysis of CSS chunks and optimization opportunities
 * Part of CSS Architecture Refactor - Task 6.1
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Gets file size in KB with high precision
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
 * Analyzes CSS file content for optimization opportunities
 */
async function analyzeCSSContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    const analysis = {
      totalLines: content.split('\n').length,
      totalChars: content.length,
      rules: {
        tailwindDirectives: (content.match(/@tailwind/g) || []).length,
        applyDirectives: (content.match(/@apply/g) || []).length,
        layerBlocks: (content.match(/@layer/g) || []).length,
        importStatements: (content.match(/@import/g) || []).length,
        cssRules: (content.match(/\{[^}]*\}/g) || []).length,
        mediaQueries: (content.match(/@media/g) || []).length,
        customProperties: (content.match(/--[\w-]+:/g) || []).length,
        darkModeRules: (content.match(/\.dark\s/g) || []).length
      },
      optimization: {
        hasHybridArchitecture: false,
        hasUnusedRules: false,
        hasRedundantImports: false,
        canTreeShake: false
      }
    };
    
    // Detect hybrid architecture issues
    analysis.optimization.hasHybridArchitecture = 
      analysis.rules.tailwindDirectives > 0 || analysis.rules.applyDirectives > 0;
    
    // Estimate tree-shaking potential
    analysis.optimization.canTreeShake = 
      analysis.rules.cssRules > 100 && analysis.rules.mediaQueries > 5;
    
    return analysis;
    
  } catch (error) {
    return {
      error: error.message,
      totalLines: 0,
      totalChars: 0,
      rules: {},
      optimization: {}
    };
  }
}

/**
 * Scans and analyzes all CSS bundles
 */
async function analyzeCSSBundles() {
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  try {
    const files = await fs.readdir(assetsPath);
    const cssFiles = files.filter(file => file.endsWith('.css'));
    
    const bundles = [];
    let totalSize = 0;
    
    for (const file of cssFiles) {
      const filePath = path.join(assetsPath, file);
      const size = await getFileSize(filePath);
      const content = await analyzeCSSContent(filePath);
      
      const bundle = {
        name: file,
        size,
        path: filePath,
        content,
        category: categorizeCSSBundle(file),
        compliance: {
          underTarget: size < 500,
          target: 500,
          percentage: Math.round((size / 500) * 100)
        }
      };
      
      bundles.push(bundle);
      totalSize += size;
    }
    
    // Sort by size (largest first)
    bundles.sort((a, b) => b.size - a.size);
    
    return {
      bundles,
      totalSize,
      count: bundles.length,
      analysis: analyzeBundleDistribution(bundles)
    };
    
  } catch (error) {
    console.error('❌ Error analyzing CSS bundles:', error.message);
    return null;
  }
}

/**
 * Categorizes CSS bundles by type
 */
function categorizeCSSBundle(filename) {
  if (filename.includes('index-')) return 'main';
  if (filename.includes('Component-')) return 'component';
  if (filename.includes('theme-') || filename.includes('Theme-')) return 'theme';
  if (filename.includes('design-') || filename.includes('Design-')) return 'design-system';
  return 'other';
}

/**
 * Analyzes bundle distribution and optimization opportunities
 */
function analyzeBundleDistribution(bundles) {
  const categories = {
    main: [],
    component: [],
    theme: [],
    'design-system': [],
    other: []
  };
  
  bundles.forEach(bundle => {
    categories[bundle.category].push(bundle);
  });
  
  const analysis = {
    categories,
    issues: [],
    opportunities: [],
    compliance: {
      allUnderTarget: bundles.every(b => b.compliance.underTarget),
      overTargetCount: bundles.filter(b => !b.compliance.underTarget).length,
      largestBundle: bundles[0] || null
    }
  };
  
  // Identify issues
  bundles.forEach(bundle => {
    if (!bundle.compliance.underTarget) {
      analysis.issues.push(`${bundle.name}: ${bundle.size}KB > 500KB target`);
    }
    
    if (bundle.content.optimization?.hasHybridArchitecture) {
      analysis.issues.push(`${bundle.name}: Contains hybrid architecture (@apply, @tailwind)`);
    }
  });
  
  // Identify optimization opportunities
  const mainBundle = categories.main[0];
  if (mainBundle && mainBundle.size > 300) {
    analysis.opportunities.push('Main bundle could be split into smaller chunks');
  }
  
  if (categories.component.length > 5) {
    analysis.opportunities.push('Component CSS could be consolidated or lazy-loaded');
  }
  
  const totalHybridRules = bundles.reduce((sum, bundle) => {
    return sum + (bundle.content.rules?.applyDirectives || 0) + (bundle.content.rules?.tailwindDirectives || 0);
  }, 0);
  
  if (totalHybridRules > 0) {
    analysis.opportunities.push(`${totalHybridRules} hybrid rules could be converted to pure CSS`);
  }
  
  return analysis;
}

/**
 * Generates optimization recommendations
 */
function generateOptimizationRecommendations(bundleAnalysis) {
  const recommendations = [];
  
  // Size-based recommendations
  bundleAnalysis.bundles.forEach(bundle => {
    if (bundle.size > 400) {
      recommendations.push({
        type: 'size',
        priority: 'high',
        bundle: bundle.name,
        issue: `Bundle size ${bundle.size}KB approaching 500KB limit`,
        solution: 'Consider splitting into smaller chunks or removing unused CSS'
      });
    }
    
    if (bundle.content.optimization?.hasHybridArchitecture) {
      recommendations.push({
        type: 'architecture',
        priority: 'critical',
        bundle: bundle.name,
        issue: 'Contains hybrid CSS architecture',
        solution: 'Convert @apply directives and @tailwind imports to pure CSS with design tokens'
      });
    }
    
    if (bundle.content.rules?.cssRules > 500) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        bundle: bundle.name,
        issue: `${bundle.content.rules.cssRules} CSS rules may contain unused styles`,
        solution: 'Implement CSS tree-shaking or purging unused styles'
      });
    }
  });
  
  // Global recommendations
  if (bundleAnalysis.totalSize > 1000) {
    recommendations.push({
      type: 'global',
      priority: 'medium',
      bundle: 'all',
      issue: `Total CSS size ${bundleAnalysis.totalSize}KB > 1MB`,
      solution: 'Implement aggressive CSS optimization and lazy loading'
    });
  }
  
  return recommendations;
}

/**
 * Displays detailed CSS bundle analysis report
 */
function displayCSSAnalysisReport(bundleAnalysis) {
  console.log('🎨 CSS Bundle Analysis Report');
  console.log('=============================');
  
  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`  Total CSS Bundles: ${bundleAnalysis.count}`);
  console.log(`  Total CSS Size: ${bundleAnalysis.totalSize}KB`);
  console.log(`  Target Compliance: ${bundleAnalysis.analysis.compliance.allUnderTarget ? '✅ PASS' : '❌ FAIL'}`);
  
  if (bundleAnalysis.analysis.compliance.overTargetCount > 0) {
    console.log(`  Over Target: ${bundleAnalysis.analysis.compliance.overTargetCount} bundles`);
  }
  
  // Bundle Details
  console.log(`\n📦 Bundle Details:`);
  bundleAnalysis.bundles.forEach(bundle => {
    const status = bundle.compliance.underTarget ? '✅' : '⚠️';
    const percentage = bundle.compliance.percentage;
    
    console.log(`  ${status} ${bundle.name}`);
    console.log(`     Size: ${bundle.size}KB (${percentage}% of 500KB target)`);
    console.log(`     Category: ${bundle.category}`);
    console.log(`     CSS Rules: ${bundle.content.rules?.cssRules || 0}`);
    
    if (bundle.content.rules?.applyDirectives > 0) {
      console.log(`     ⚠️ @apply directives: ${bundle.content.rules.applyDirectives}`);
    }
    
    if (bundle.content.rules?.tailwindDirectives > 0) {
      console.log(`     ⚠️ @tailwind directives: ${bundle.content.rules.tailwindDirectives}`);
    }
    
    if (bundle.content.rules?.customProperties > 0) {
      console.log(`     ✅ CSS Custom Properties: ${bundle.content.rules.customProperties}`);
    }
    
    console.log('');
  });
  
  // Category Analysis
  console.log(`\n🏷️ Category Breakdown:`);
  Object.entries(bundleAnalysis.analysis.categories).forEach(([category, bundles]) => {
    if (bundles.length > 0) {
      const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
      console.log(`  ${category}: ${bundles.length} bundles, ${totalSize}KB total`);
    }
  });
  
  // Issues
  if (bundleAnalysis.analysis.issues.length > 0) {
    console.log(`\n⚠️ Issues Found:`);
    bundleAnalysis.analysis.issues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }
  
  // Opportunities
  if (bundleAnalysis.analysis.opportunities.length > 0) {
    console.log(`\n💡 Optimization Opportunities:`);
    bundleAnalysis.analysis.opportunities.forEach(opportunity => {
      console.log(`  - ${opportunity}`);
    });
  }
}

/**
 * Displays optimization recommendations
 */
function displayOptimizationRecommendations(recommendations) {
  if (recommendations.length === 0) {
    console.log('\n✅ No optimization recommendations - CSS bundles are well optimized!');
    return;
  }
  
  console.log('\n🔧 Optimization Recommendations');
  console.log('================================');
  
  const priorityOrder = ['critical', 'high', 'medium', 'low'];
  
  priorityOrder.forEach(priority => {
    const recs = recommendations.filter(r => r.priority === priority);
    if (recs.length === 0) return;
    
    const priorityIcon = {
      critical: '🚨',
      high: '⚠️',
      medium: '💡',
      low: '📝'
    }[priority];
    
    console.log(`\n${priorityIcon} ${priority.toUpperCase()} Priority:`);
    
    recs.forEach(rec => {
      console.log(`  Bundle: ${rec.bundle}`);
      console.log(`  Issue: ${rec.issue}`);
      console.log(`  Solution: ${rec.solution}`);
      console.log('');
    });
  });
}

/**
 * Saves detailed analysis to JSON file
 */
async function saveAnalysisReport(bundleAnalysis, recommendations) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    summary: {
      totalBundles: bundleAnalysis.count,
      totalSize: bundleAnalysis.totalSize,
      compliance: bundleAnalysis.analysis.compliance,
      issues: bundleAnalysis.analysis.issues.length,
      opportunities: bundleAnalysis.analysis.opportunities.length
    },
    bundles: bundleAnalysis.bundles,
    analysis: bundleAnalysis.analysis,
    recommendations,
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      generatedBy: 'css-bundle-analyzer.js'
    }
  };
  
  const reportsDir = path.join(process.cwd(), 'docs/performance-snapshots');
  await fs.mkdir(reportsDir, { recursive: true });
  
  const filename = `css-analysis-${Date.now()}.json`;
  const filepath = path.join(reportsDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(report, null, 2));
  
  // Also update latest analysis
  const latestPath = path.join(reportsDir, 'latest-css-analysis.json');
  await fs.writeFile(latestPath, JSON.stringify(report, null, 2));
  
  return filepath;
}

/**
 * Main CSS bundle analysis function
 */
async function analyzeCSSBundlesMain() {
  console.log('🔍 Analyzing CSS bundles...');
  
  const bundleAnalysis = await analyzeCSSBundles();
  if (!bundleAnalysis) {
    console.error('❌ Failed to analyze CSS bundles. Make sure to run "npm run build" first.');
    process.exit(1);
  }
  
  const recommendations = generateOptimizationRecommendations(bundleAnalysis);
  
  displayCSSAnalysisReport(bundleAnalysis);
  displayOptimizationRecommendations(recommendations);
  
  // Save detailed report
  try {
    const reportPath = await saveAnalysisReport(bundleAnalysis, recommendations);
    console.log(`\n📄 Detailed report saved: ${path.basename(reportPath)}`);
  } catch (error) {
    console.error('⚠️ Failed to save analysis report:', error.message);
  }
  
  return { bundleAnalysis, recommendations };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeCSSBundlesMain().catch(console.error);
}

export { analyzeCSSBundlesMain, analyzeCSSBundles, generateOptimizationRecommendations };