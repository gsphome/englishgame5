#!/usr/bin/env node

/**
 * Integration Validator - Validates holistic system integration
 * 
 * Ensures local scripts and CI/CD workflows are properly integrated
 * Usage: node scripts/development/validate-integration.js
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { log, logHeader, logSuccess, logError, logWarning, logInfo, colors } from '../utils/logger.js';

function validatePackageScripts() {
  logHeader('📦 Package.json Script Validation');
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts;
    
    // Check for CI-specific scripts
    const requiredCIScripts = ['ci:quality', 'ci:security', 'ci:build', 'ci:all'];
    const missingCIScripts = requiredCIScripts.filter(script => !scripts[script]);
    
    if (missingCIScripts.length === 0) {
      logSuccess('All required CI scripts are present');
    } else {
      logError(`Missing CI scripts: ${missingCIScripts.join(', ')}`);
      return false;
    }
    
    // Validate CI scripts use dev-tools.js with --ci-mode
    const ciScriptPattern = /node scripts\/dev-tools\.js .+ --ci-mode/;
    let validCIScripts = 0;
    
    requiredCIScripts.forEach(script => {
      if (ciScriptPattern.test(scripts[script])) {
        validCIScripts++;
      } else {
        logWarning(`CI script '${script}' doesn't follow expected pattern`);
      }
    });
    
    if (validCIScripts === requiredCIScripts.length) {
      logSuccess('All CI scripts follow the unified pattern');
    } else {
      logWarning(`${validCIScripts}/${requiredCIScripts.length} CI scripts follow the pattern`);
    }
    
    return true;
  } catch (error) {
    logError(`Failed to validate package.json: ${error.message}`);
    return false;
  }
}

function validateWorkflowIntegration() {
  logHeader('☁️ Workflow Integration Validation');
  
  try {
    // Check quality workflow
    const qualityWorkflow = readFileSync('.github/workflows/quality.yml', 'utf8');
    
    if (qualityWorkflow.includes('npm run ci:quality')) {
      logSuccess('Quality workflow uses unified CI script');
    } else {
      logWarning('Quality workflow not using unified CI script');
    }
    
    // Check for old individual commands
    const oldCommands = ['npm run lint', 'npm run type-check', 'npm run test:unit'];
    const hasOldCommands = oldCommands.some(cmd => qualityWorkflow.includes(cmd));
    
    if (!hasOldCommands) {
      logSuccess('Quality workflow has been modernized (no old individual commands)');
    } else {
      logWarning('Quality workflow still contains old individual commands');
    }
    
    return true;
  } catch (error) {
    logError(`Failed to validate workflows: ${error.message}`);
    return false;
  }
}

function validateLocalCIConsistency() {
  logHeader('🔄 Local-CI Consistency Validation');
  
  try {
    // Test that CI scripts work locally
    const ciScripts = ['ci:quality', 'ci:security', 'ci:build'];
    let workingScripts = 0;
    
    ciScripts.forEach(script => {
      try {
        logInfo(`Testing ${script}...`);
        execSync(`npm run ${script} --silent`, { stdio: 'pipe' });
        logSuccess(`${script} executes successfully`);
        workingScripts++;
      } catch (error) {
        logWarning(`${script} failed locally: ${error.message.split('\n')[0]}`);
      }
    });
    
    if (workingScripts === ciScripts.length) {
      logSuccess('All CI scripts work locally');
    } else {
      logWarning(`${workingScripts}/${ciScripts.length} CI scripts work locally`);
    }
    
    return workingScripts > 0;
  } catch (error) {
    logError(`Failed to test local-CI consistency: ${error.message}`);
    return false;
  }
}

function validateDevToolsIntegration() {
  logHeader('🎭 Dev-tools Integration Validation');
  
  try {
    // Test dev-tools.js with CI mode
    logInfo('Testing dev-tools.js CI mode support...');
    
    const result = execSync('node scripts/development/dev-tools.js --help', { encoding: 'utf8' });
    
    if (result.includes('--ci-mode') || result.includes('CI mode')) {
      logSuccess('dev-tools.js supports CI mode');
    } else {
      logWarning('dev-tools.js CI mode support not clearly documented');
    }
    
    // Test that dev-tools.js can detect CI environment
    const ciTest = execSync('CI=true node scripts/development/dev-tools.js quality --ci-mode', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (ciTest.includes('CI mode') || ciTest.includes('🤖')) {
      logSuccess('dev-tools.js correctly detects CI environment');
    } else {
      logWarning('dev-tools.js CI environment detection unclear');
    }
    
    return true;
  } catch (error) {
    logError(`Failed to validate dev-tools integration: ${error.message}`);
    return false;
  }
}

function validateSystemArchitecture() {
  logHeader('🏗️ System Architecture Validation');
  
  const checks = [
    {
      name: 'Unified entry point (dev-tools.js)',
      test: () => {
        try {
          execSync('test -f scripts/development/dev-tools.js');
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Shared utilities exist',
      test: () => {
        try {
          execSync('test -d scripts/utils');
          execSync('test -f scripts/utils/logger.js');
          execSync('test -f scripts/utils/git-utils.js');
          execSync('test -f scripts/utils/ai-analyzer.js');
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'CI-optimized workflows',
      test: () => {
        try {
          const qualityWorkflow = readFileSync('.github/workflows/quality.yml', 'utf8');
          return qualityWorkflow.includes('quality-unified');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Integration testing capability',
      test: () => {
        try {
          execSync('test -f scripts/development/test-runner.js');
          return true;
        } catch {
          return false;
        }
      }
    }
  ];
  
  let passedChecks = 0;
  checks.forEach(check => {
    if (check.test()) {
      logSuccess(check.name);
      passedChecks++;
    } else {
      logError(check.name);
    }
  });
  
  const score = (passedChecks / checks.length) * 100;
  logInfo(`Architecture Score: ${score.toFixed(1)}%`);
  
  return score >= 75; // 75% minimum for good architecture
}

function generateRecommendations() {
  logHeader('💡 Integration Recommendations');
  
  const recommendations = [
    {
      priority: 'HIGH',
      title: 'Complete Workflow Migration',
      description: 'Update all workflows (security.yml, build.yml) to use unified CI scripts',
      action: 'Replace individual commands with npm run ci:* scripts'
    },
    {
      priority: 'MEDIUM',
      title: 'Add Integration Tests',
      description: 'Create comprehensive tests for local-CI consistency',
      action: 'Extend test-runner.js with workflow validation suite'
    },
    {
      priority: 'MEDIUM',
      title: 'Environment Configuration',
      description: 'Add configuration system for environment-specific settings',
      action: 'Create config files for local vs CI differences'
    },
    {
      priority: 'LOW',
      title: 'Performance Monitoring',
      description: 'Add timing and performance metrics across environments',
      action: 'Implement performance tracking in dev-tools.js'
    }
  ];
  
  recommendations.forEach(rec => {
    const color = rec.priority === 'HIGH' ? colors.red : 
                  rec.priority === 'MEDIUM' ? colors.yellow : colors.blue;
    
    log(`\n${rec.priority} PRIORITY: ${rec.title}`, color);
    log(`Description: ${rec.description}`, colors.white);
    log(`Action: ${rec.action}`, colors.cyan);
  });
}

function main() {
  logHeader('🔍 Holistic Integration Validation');
  
  const validations = [
    { name: 'Package Scripts', fn: validatePackageScripts },
    { name: 'Workflow Integration', fn: validateWorkflowIntegration },
    { name: 'Local-CI Consistency', fn: validateLocalCIConsistency },
    { name: 'Dev-tools Integration', fn: validateDevToolsIntegration },
    { name: 'System Architecture', fn: validateSystemArchitecture }
  ];
  
  let passedValidations = 0;
  const results = [];
  
  validations.forEach(validation => {
    logInfo(`Running ${validation.name} validation...`);
    const result = validation.fn();
    results.push({ name: validation.name, passed: result });
    if (result) passedValidations++;
  });
  
  // Summary
  logHeader('📊 Validation Summary');
  
  results.forEach(result => {
    if (result.passed) {
      logSuccess(result.name);
    } else {
      logError(result.name);
    }
  });
  
  const score = (passedValidations / validations.length) * 100;
  logInfo(`Overall Integration Score: ${score.toFixed(1)}%`);
  
  if (score >= 80) {
    logSuccess('🎉 Excellent integration! System is well unified.');
  } else if (score >= 60) {
    logWarning('⚠️ Good integration with room for improvement.');
  } else {
    logError('❌ Poor integration. Significant improvements needed.');
  }
  
  // Generate recommendations
  generateRecommendations();
  
  return score >= 60;
}

// Run validation
const success = main();
process.exit(success ? 0 : 1);