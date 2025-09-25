#!/usr/bin/env node

/**
 * Script to validate that all sorting modules have at least 2 categories
 * This ensures the sorting game makes sense (you need at least 2 categories to sort into)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read learning modules configuration
const modulesPath = path.join(__dirname, '../public/data/learningModules.json');
const modules = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

// Find all sorting modules
const sortingModules = modules.filter(module => module.learningMode === 'sorting');

console.log('🔍 Validating sorting modules...\n');

let hasErrors = false;

for (const module of sortingModules) {
  console.log(`📋 Checking module: ${module.name} (${module.id})`);
  
  try {
    // Read the module data file
    const dataPath = path.join(__dirname, '../public', module.dataPath);
    const moduleData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Check if it has categories array
    if (!moduleData.categories || !Array.isArray(moduleData.categories)) {
      console.log(`   ❌ Missing 'categories' array`);
      hasErrors = true;
      continue;
    }
    
    // Check number of categories
    const categoryCount = moduleData.categories.length;
    if (categoryCount < 2) {
      console.log(`   ❌ Only ${categoryCount} category found. Sorting requires at least 2 categories.`);
      hasErrors = true;
    } else {
      console.log(`   ✅ ${categoryCount} categories found: ${moduleData.categories.join(', ')}`);
    }
    
    // Check if data items exist and have categories
    if (!moduleData.data || !Array.isArray(moduleData.data)) {
      console.log(`   ❌ Missing 'data' array`);
      hasErrors = true;
      continue;
    }
    
    // Check unique categories in data
    const dataCategories = [...new Set(moduleData.data.map(item => item.category))];
    if (dataCategories.length < 2) {
      console.log(`   ❌ Data only contains ${dataCategories.length} unique category: ${dataCategories.join(', ')}`);
      hasErrors = true;
    } else {
      console.log(`   ✅ Data contains ${dataCategories.length} categories: ${dataCategories.join(', ')}`);
    }
    
    // Verify categories match between categories array and data
    const missingInData = moduleData.categories.filter(cat => !dataCategories.includes(cat));
    const extraInData = dataCategories.filter(cat => !moduleData.categories.includes(cat));
    
    if (missingInData.length > 0) {
      console.log(`   ⚠️  Categories defined but not used in data: ${missingInData.join(', ')}`);
    }
    
    if (extraInData.length > 0) {
      console.log(`   ⚠️  Categories used in data but not defined: ${extraInData.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error reading module data: ${error.message}`);
    hasErrors = true;
  }
  
  console.log('');
}

console.log('📊 Validation Summary:');
console.log(`   Total sorting modules: ${sortingModules.length}`);

if (hasErrors) {
  console.log('   ❌ Some modules have issues that need to be fixed');
  process.exit(1);
} else {
  console.log('   ✅ All sorting modules are valid');
}