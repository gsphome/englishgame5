#!/usr/bin/env node

/**
 * CSS Classes Audit Script
 * 
 * This script audits all TSX components to find CSS classes that are used
 * but not defined in their corresponding CSS files.
 * 
 * Usage: node scripts/audit-css-classes.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const COMPONENTS_DIR = 'src/components';
const STYLES_DIR = 'src/styles/components';

/**
 * Extract className values from TSX file content
 */
function extractClassNames(content) {
  const classNames = new Set();
  
  // Match className="..." and className={`...`}
  const classNameRegex = /className\s*=\s*(?:"([^"]+)"|{`([^`]+)`}|{[^}]*"([^"]+)"[^}]*})/g;
  
  let match;
  while ((match = classNameRegex.exec(content)) !== null) {
    const classValue = match[1] || match[2] || match[3];
    if (classValue) {
      // Split by spaces and filter out template literals and variables
      const classes = classValue
        .split(/\s+/)
        .filter(cls => cls && !cls.includes('${') && !cls.includes('?') && !cls.includes(':'));
      
      classes.forEach(cls => classNames.add(cls));
    }
  }
  
  return Array.from(classNames);
}

/**
 * Extract CSS class definitions from CSS file content
 */
function extractCSSClasses(content) {
  const classes = new Set();
  
  // Match CSS class selectors
  const cssClassRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*(?:__[a-zA-Z0-9_-]+)?(?:--[a-zA-Z0-9_-]+)?)/g;
  
  let match;
  while ((match = cssClassRegex.exec(content)) !== null) {
    classes.add(match[1]);
  }
  
  return Array.from(classes);
}

/**
 * Get corresponding CSS file path for a component
 */
function getCSSFilePath(componentPath) {
  const componentName = path.basename(componentPath, '.tsx');
  const kebabCase = componentName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  
  return path.join(STYLES_DIR, `${kebabCase}.css`);
}

/**
 * Audit a single component
 */
function auditComponent(componentPath) {
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  const usedClasses = extractClassNames(componentContent);
  
  if (usedClasses.length === 0) {
    return null; // No classes used
  }
  
  const cssFilePath = getCSSFilePath(componentPath);
  
  if (!fs.existsSync(cssFilePath)) {
    return {
      component: componentPath,
      cssFile: cssFilePath,
      status: 'missing-css-file',
      usedClasses,
      missingClasses: usedClasses,
      definedClasses: []
    };
  }
  
  const cssContent = fs.readFileSync(cssFilePath, 'utf8');
  const definedClasses = extractCSSClasses(cssContent);
  
  const missingClasses = usedClasses.filter(cls => !definedClasses.includes(cls));
  
  return {
    component: componentPath,
    cssFile: cssFilePath,
    status: missingClasses.length > 0 ? 'missing-classes' : 'ok',
    usedClasses,
    definedClasses,
    missingClasses
  };
}

/**
 * Main audit function
 */
function auditAllComponents() {
  console.log('🔍 Auditing CSS classes in TSX components...\n');
  
  // Find all TSX files
  const componentFiles = glob.sync(`${COMPONENTS_DIR}/**/*.tsx`);
  
  const results = {
    total: componentFiles.length,
    ok: 0,
    missingCssFile: 0,
    missingClasses: 0,
    issues: []
  };
  
  componentFiles.forEach(componentPath => {
    const audit = auditComponent(componentPath);
    
    if (!audit) {
      results.ok++;
      return;
    }
    
    switch (audit.status) {
      case 'ok':
        results.ok++;
        break;
      case 'missing-css-file':
        results.missingCssFile++;
        results.issues.push(audit);
        break;
      case 'missing-classes':
        results.missingClasses++;
        results.issues.push(audit);
        break;
    }
  });
  
  // Report results
  console.log('📊 Audit Results:');
  console.log(`Total components: ${results.total}`);
  console.log(`✅ OK: ${results.ok}`);
  console.log(`❌ Missing CSS file: ${results.missingCssFile}`);
  console.log(`⚠️  Missing classes: ${results.missingClasses}`);
  console.log('');
  
  if (results.issues.length > 0) {
    console.log('🚨 Issues found:\n');
    
    results.issues.forEach(issue => {
      console.log(`📁 ${issue.component}`);
      console.log(`   CSS: ${issue.cssFile}`);
      console.log(`   Status: ${issue.status}`);
      
      if (issue.missingClasses.length > 0) {
        console.log(`   Missing classes: ${issue.missingClasses.join(', ')}`);
      }
      
      console.log('');
    });
  } else {
    console.log('🎉 No issues found! All components have their CSS classes properly defined.');
  }
  
  return results;
}

// Run the audit
if (require.main === module) {
  try {
    auditAllComponents();
  } catch (error) {
    console.error('❌ Error running audit:', error.message);
    process.exit(1);
  }
}

module.exports = { auditAllComponents, auditComponent };