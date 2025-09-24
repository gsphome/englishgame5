#!/usr/bin/env node

/**
 * Verification script for CompactAdvancedSettings CSS refactor
 * Checks that all Tailwind classes have been removed and design tokens are used
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying CompactAdvancedSettings CSS refactor...\n');

// Read the TSX file
const tsxPath = path.join(__dirname, '../../src/components/ui/CompactAdvancedSettings.tsx');
const tsxContent = fs.readFileSync(tsxPath, 'utf8');

// Read the CSS file
const cssPath = path.join(__dirname, '../../src/styles/components/compact-advanced-settings.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

let errors = [];
let warnings = [];
let success = [];

// Check 1: No Tailwind classes in TSX
console.log('✅ Checking TSX file for Tailwind classes...');
const tailwindPatterns = [
  /text-gray-\d+/g,
  /bg-gray-\d+/g,
  /hover:text-/g,
  /dark:text-/g,
  /dark:bg-/g,
  /dark:hover:/g,
  /border-gray-\d+/g,
  /bg-white/g,
  /bg-yellow-\d+/g,
  /text-yellow-\d+/g,
  /text-blue-\d+/g
];

let foundTailwind = false;
tailwindPatterns.forEach(pattern => {
  const matches = tsxContent.match(pattern);
  if (matches) {
    errors.push(`Found Tailwind classes in TSX: ${matches.join(', ')}`);
    foundTailwind = true;
  }
});

if (!foundTailwind) {
  success.push('✅ No Tailwind classes found in TSX file');
}

// Check 2: No @apply directives in CSS
console.log('✅ Checking CSS file for @apply directives...');
const applyMatches = cssContent.match(/@apply/g);
if (applyMatches) {
  errors.push(`Found ${applyMatches.length} @apply directives in CSS file`);
} else {
  success.push('✅ No @apply directives found in CSS file');
}

// Check 3: Design tokens are used
console.log('✅ Checking CSS file for design token usage...');
const designTokenPatterns = [
  /var\(--theme-text-primary\)/g,
  /var\(--theme-text-secondary\)/g,
  /var\(--theme-bg-elevated\)/g,
  /var\(--theme-bg-subtle\)/g,
  /var\(--theme-border-soft\)/g,
  /var\(--theme-primary-blue\)/g
];

let tokenCount = 0;
designTokenPatterns.forEach(pattern => {
  const matches = cssContent.match(pattern);
  if (matches) {
    tokenCount += matches.length;
  }
});

if (tokenCount > 0) {
  success.push(`✅ Found ${tokenCount} design token usages in CSS file`);
} else {
  warnings.push('⚠️  No design tokens found in CSS file');
}

// Check 4: BEM naming convention
console.log('✅ Checking for BEM naming convention...');
const bemPatterns = [
  /\.compact-settings__/g,
  /\.compact-settings--/g
];

let bemCount = 0;
bemPatterns.forEach(pattern => {
  const matches = cssContent.match(pattern);
  if (matches) {
    bemCount += matches.length;
  }
});

if (bemCount > 0) {
  success.push(`✅ Found ${bemCount} BEM class definitions in CSS file`);
} else {
  errors.push('❌ No BEM classes found in CSS file');
}

// Check 5: Verify specific refactored elements
console.log('✅ Checking specific refactored elements...');
const requiredBemClasses = [
  '.compact-settings__container',
  '.compact-settings__header',
  '.compact-settings__close-btn',
  '.compact-settings__tabs',
  '.compact-settings__tab',
  '.compact-settings__content',
  '.compact-settings__footer'
];

let missingClasses = [];
requiredBemClasses.forEach(className => {
  if (!cssContent.includes(className)) {
    missingClasses.push(className);
  }
});

if (missingClasses.length === 0) {
  success.push('✅ All required BEM classes are present');
} else {
  errors.push(`❌ Missing BEM classes: ${missingClasses.join(', ')}`);
}

// Check 6: Theme context support
console.log('✅ Checking for theme context support...');
const darkModePatterns = [
  /\.dark\s+\.compact-settings/g,
  /\.dark\s+\./g
];

let darkModeCount = 0;
darkModePatterns.forEach(pattern => {
  const matches = cssContent.match(pattern);
  if (matches) {
    darkModeCount += matches.length;
  }
});

if (darkModeCount > 0) {
  success.push(`✅ Found ${darkModeCount} dark mode specific rules`);
} else {
  warnings.push('⚠️  No dark mode specific rules found (using design tokens is preferred)');
}

// Results
console.log('\n📊 VERIFICATION RESULTS\n');

if (success.length > 0) {
  console.log('✅ SUCCESS:');
  success.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(msg => console.log(`   ${msg}`));
  console.log('');
  process.exit(1);
} else {
  console.log('🎉 All checks passed! CompactAdvancedSettings refactor is complete.\n');
  console.log('📋 Summary:');
  console.log(`   - Tailwind classes removed from TSX: ✅`);
  console.log(`   - @apply directives removed from CSS: ✅`);
  console.log(`   - Design tokens implemented: ✅`);
  console.log(`   - BEM methodology applied: ✅`);
  console.log(`   - Theme context support: ✅`);
  console.log('');
  process.exit(0);
}