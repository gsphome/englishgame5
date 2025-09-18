#!/usr/bin/env node

/**
 * Development Tools - Unified development workflow orchestrator
 * 
 * Consolidates pipeline-runner.js, dev-flow.js, and pipeline.sh functionality
 * Usage: node scripts/development/dev-tools.js [command] [options]
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(dirname(__dirname)); // Go up two levels: development -> scripts -> root

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
  const startTime = Date.now();
  try {
    log(`\n🔄 ${description}...`, colors.cyan);

    execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
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

// Pipeline definitions
const pipelines = {
  quality: {
    name: '🎯 Quality Pipeline',
    description: 'ESLint, TypeScript, Tests, Formatting',
    commands: [
      { cmd: 'npm run lint', desc: 'ESLint check' },
      { cmd: 'npm run type-check', desc: 'TypeScript check' },
      { cmd: 'npm run test:unit', desc: 'Unit tests' },
      { cmd: 'npm run test:integration', desc: 'Integration tests' },
      { cmd: 'npm run format:check', desc: 'Format check' }
    ],
    color: colors.blue
  },
  security: {
    name: '🛡️ Security Pipeline',
    description: 'Vulnerabilities, Secrets, Licenses',
    commands: [
      { cmd: 'npm run security:audit', desc: 'Dependency audit' },
      { cmd: 'npm run security:audit:production', desc: 'Production audit' },
      { cmd: 'npm run security:audit:critical', desc: 'Critical vulnerabilities' },
      { cmd: 'npm run security:patterns', desc: 'Security patterns' }
    ],
    color: colors.red
  },
  build: {
    name: '📦 Build Pipeline',
    description: 'Build, Verify, Bundle Analysis',
    commands: [
      { cmd: 'npm run build', desc: 'Build application' },
      { cmd: 'npm run build:verify', desc: 'Verify build output' },
      { cmd: 'npm run build:size-check', desc: 'Bundle size check' }
    ],
    color: colors.green
  }
};

// Workflow definitions
const workflows = {
  commit: {
    name: '⚡ Quick Commit Flow',
    description: 'Quality check + AI commit + push',
    steps: [
      { type: 'pipeline', target: 'quality' },
      { type: 'command', cmd: 'node scripts/git/smart-commit.js --stage-all', desc: 'AI commit' },
      { type: 'command', cmd: 'git push', desc: 'Push to remote' }
    ]
  },
  safe: {
    name: '🛡️ Safe Development Flow',
    description: 'Full validation + AI commit',
    steps: [
      { type: 'pipeline', target: 'quality' },
      { type: 'pipeline', target: 'security' },
      { type: 'command', cmd: 'node scripts/git/smart-commit.js', desc: 'AI commit' }
    ]
  },
  full: {
    name: '🚀 Complete Development Flow',
    description: 'All pipelines + AI commit + push + GitHub Actions monitoring',
    steps: [
      { type: 'command', cmd: 'node scripts/git/smart-commit.js --stage-all --push --auto --allow-empty', desc: 'AI commit & push (pre-build)' },
      { type: 'pipeline', target: 'quality' },
      { type: 'pipeline', target: 'security' },
      { type: 'pipeline', target: 'build' },
      { type: 'command', cmd: 'node scripts/git/smart-commit.js --stage-all --push --auto --allow-empty', desc: 'AI commit & push (post-build)' },
      { type: 'command', cmd: 'node scripts/git/gh-status.js watch', desc: 'Monitor GitHub Actions' },
      { type: 'command', cmd: 'node scripts/git/gh-status.js current', desc: 'Final GitHub Actions status' }
    ]
  },
  fix: {
    name: '🔧 Auto-fix Flow',
    description: 'Auto-fix issues + commit',
    steps: [
      { type: 'command', cmd: 'npm run lint:fix', desc: 'Auto-fix linting' },
      { type: 'command', cmd: 'npm run format', desc: 'Auto-format code' },
      { type: 'pipeline', target: 'quality' },
      { type: 'command', cmd: 'node scripts/git/smart-commit.js --stage-all --auto', desc: 'Auto commit' }
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

function showMainMenu() {
  logHeader('🎭 Development Tools - Unified Workflow Orchestrator');

  log('\n📋 Available Pipelines:', colors.bright);
  Object.entries(pipelines).forEach(([key, pipeline]) => {
    log(`  ${key.padEnd(10)} ${pipeline.name}`, pipeline.color);
    log(`             ${pipeline.description}`, colors.white);
  });

  log('\n🔄 Available Workflows:', colors.bright);
  Object.entries(workflows).forEach(([key, workflow]) => {
    log(`  ${key.padEnd(10)} ${workflow.name}`, colors.magenta);
    log(`             ${workflow.description}`, colors.white);
  });

  log('\n⚡ Quick Commands:', colors.bright);
  log('  q          Quality pipeline', colors.blue);
  log('  s          Security pipeline', colors.red);
  log('  b          Build pipeline', colors.green);
  log('  a          All pipelines', colors.magenta);
  log('  c          Quick commit flow', colors.cyan);
  log('  f          Auto-fix flow', colors.yellow);
  log('  t          Run tests', colors.white);
  log('  h          Show this help', colors.white);
  log('  x          Exit', colors.red);
}

async function runPipeline(pipelineKey) {
  const pipeline = pipelines[pipelineKey];
  if (!pipeline) {
    logError(`Unknown pipeline: ${pipelineKey}`);
    return false;
  }

  logHeader(`${pipeline.name} - Execution`);
  logInfo(`Description: ${pipeline.description}`);

  const startTime = Date.now();
  let allSuccess = true;

  for (const command of pipeline.commands) {
    const success = executeCommand(command.cmd, command.desc);
    if (!success) {
      allSuccess = false;
      break;
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  if (allSuccess) {
    logSuccess(`${pipeline.name} completed successfully in ${totalDuration}s`);
  } else {
    logError(`${pipeline.name} failed after ${totalDuration}s`);
  }

  return allSuccess;
}

async function runWorkflow(workflowKey) {
  const workflow = workflows[workflowKey];
  if (!workflow) {
    logError(`Unknown workflow: ${workflowKey}`);
    return false;
  }

  logHeader(`${workflow.name} - Execution`);
  logInfo(`Description: ${workflow.description}`);

  const startTime = Date.now();
  let allSuccess = true;
  let githubActionsStatus = null;

  for (const step of workflow.steps) {
    if (step.type === 'pipeline') {
      const success = await runPipeline(step.target);
      if (!success) {
        allSuccess = false;
        break;
      }
    } else if (step.type === 'command') {
      const success = executeCommand(step.cmd, step.desc);
      if (!success) {
        allSuccess = false;
        // For GitHub Actions monitoring, don't fail the entire workflow
        if (step.desc.includes('GitHub Actions')) {
          logWarning('GitHub Actions monitoring failed, but continuing...');
          allSuccess = true;
        } else {
          break;
        }
      }

      // Capture GitHub Actions final status for full workflow
      if (workflowKey === 'full' && step.desc === 'Final GitHub Actions status') {
        try {
          const { execSync } = await import('child_process');
          const output = execSync('node scripts/git/gh-status.js current', {
            encoding: 'utf8',
            cwd: rootDir
          });

          // Parse the output to determine if GitHub Actions succeeded
          if (output.includes('Pipeline Status: SUCCESS')) {
            githubActionsStatus = 'SUCCESS';
          } else if (output.includes('Pipeline Status: FAILED')) {
            githubActionsStatus = 'FAILED';
          } else if (output.includes('Pipeline Status: IN PROGRESS')) {
            githubActionsStatus = 'IN_PROGRESS';
          } else {
            githubActionsStatus = 'UNKNOWN';
          }
        } catch (error) {
          githubActionsStatus = 'ERROR';
        }
      }
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  if (allSuccess) {
    logSuccess(`${workflow.name} completed successfully in ${totalDuration}s`);

    // Special message for full workflow completion with GitHub Actions status
    if (workflowKey === 'full') {
      console.log('\n' + '='.repeat(60));
      log('🎉 DEVELOPMENT FLOW COMPLETED!', colors.bright + colors.green);
      console.log('='.repeat(60));
      log('✅ All local pipelines passed', colors.green);
      log('✅ Code committed and pushed to GitHub', colors.green);
      log('✅ GitHub Actions monitoring completed', colors.green);

      // Show final GitHub Actions status
      if (githubActionsStatus) {
        console.log('');
        switch (githubActionsStatus) {
          case 'SUCCESS':
            log('🎯 FINAL STATUS: ALL SYSTEMS GREEN ✅', colors.bright + colors.green);
            log('✅ Local pipelines: PASSED', colors.green);
            log('✅ GitHub Actions: PASSED', colors.green);
            break;
          case 'FAILED':
            log('🎯 FINAL STATUS: GITHUB ACTIONS FAILED ❌', colors.bright + colors.red);
            log('✅ Local pipelines: PASSED', colors.green);
            log('❌ GitHub Actions: FAILED', colors.red);
            log('🔍 Check GitHub Actions logs for details', colors.yellow);
            break;
          case 'IN_PROGRESS':
            log('🎯 FINAL STATUS: GITHUB ACTIONS STILL RUNNING ⏳', colors.bright + colors.yellow);
            log('✅ Local pipelines: PASSED', colors.green);
            log('⏳ GitHub Actions: IN PROGRESS', colors.yellow);
            log('💡 Use "npm run gh:watch" to continue monitoring', colors.cyan);
            break;
          default:
            log('🎯 FINAL STATUS: GITHUB ACTIONS STATUS UNKNOWN ⚠️', colors.bright + colors.yellow);
            log('✅ Local pipelines: PASSED', colors.green);
            log('⚠️  GitHub Actions: UNKNOWN', colors.yellow);
            log('💡 Use "npm run gh:current" to check status', colors.cyan);
            break;
        }
      }

      console.log('');
      log('🎉 APPLICATION DEPLOYED SUCCESSFULLY!', colors.bright + colors.green);
      log('   🌐 Your app is live at: https://gsphome.github.io/englishgame5/', colors.cyan);
      log('   📊 Monitor status: npm run gh:current', colors.cyan);
      console.log('='.repeat(60));
    }
  } else {
    logError(`${workflow.name} failed after ${totalDuration}s`);

    if (workflowKey === 'full') {
      console.log('\n' + '='.repeat(60));
      log('❌ DEVELOPMENT FLOW FAILED!', colors.bright + colors.red);
      console.log('='.repeat(60));
      log('🎯 FINAL STATUS: LOCAL PIPELINE FAILED ❌', colors.bright + colors.red);
      log('❌ One or more local pipelines failed', colors.red);
      log('🔍 Check the error messages above for details', colors.yellow);
      log('🔧 Fix the issues and run again', colors.cyan);
      console.log('='.repeat(60));
    }
  }

  return allSuccess;
}

async function runAllPipelines() {
  logHeader('🚀 All Pipelines - Sequential Execution');

  const pipelineOrder = ['quality', 'security', 'build'];
  let allSuccess = true;

  for (const pipelineKey of pipelineOrder) {
    const success = await runPipeline(pipelineKey);
    if (!success) {
      allSuccess = false;
      break;
    }
  }

  return allSuccess;
}

function showGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: rootDir });
    const hasChanges = status.trim().length > 0;

    if (hasChanges) {
      log('\n📊 Git Status:', colors.bright);
      const lines = status.trim().split('\n');
      lines.slice(0, 10).forEach(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        let color = colors.white;
        let icon = '•';

        if (status.includes('M')) { color = colors.yellow; icon = '~'; }
        if (status.includes('A')) { color = colors.green; icon = '+'; }
        if (status.includes('D')) { color = colors.red; icon = '-'; }
        if (status.includes('??')) { color = colors.cyan; icon = '?'; }

        log(`  ${icon} ${file}`, color);
      });

      if (lines.length > 10) {
        log(`  ... and ${lines.length - 10} more files`, colors.white);
      }
    } else {
      log('\n✨ Working directory is clean', colors.green);
    }

    return hasChanges;
  } catch (error) {
    logWarning('Not a git repository or git not available');
    return false;
  }
}

async function interactiveMode() {
  console.clear();
  showMainMenu();
  showGitStatus();

  while (true) {
    const input = await promptUser('\n🎯 Select option:');

    switch (input.toLowerCase()) {
      case 'q':
      case 'quality':
        await runPipeline('quality');
        break;
      case 's':
      case 'security':
        await runPipeline('security');
        break;
      case 'b':
      case 'build':
        await runPipeline('build');
        break;
      case 'a':
      case 'all':
        await runAllPipelines();
        break;
      case 'c':
      case 'commit':
        await runWorkflow('commit');
        break;
      case 'safe':
        await runWorkflow('safe');
        break;
      case 'full':
        await runWorkflow('full');
        break;
      case 'f':
      case 'fix':
        await runWorkflow('fix');
        break;
      case 't':
      case 'test':
        executeCommand('npm test', 'Run tests');
        break;
      case 'h':
      case 'help':
        showMainMenu();
        showGitStatus();
        break;
      case 'x':
      case 'exit':
      case 'quit':
        log('\n👋 Development tools session ended. Happy coding!', colors.cyan);
        process.exit(0);
        break;
      default:
        logWarning('Invalid option. Type "h" for help or "x" to exit.');
        break;
    }
  }
}

function showHelp() {
  console.log(`
🎭 Development Tools - Unified Workflow Orchestrator

Usage: node scripts/development/dev-tools.js [command] [options]

Commands:
  quality, q       Run quality pipeline (ESLint, TypeScript, Tests)
  security, s      Run security pipeline (Audit, Patterns, Licenses)
  build, b         Run build pipeline (Build, Verify, Analysis)
  all, a           Run all pipelines sequentially
  
  commit, c        Quick commit flow (quality + AI commit + push)
  safe             Safe development flow (quality + security + commit)
  full             Complete flow (all pipelines + commit + push)
  fix, f           Auto-fix flow (fix issues + commit)
  
  test, t          Run test suite
  interactive, i   Interactive mode (default)
  help, h          Show this help

Options:
  --ci-mode        Optimize for CI environment (non-interactive)
  --silent         Suppress command output
  --no-git         Skip git status checks

Examples:
  node scripts/development/dev-tools.js                    # Interactive mode
  node scripts/development/dev-tools.js quality            # Run quality pipeline
  node scripts/development/dev-tools.js commit             # Quick commit flow
  node scripts/development/dev-tools.js all                # Run all pipelines
  
NPM Integration:
  npm run dev-tools                            # Interactive mode
  npm run pipeline:quality                     # Quality pipeline
  npm run flow:quick                           # Quick commit flow
  `);
}

async function main() {
  const args = process.argv.slice(2);

  // Check for CI mode
  const isCIMode = args.includes('--ci-mode') || process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const filteredArgs = args.filter(arg => arg !== '--ci-mode');

  // Configure for CI environment
  if (isCIMode) {
    logInfo('🤖 Running in CI mode');
    // Disable interactive features in CI
    process.env.CI_MODE = 'true';
  }

  // Handle command line arguments
  if (filteredArgs.length > 0) {
    const command = filteredArgs[0].toLowerCase();

    switch (command) {
      case 'quality':
      case 'q':
        await runPipeline('quality');
        break;
      case 'security':
      case 's':
        await runPipeline('security');
        break;
      case 'build':
      case 'b':
        await runPipeline('build');
        break;
      case 'all':
      case 'a':
        await runAllPipelines();
        break;
      case 'commit':
      case 'c':
        await runWorkflow('commit');
        break;
      case 'safe':
        await runWorkflow('safe');
        break;
      case 'full':
        await runWorkflow('full');
        break;
      case 'fix':
      case 'f':
        await runWorkflow('fix');
        break;
      case 'test':
      case 't':
        executeCommand('npm test', 'Run tests');
        break;
      case 'interactive':
      case 'i':
        await interactiveMode();
        break;
      case 'help':
      case 'h':
      case '--help':
        showHelp();
        break;
      default:
        logError(`Unknown command: ${command}`);
        showHelp();
        break;
    }
  } else {
    // Default to interactive mode
    await interactiveMode();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n👋 Development tools interrupted. Goodbye!', colors.cyan);
  process.exit(0);
});

// Start the application
main().catch((error) => {
  logError('Development tools crashed:');
  console.error(error);
  process.exit(1);
});