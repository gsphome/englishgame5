#!/usr/bin/env node

/**
 * Tailwind Dependencies Audit Script
 * 
 * This script audits the codebase for Tailwind usage and identifies
 * dependencies that can be removed once the CSS architecture refactor is complete.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const WORKSPACE_ROOT = process.cwd();

console.log('🔍 Auditing Tailwind dependencies...\n');

// Check package.json for Tailwind-related dependencies
function auditPackageJson() {
  const packageJsonPath = resolve(WORKSPACE_ROOT, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  const tailwindDeps = [];
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  for (const [name, version] of Object.entries(allDeps)) {
    if (name.includes('tailwind') || name.includes('@tailwindcss')) {
      tailwindDeps.push({ name, version, type: packageJson.dependencies[name] ? 'dependency' : 'devDependency' });
    }
  }
  
  console.log('📦 Tailwind-related dependencies found:');
  if (tailwindDeps.length === 0) {
    console.log('   ✅ No Tailwind dependencies found');
  } else {
    tailwindDeps.forEach(dep => {
      console.log(`   📌 ${dep.name}@${dep.version} (${dep.type})`);
    });
  }
  
  return tailwindDeps;
}

// Check PostCSS configuration
function auditPostCSSConfig() {
  const postCSSPath = resolve(WORKSPACE_ROOT, 'config/postcss.config.js');
  
  console.log('\n🔧 PostCSS configuration:');
  
  if (!existsSync(postCSSPath)) {
    console.log('   ❌ PostCSS config not found');
    return false;
  }
  
  const postCSSContent = readFileSync(postCSSPath, 'utf8');
  const hasTailwind = postCSSContent.includes('tailwindcss');
  
  if (hasTailwind) {
    console.log('   ⚠️  Tailwind plugin found in PostCSS config');
    console.log('   📝 Location: config/postcss.config.js');
  } else {
    console.log('   ✅ No Tailwind plugin in PostCSS config');
  }
  
  return hasTailwind;
}

// Check Tailwind config file (should not exist in pure CSS architecture)
function auditTailwindConfig() {
  const tailwindConfigPath = resolve(WORKSPACE_ROOT, 'config/tailwind.config.js');
  
  console.log('\n⚙️  Tailwind configuration:');
  
  if (!existsSync(tailwindConfigPath)) {
    console.log('   ✅ No Tailwind config file found (pure CSS architecture)');
    return false;
  }
  
  console.log('   ❌ Tailwind config file still exists');
  console.log('   📝 Location: config/tailwind.config.js');
  console.log('   🔧 Action: Remove this file for pure CSS architecture');
  
  return true;
}

// Check for Tailwind directives in CSS files
function auditTailwindDirectives() {
  console.log('\n🎨 Tailwind directives in CSS files:');
  
  try {
    const result = execSync('grep -r "@tailwind" src/ --include="*.css" || true', { encoding: 'utf8' });
    
    if (result.trim()) {
      console.log('   ⚠️  Tailwind directives found:');
      result.trim().split('\n').forEach(line => {
        console.log(`   📝 ${line}`);
      });
      return true;
    } else {
      console.log('   ✅ No Tailwind directives found');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error checking for Tailwind directives');
    return false;
  }
}

// Check for @apply directives
function auditApplyDirectives() {
  console.log('\n🔧 @apply directives in CSS files:');
  
  try {
    const result = execSync('grep -r "@apply" src/ --include="*.css" | wc -l || echo "0"', { encoding: 'utf8' });
    const count = parseInt(result.trim());
    
    if (count > 0) {
      console.log(`   ⚠️  ${count} @apply directives found`);
      console.log('   📝 Run: grep -r "@apply" src/ --include="*.css" for details');
      return count;
    } else {
      console.log('   ✅ No @apply directives found');
      return 0;
    }
  } catch (error) {
    console.log('   ❌ Error checking for @apply directives');
    return -1;
  }
}

// Check for Tailwind classes in TSX files
function auditTailwindClasses() {
  console.log('\n🎯 Tailwind classes in TSX files:');
  
  try {
    // Run the BEM compliance script to get Tailwind class count
    const result = execSync('node scripts/validation/validate-bem-compliance.js 2>&1 || true', { encoding: 'utf8' });
    
    const tailwindMatch = result.match(/Tailwind classes detected: (\d+)/);
    const count = tailwindMatch ? parseInt(tailwindMatch[1]) : 0;
    
    if (count > 0) {
      console.log(`   ⚠️  ${count} Tailwind classes found in TSX files`);
      console.log('   📝 Run: npm run test:bem for details');
      return count;
    } else {
      console.log('   ✅ No Tailwind classes found in TSX files');
      return 0;
    }
  } catch (error) {
    console.log('   ❌ Error checking for Tailwind classes');
    return -1;
  }
}

// Generate removal recommendations
function generateRecommendations(tailwindDeps, hasTailwindInPostCSS, hasTailwindConfig, hasDirectives, applyCount, tailwindClassCount) {
  console.log('\n📋 Removal Recommendations:');
  console.log('=' .repeat(50));
  
  const canRemove = !hasDirectives && applyCount === 0 && tailwindClassCount === 0;
  
  if (canRemove) {
    console.log('✅ SAFE TO REMOVE TAILWIND DEPENDENCIES');
    console.log('\n🗑️  Dependencies to remove:');
    tailwindDeps.forEach(dep => {
      console.log(`   npm uninstall ${dep.name}`);
    });
    
    if (hasTailwindInPostCSS) {
      console.log('\n🔧 PostCSS config updates needed:');
      console.log('   - Remove tailwindcss plugin from config/postcss.config.js');
    }
    
    if (hasTailwindConfig) {
      console.log('\n📁 Files to remove for pure CSS architecture:');
      console.log('   - config/tailwind.config.js');
    }
  } else {
    console.log('⚠️  NOT SAFE TO REMOVE TAILWIND DEPENDENCIES YET');
    console.log('\n🚧 Blocking issues:');
    
    if (hasDirectives) {
      console.log('   - Tailwind directives still present in CSS files');
    }
    
    if (applyCount > 0) {
      console.log(`   - ${applyCount} @apply directives still present`);
    }
    
    if (tailwindClassCount > 0) {
      console.log(`   - ${tailwindClassCount} Tailwind classes still in TSX files`);
    }
    
    console.log('\n✅ Complete these tasks first:');
    console.log('   1. Remove all @tailwind directives from src/index.css');
    console.log('   2. Convert all @apply directives to pure CSS');
    console.log('   3. Remove all Tailwind classes from TSX files');
    console.log('   4. Complete CSS architecture refactor to pure BEM');
  }
}

// Main audit function
function main() {
  const tailwindDeps = auditPackageJson();
  const hasTailwindInPostCSS = auditPostCSSConfig();
  const hasTailwindConfig = auditTailwindConfig();
  const hasDirectives = auditTailwindDirectives();
  const applyCount = auditApplyDirectives();
  const tailwindClassCount = auditTailwindClasses();
  
  generateRecommendations(
    tailwindDeps,
    hasTailwindInPostCSS,
    hasTailwindConfig,
    hasDirectives,
    applyCount,
    tailwindClassCount
  );
  
  console.log('\n📊 Audit Summary:');
  console.log(`   Dependencies: ${tailwindDeps.length}`);
  console.log(`   PostCSS plugin: ${hasTailwindInPostCSS ? 'Present' : 'Not found'}`);
  console.log(`   Config file: ${hasTailwindConfig ? 'Present' : 'Not found'}`);
  console.log(`   CSS directives: ${hasDirectives ? 'Present' : 'Not found'}`);
  console.log(`   @apply count: ${applyCount >= 0 ? applyCount : 'Error'}`);
  console.log(`   Tailwind classes: ${tailwindClassCount >= 0 ? tailwindClassCount : 'Error'}`);
  
  // Exit with error code if Tailwind is still in use
  const stillInUse = hasDirectives || applyCount > 0 || tailwindClassCount > 0;
  process.exit(stillInUse ? 1 : 0);
}

main();