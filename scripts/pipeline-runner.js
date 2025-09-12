#!/usr/bin/env node

/**
 * Pipeline Runner - Interactive script to run CI/CD pipelines locally
 * 
 * This script provides a quick way to execute the same checks that run in CI/CD pipelines
 * Usage: node scripts/pipeline-runner.js [options]
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Pipeline configurations
const pipelines = {
  quality: {
    name: '🎯 Quality Pipeline',
    description: 'ESLint, TypeScript, Tests, Formatting',
    script: 'pipeline:quality',
    color: colors.blue
  },
  security: {
    name: '🛡️ Security Pipeline', 
    description: 'Vulnerabilities, Secrets, Licenses',
    script: 'pipeline:security',
    color: colors.red
  },
  build: {
    name: '📦 Build Pipeline',
    description: 'Build, Verify, Bundle Analysis',
    script: 'pipeline:build',
    color: colors.green
  },
  all: {
    name: '🚀 All Pipelines',
    description: 'Quality + Security + Build',
    script: 'pipeline:all',
    color: colors.magenta
  },
  'ci-check': {
    name: '⚡ Quick CI Check',
    description: 'Fast essential checks',
    script: 'ci:check',
    color: colors.cyan
  },
  'ci-local': {
    name: '🎭 Local CI/CD',
    description: 'Full CI simulation (no deploy)',
    script: 'ci:local',
    color: colors.yellow
  },
  'ci-full': {
    name: '🔄 Full CI Simulation',
    description: 'Complete CI with fresh install',
    script: 'ci:full',
    color: colors.white
  }
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

function executeCommand(command, description) {
  try {
    log(`\n🔄 ${description}...`, colors.cyan);
    const startTime = Date.now();
    
    execSync(command, { 
      stdio: 'inherit', 
      cwd: rootDir,
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logSuccess(`${description} completed in ${duration}s`);
    return true;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logError(`${description} failed after ${duration}s`);
    return false;
  }
}

function showMenu() {
  logHeader('🎭 PIPELINE RUNNER - Local CI/CD Execution');
  
  log('\nAvailable pipelines:', colors.bright);
  Object.entries(pipelines).forEach(([key, pipeline], index) => {
    log(`  ${index + 1}. ${pipeline.color}${pipeline.name}${colors.reset}`);
    log(`     ${pipeline.description}`, colors.white);
  });
  
  log('\nQuick commands:', colors.bright);
  log('  q - Quality only', colors.blue);
  log('  s - Security only', colors.red);  
  log('  b - Build only', colors.green);
  log('  a - All pipelines', colors.magenta);
  log('  c - Quick CI check', colors.cyan);
  log('  f - Full CI simulation', colors.white);
  log('  d - Debug info', colors.yellow);
  log('  h - Show this help', colors.white);
  log('  x - Exit', colors.red);
}

function showDebugInfo() {
  logHeader('🐛 DEBUG INFORMATION');
  
  try {
    // Node and npm versions
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    
    log(`Node.js: ${nodeVersion}`, colors.green);
    log(`NPM: ${npmVersion}`, colors.green);
    
    // Package.json info
    const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    log(`Project: ${packageJson.name} v${packageJson.version}`, colors.blue);
    
    // Git info
    try {
      const gitBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      log(`Git: ${gitBranch} (${gitCommit})`, colors.cyan);
    } catch {
      log('Git: Not a git repository or git not available', colors.yellow);
    }
    
    // Dependencies check
    log('\nChecking key dependencies...', colors.bright);
    const keyDeps = ['typescript', 'vite', 'vitest', 'eslint', 'prettier'];
    keyDeps.forEach(dep => {
      try {
        const version = execSync(`npm list ${dep} --depth=0`, { encoding: 'utf8' });
        const match = version.match(new RegExp(`${dep}@([\\d\\.]+)`));
        if (match) {
          log(`  ${dep}: ${match[1]}`, colors.green);
        }
      } catch {
        log(`  ${dep}: Not found or error`, colors.red);
      }
    });
    
  } catch (error) {
    logError('Failed to collect debug information');
    console.error(error.message);
  }
}

function runPipeline(pipelineKey) {
  const pipeline = pipelines[pipelineKey];
  if (!pipeline) {
    logError(`Unknown pipeline: ${pipelineKey}`);
    return false;
  }
  
  logHeader(`${pipeline.name} - Starting Execution`);
  logInfo(`Description: ${pipeline.description}`);
  
  const startTime = Date.now();
  const success = executeCommand(`npm run ${pipeline.script}`, pipeline.name);
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  if (success) {
    logSuccess(`${pipeline.name} completed successfully in ${totalDuration}s`);
  } else {
    logError(`${pipeline.name} failed after ${totalDuration}s`);
  }
  
  return success;
}

function promptUser() {
  return new Promise((resolve) => {
    process.stdout.write('\n🎯 Select option (or type command): ');
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim().toLowerCase());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  // Handle command line arguments
  if (args.length > 0) {
    const command = args[0].toLowerCase();
    
    switch (command) {
      case 'quality':
      case 'q':
        return runPipeline('quality');
      case 'security':
      case 's':
        return runPipeline('security');
      case 'build':
      case 'b':
        return runPipeline('build');
      case 'all':
      case 'a':
        return runPipeline('all');
      case 'ci-check':
      case 'c':
        return runPipeline('ci-check');
      case 'ci-local':
      case 'l':
        return runPipeline('ci-local');
      case 'ci-full':
      case 'f':
        return runPipeline('ci-full');
      case 'debug':
      case 'd':
        showDebugInfo();
        return;
      case 'help':
      case 'h':
      case '--help':
        showMenu();
        return;
      default:
        logError(`Unknown command: ${command}`);
        showMenu();
        return;
    }
  }
  
  // Interactive mode
  console.clear();
  showMenu();
  
  while (true) {
    const input = await promptUser();
    
    switch (input) {
      case 'q':
        runPipeline('quality');
        break;
      case 's':
        runPipeline('security');
        break;
      case 'b':
        runPipeline('build');
        break;
      case 'a':
        runPipeline('all');
        break;
      case 'c':
        runPipeline('ci-check');
        break;
      case 'f':
        runPipeline('ci-full');
        break;
      case 'd':
        showDebugInfo();
        break;
      case 'h':
        showMenu();
        break;
      case 'x':
      case 'exit':
      case 'quit':
        log('\n👋 Goodbye!', colors.cyan);
        process.exit(0);
        break;
      case '1':
        runPipeline('quality');
        break;
      case '2':
        runPipeline('security');
        break;
      case '3':
        runPipeline('build');
        break;
      case '4':
        runPipeline('all');
        break;
      case '5':
        runPipeline('ci-check');
        break;
      case '6':
        runPipeline('ci-local');
        break;
      case '7':
        runPipeline('ci-full');
        break;
      default:
        logWarning('Invalid option. Type "h" for help or "x" to exit.');
        break;
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n👋 Pipeline runner interrupted. Goodbye!', colors.cyan);
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n👋 Pipeline runner terminated. Goodbye!', colors.cyan);
  process.exit(0);
});

// Start the application
main().catch((error) => {
  logError('Pipeline runner crashed:');
  console.error(error);
  process.exit(1);
});