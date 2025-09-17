#!/usr/bin/env node

/**
 * Coverage Diagnostic Script
 * Helps diagnose coverage-related CI issues
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Coverage Diagnostic Report');
console.log('================================');

// Check if coverage directory exists
const coverageDir = './coverage';
const coverageExists = fs.existsSync(coverageDir);

console.log(`📁 Coverage directory: ${coverageExists ? '✅ EXISTS' : '❌ MISSING'}`);

if (coverageExists) {
    // List coverage files
    const files = fs.readdirSync(coverageDir);
    console.log('📄 Coverage files:');
    files.forEach(file => {
        const filePath = path.join(coverageDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   ${file} (${stats.size} bytes)`);
    });

    // Check for required files
    const requiredFiles = ['lcov.info', 'coverage-final.json'];
    requiredFiles.forEach(file => {
        const exists = fs.existsSync(path.join(coverageDir, file));
        console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
    });

    // Check lcov.info content
    const lcovPath = path.join(coverageDir, 'lcov.info');
    if (fs.existsSync(lcovPath)) {
        const content = fs.readFileSync(lcovPath, 'utf8');
        const lines = content.split('\n').length;
        console.log(`📊 lcov.info: ${lines} lines, ${content.length} characters`);

        if (content.length === 0) {
            console.log('⚠️  WARNING: lcov.info is empty');
        }
    }
}

// Check vitest config
console.log('\n⚙️  Vitest Configuration:');
const vitestConfigPath = './config/vitest.config.ts';
if (fs.existsSync(vitestConfigPath)) {
    const config = fs.readFileSync(vitestConfigPath, 'utf8');
    const hasLcov = config.includes('lcov');
    const hasCoverage = config.includes('coverage');

    console.log(`   Coverage config: ${hasCoverage ? '✅' : '❌'}`);
    console.log(`   LCOV reporter: ${hasLcov ? '✅' : '❌'}`);
} else {
    console.log('   ❌ vitest.config.ts not found');
}

// Check package.json scripts
console.log('\n📦 Package.json Scripts:');
const packagePath = './package.json';
if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const hasCoverageScript = pkg.scripts && pkg.scripts['test:coverage'];
    console.log(`   test:coverage: ${hasCoverageScript ? '✅' : '❌'}`);

    if (hasCoverageScript) {
        console.log(`   Command: ${pkg.scripts['test:coverage']}`);
    }
}

console.log('\n🎯 Recommendations:');
if (!coverageExists) {
    console.log('   1. Run: npm run test:coverage');
}
if (coverageExists && !fs.existsSync(path.join(coverageDir, 'lcov.info'))) {
    console.log('   2. Check vitest config has lcov reporter');
}
console.log('   3. Ensure CI uses same Node.js version as local');
console.log('   4. Check GitHub Actions logs for specific errors');

console.log('\n✨ Done!');