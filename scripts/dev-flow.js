#!/usr/bin/env node

/**
 * Development Flow - Complete development workflow automation
 * 
 * Integrates quality checks, commit generation, and push automation
 * Usage: node scripts/dev-flow.js [options]
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

function executeCommand(command, description, options = {}) {
  try {
    log(`\n🔄 ${description}...`, colors.cyan);
    const startTime = Date.now();
    
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit', 
      cwd: rootDir,
      env: { ...process.env, FORCE_COLOR: '1' },
      encoding: 'utf8'
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logSuccess(`${description} completed in ${duration}s`);
    return { success: true, output: result };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logError(`${description} failed after ${duration}s`);
    return { success: false, error: error.message };
  }
}

// Development workflow steps
const workflows = {
  'quick-commit': {
    name: '⚡ Quick Commit',
    description: 'Quick quality check + AI commit + push',
    steps: [
      { command: 'npm run ci:check', description: 'Quick CI check' },
      { command: 'node scripts/smart-commit.js', description: 'AI-powered commit', interactive: true },
      { command: 'git push', description: 'Push to remote' }
    ]
  },
  'safe-commit': {
    name: '🛡️ Safe Commit',
    description: 'Full quality + security check + AI commit',
    steps: [
      { command: 'npm run pipeline:quality', description: 'Quality pipeline' },
      { command: 'npm run pipeline:security', description: 'Security pipeline' },
      { command: 'node scripts/smart-commit.js', description: 'AI-powered commit', interactive: true }
    ]
  },
  'full-flow': {
    name: '🚀 Full Development Flow',
    description: 'Complete pipeline + AI commit + push',
    steps: [
      { command: 'npm run pipeline:all', description: 'All pipelines' },
      { command: 'node scripts/smart-commit.js', description: 'AI-powered commit', interactive: true },
      { command: 'git push', description: 'Push to remote' }
    ]
  },
  'pre-push': {
    name: '📤 Pre-Push Validation',
    description: 'Validate before pushing existing commits',
    steps: [
      { command: 'npm run pipeline:quality', description: 'Quality pipeline' },
      { command: 'npm run pipeline:security', description: 'Security pipeline' },
      { command: 'npm run pipeline:build', description: 'Build pipeline' },
      { command: 'git push', description: 'Push to remote' }
    ]
  },
  'fix-and-commit': {
    name: '🔧 Fix and Commit',
    description: 'Auto-fix issues + commit + push',
    steps: [
      { command: 'npm run lint:fix', description: 'Auto-fix linting issues' },
      { command: 'npm run format', description: 'Auto-format code' },
      { command: 'npm run ci:check', description: 'Verify fixes' },
      { command: './scripts/commit.sh --all', description: 'Stage all and commit', interactive: true }
    ]
  }
};

async function promptUser(question) {
  return new Promise((resolve) => {
    process.stdout.write(`${question} `);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

function showMenu() {
  logHeader('🔄 Development Flow - Automated Workflow');
  
  log('\nAvailable workflows:', colors.bright);
  Object.entries(workflows).forEach(([key, workflow], index) => {
    log(`  ${index + 1}. ${workflow.name}`, colors.green);
    log(`     ${workflow.description}`, colors.white);
  });
  
  log('\nQuick commands:', colors.bright);
  log('  q - Quick commit (fast)', colors.cyan);
  log('  s - Safe commit (thorough)', colors.yellow);
  log('  f - Full flow (complete)', colors.magenta);
  log('  p - Pre-push validation', colors.blue);
  log('  x - Fix and commit', colors.green);
  log('  h - Show this help', colors.white);
  log('  e - Exit', colors.red);
}

function showWorkflowPreview(workflowKey) {
  const workflow = workflows[workflowKey];
  if (!workflow) return;
  
  logHeader(`${workflow.name} - Preview`);
  log(`Description: ${workflow.description}`, colors.blue);
  
  log('\nSteps to execute:', colors.bright);
  workflow.steps.forEach((step, index) => {
    const icon = step.interactive ? '🤖' : '⚙️';
    log(`  ${index + 1}. ${icon} ${step.description}`, colors.white);
    log(`     Command: ${step.command}`, colors.cyan);
  });
}

async function executeWorkflow(workflowKey) {
  const workflow = workflows[workflowKey];
  if (!workflow) {
    logError(`Unknown workflow: ${workflowKey}`);
    return false;
  }
  
  logHeader(`${workflow.name} - Execution Started`);
  
  const startTime = Date.now();
  let allSuccess = true;
  
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];
    
    if (step.interactive) {
      log(`\n🤖 Interactive step: ${step.description}`, colors.magenta);
      log('This step requires your input...', colors.yellow);
    }
    
    const result = executeCommand(step.command, step.description);
    
    if (!result.success) {
      allSuccess = false;
      
      const continueAnyway = await promptUser('\n⚠️ Step failed. Continue anyway? (y/n):');
      if (continueAnyway.toLowerCase() !== 'y') {
        logError('Workflow aborted by user');
        return false;
      }
    }
  }
  
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  if (allSuccess) {
    logSuccess(`${workflow.name} completed successfully in ${totalDuration}s`);
  } else {
    logWarning(`${workflow.name} completed with some failures in ${totalDuration}s`);
  }
  
  return allSuccess;
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: rootDir });
    const hasChanges = status.trim().length > 0;
    
    if (hasChanges) {
      log('\n📊 Git Status:', colors.bright);
      const lines = status.trim().split('\n');
      
      // Check if there are unstaged changes that need auto-staging
      const hasUnstaged = lines.some(line => {
        const status = line.substring(0, 2);
        return status.includes('M') || status.includes('??') || status.includes('D');
      });
      
      if (hasUnstaged) {
        logInfo('Found unstaged changes. Auto-staging with `git add .`...');
        execSync('git add .', { cwd: rootDir });
        logSuccess('All changes staged successfully!');
        
        // Re-check status after staging
        const newStatus = execSync('git status --porcelain', { encoding: 'utf8', cwd: rootDir });
        const newLines = newStatus.trim().split('\n').filter(line => line.trim());
        
        newLines.forEach(line => {
          const status = line.substring(0, 2);
          const file = line.substring(3);
          let color = colors.green; // All should be staged now
          let icon = '+';
          
          if (status.includes('M')) { icon = '~'; }
          if (status.includes('D')) { color = colors.red; icon = '-'; }
          
          log(`  ${icon} ${file}`, color);
        });
      } else {
        lines.forEach(line => {
          const status = line.substring(0, 2);
          const file = line.substring(3);
          let color = colors.white;
          let icon = '•';
          
          if (status.includes('M')) { color = colors.yellow; icon = '~'; }
          if (status.includes('A')) { color = colors.green; icon = '+'; }
          if (status.includes('D')) { color = colors.red; icon = '-'; }
          
          log(`  ${icon} ${file}`, color);
        });
      }
    } else {
      log('\n✨ Working directory is clean', colors.green);
    }
    
    return hasChanges;
  } catch (error) {
    logError('Not a git repository or git not available');
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Handle command line arguments
  if (args.length > 0) {
    const command = args[0].toLowerCase();
    
    switch (command) {
      case 'quick-commit':
      case 'q':
        return await executeWorkflow('quick-commit');
      case 'safe-commit':
      case 's':
        return await executeWorkflow('safe-commit');
      case 'full-flow':
      case 'f':
        return await executeWorkflow('full-flow');
      case 'pre-push':
      case 'p':
        return await executeWorkflow('pre-push');
      case 'fix-and-commit':
      case 'x':
        return await executeWorkflow('fix-and-commit');
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
  
  // Show current git status
  checkGitStatus();
  
  while (true) {
    const input = await promptUser('\n🎯 Select workflow (or command):');
    
    switch (input.toLowerCase()) {
      case 'q':
        await executeWorkflow('quick-commit');
        break;
      case 's':
        await executeWorkflow('safe-commit');
        break;
      case 'f':
        await executeWorkflow('full-flow');
        break;
      case 'p':
        await executeWorkflow('pre-push');
        break;
      case 'x':
        await executeWorkflow('fix-and-commit');
        break;
      case 'h':
        showMenu();
        checkGitStatus();
        break;
      case 'e':
      case 'exit':
      case 'quit':
        log('\n👋 Development flow ended. Happy coding!', colors.cyan);
        process.exit(0);
        break;
      case '1':
        await executeWorkflow('quick-commit');
        break;
      case '2':
        await executeWorkflow('safe-commit');
        break;
      case '3':
        await executeWorkflow('full-flow');
        break;
      case '4':
        await executeWorkflow('pre-push');
        break;
      case '5':
        await executeWorkflow('fix-and-commit');
        break;
      default:
        logWarning('Invalid option. Type "h" for help or "e" to exit.');
        break;
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n👋 Development flow interrupted. Goodbye!', colors.cyan);
  process.exit(0);
});

// Start the application
main().catch((error) => {
  logError('Development flow crashed:');
  console.error(error);
  process.exit(1);
});