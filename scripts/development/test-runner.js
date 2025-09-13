#!/usr/bin/env node

/**
 * Test Runner - Unified testing for all development scripts
 * 
 * Consolidates test-commit.js and other testing functionality
 * Usage: node scripts/development/test-runner.js [target]
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  log, logHeader, logSuccess, logError, logWarning, logInfo, colors 
} from '../utils/logger.js';
import { validateGitRepository } from '../utils/git-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// Test categories
const testSuites = {
  scripts: {
    name: '📜 Script Validation',
    description: 'Test syntax and functionality of all scripts',
    tests: [
      { script: 'scripts/development/dev-tools.js', name: 'Development Tools (Main)' },
      { script: 'scripts/git/smart-commit.js', name: 'Smart Commit (AI)' },
      { script: 'scripts/git/commit.sh', name: 'Quick Commit (Bash)' },
      { script: 'scripts/analysis/cleanup.js', name: 'Cleanup Utility' },
      { script: 'scripts/development/toggle-cache-logs.js', name: 'Cache Logs Toggle' }
    ]
  },
  pipelines: {
    name: '🔄 Pipeline Functionality',
    description: 'Test pipeline execution and validation',
    tests: [
      { cmd: 'npm run lint --silent', name: 'ESLint Pipeline' },
      { cmd: 'npm run type-check --silent', name: 'TypeScript Pipeline' },
      { cmd: 'npm run format:check --silent', name: 'Format Check Pipeline' },
      { cmd: 'npm run build --silent', name: 'Build Pipeline' }
    ]
  },
  git: {
    name: '🔧 Git Operations',
    description: 'Test git-related functionality',
    tests: [
      { cmd: 'git status', name: 'Git Status Check' },
      { cmd: 'git log --oneline -1', name: 'Git Log Access' },
      { cmd: 'git diff --name-only', name: 'Git Diff Access' }
    ]
  },
  npm: {
    name: '📦 NPM Scripts',
    description: 'Validate NPM script configuration',
    tests: [
      'dev-tools',
      'commit',
      'pipeline',
      'flow',
      'pipeline:quality',
      'pipeline:security',
      'pipeline:build',
      'flow:quick',
      'flow:safe',
      'build:full'
    ]
  }
};

function testScript(scriptPath, description) {
  try {
    log(`\n🧪 Testing: ${description}`, colors.cyan);
    
    // Check if script exists
    execSync(`test -f ${scriptPath}`, { cwd: rootDir });
    
    // Check syntax based on file type
    if (scriptPath.endsWith('.js')) {
      execSync(`node --check ${scriptPath}`, { 
        encoding: 'utf8', 
        cwd: rootDir,
        stdio: 'pipe'
      });
      logSuccess(`${description} - JavaScript syntax OK`);
    } else if (scriptPath.endsWith('.sh')) {
      execSync(`bash -n ${scriptPath}`, { 
        encoding: 'utf8', 
        cwd: rootDir,
        stdio: 'pipe'
      });
      logSuccess(`${description} - Bash syntax OK`);
    } else {
      logSuccess(`${description} - File exists`);
    }
    
    return true;
  } catch (error) {
    logError(`${description} - Failed: ${error.message}`);
    return false;
  }
}

function testCommand(command, description) {
  try {
    log(`\n🧪 Testing: ${description}`, colors.cyan);
    
    execSync(command, { 
      cwd: rootDir,
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout
    });
    
    logSuccess(`${description} - Command executed successfully`);
    return true;
  } catch (error) {
    logError(`${description} - Failed: ${error.message}`);
    return false;
  }
}

function testNpmScript(scriptName) {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts[scriptName]) {
      logSuccess(`NPM script '${scriptName}' exists`);
      return true;
    } else {
      logError(`NPM script '${scriptName}' not found`);
      return false;
    }
  } catch (error) {
    logError(`Failed to check NPM script '${scriptName}': ${error.message}`);
    return false;
  }
}

function testGitRepository() {
  if (validateGitRepository()) {
    logSuccess('Git repository detected');
    return true;
  } else {
    return false;
  }
}

function testEnvironment() {
  logHeader('🌍 Environment Validation');
  
  let passed = 0;
  let failed = 0;
  
  // Test Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    logSuccess(`Node.js: ${nodeVersion}`);
    passed++;
  } catch (error) {
    logError('Node.js not found');
    failed++;
  }
  
  // Test NPM
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    logSuccess(`NPM: ${npmVersion}`);
    passed++;
  } catch (error) {
    logError('NPM not found');
    failed++;
  }
  
  // Test Git
  if (testGitRepository()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test package.json
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    logSuccess(`Project: ${packageJson.name} v${packageJson.version}`);
    passed++;
  } catch (error) {
    logError('package.json not found or invalid');
    failed++;
  }
  
  return { passed, failed };
}

function runTestSuite(suiteName) {
  const suite = testSuites[suiteName];
  if (!suite) {
    logError(`Unknown test suite: ${suiteName}`);
    return { passed: 0, failed: 1 };
  }
  
  logHeader(`${suite.name}`);
  logInfo(suite.description);
  
  let passed = 0;
  let failed = 0;
  
  if (suiteName === 'scripts') {
    suite.tests.forEach(test => {
      if (testScript(test.script, test.name)) {
        passed++;
      } else {
        failed++;
      }
    });
  } else if (suiteName === 'pipelines') {
    suite.tests.forEach(test => {
      if (testCommand(test.cmd, test.name)) {
        passed++;
      } else {
        failed++;
      }
    });
  } else if (suiteName === 'git') {
    suite.tests.forEach(test => {
      if (testCommand(test.cmd, test.name)) {
        passed++;
      } else {
        failed++;
      }
    });
  } else if (suiteName === 'npm') {
    log(`\n🧪 Testing NPM Scripts`, colors.cyan);
    suite.tests.forEach(scriptName => {
      if (testNpmScript(scriptName)) {
        passed++;
      } else {
        failed++;
      }
    });
  }
  
  return { passed, failed };
}

function showSummary(results) {
  logHeader('📊 Test Summary');
  
  const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
  
  log(`✅ Total Passed: ${totalPassed}`, colors.green);
  log(`❌ Total Failed: ${totalFailed}`, colors.red);
  log(`📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`, colors.blue);
  
  if (totalFailed === 0) {
    logSuccess('🎉 All tests passed! Development environment is ready.');
    
    log(`\n🚀 Quick Start Guide:`, colors.blue);
    log(`• npm run dev-tools        - Main development orchestrator`, colors.white);
    log(`• npm run commit           - AI-powered commits`, colors.white);
    log(`• npm run pipeline         - Interactive pipeline runner`, colors.white);
    log(`• npm run flow             - Complete development workflows`, colors.white);
    
    return true;
  } else {
    logError('❌ Some tests failed. Please check the errors above.');
    return false;
  }
}

function showHelp() {
  console.log(`
🧪 Test Runner - Unified Development Script Testing

Usage: node scripts/development/test-runner.js [target]

Targets:
  scripts      Test all development scripts syntax and functionality
  pipelines    Test pipeline execution (lint, build, etc.)
  git          Test git operations and repository status
  npm          Test NPM script configuration
  env          Test environment setup (Node.js, NPM, Git)
  all          Run all test suites (default)

Examples:
  node scripts/development/test-runner.js              # Run all tests
  node scripts/development/test-runner.js scripts      # Test only scripts
  node scripts/development/test-runner.js pipelines    # Test only pipelines
  node scripts/development/test-runner.js env          # Test only environment

NPM Integration:
  npm run test-scripts                     # Run all tests
  `);
}

function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';
  
  if (target === 'help' || target === '--help' || target === '-h') {
    showHelp();
    return;
  }
  
  logHeader('🧪 Test Runner - Development Script Validation');
  
  const results = [];
  
  if (target === 'all') {
    // Run all test suites
    results.push(testEnvironment());
    results.push(runTestSuite('scripts'));
    results.push(runTestSuite('npm'));
    results.push(runTestSuite('git'));
    // Skip pipelines in 'all' mode to avoid long execution
    logInfo('Skipping pipeline tests in "all" mode. Run with "pipelines" target to test them.');
  } else if (target === 'env') {
    results.push(testEnvironment());
  } else if (testSuites[target]) {
    results.push(runTestSuite(target));
  } else {
    logError(`Unknown target: ${target}`);
    showHelp();
    process.exit(1);
  }
  
  // Show summary
  const success = showSummary(results);
  process.exit(success ? 0 : 1);
}

main();