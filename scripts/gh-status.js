#!/usr/bin/env node

/**
 * GitHub Actions Status Checker
 * Validates the status of GitHub Actions workflows and provides detailed reporting
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import shared utilities
import { logInfo, logSuccess, logError, logWarning, logHeader, colors } from './utils/logger.js';
import { getCurrentBranch, getRemoteUrl, getLatestCommit } from './utils/git-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');

/**
 * Check if GitHub CLI is installed and authenticated
 */
function checkGitHubCLI() {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    execSync('gh auth status', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get workflow runs for the current repository
 */
function getWorkflowRuns(limit = 10) {
  try {
    const output = execSync(`gh run list --limit ${limit} --json status,conclusion,workflowName,createdAt,headBranch,headSha,url,displayTitle`, {
      encoding: 'utf8',
      cwd: rootDir
    });
    return JSON.parse(output);
  } catch (error) {
    logError('Failed to fetch workflow runs');
    return [];
  }
}

/**
 * Get specific workflow run details
 */
function getWorkflowRunDetails(runId) {
  try {
    const output = execSync(`gh run view ${runId} --json jobs,status,conclusion,workflowName,createdAt,headBranch,headSha,url,displayTitle`, {
      encoding: 'utf8',
      cwd: rootDir
    });
    return JSON.parse(output);
  } catch (error) {
    logError(`Failed to fetch details for run ${runId}`);
    return null;
  }
}

/**
 * Get workflow files from .github/workflows
 */
function getWorkflowFiles() {
  const workflowsDir = path.join(rootDir, '.github', 'workflows');
  if (!fs.existsSync(workflowsDir)) {
    return [];
  }
  
  return fs.readdirSync(workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map(file => path.join(workflowsDir, file));
}

/**
 * Parse workflow file to extract basic info
 */
function parseWorkflowFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    const onMatch = content.match(/^on:\s*(.+)$/m);
    
    return {
      file: path.basename(filePath),
      name: nameMatch ? nameMatch[1].replace(/['"]/g, '') : path.basename(filePath, path.extname(filePath)),
      path: filePath,
      triggers: onMatch ? onMatch[1] : 'unknown'
    };
  } catch (error) {
    return {
      file: path.basename(filePath),
      name: path.basename(filePath, path.extname(filePath)),
      path: filePath,
      triggers: 'unknown'
    };
  }
}

/**
 * Format status with colors
 */
function formatStatus(status, conclusion) {
  if (status === 'completed') {
    switch (conclusion) {
      case 'success':
        return `${colors.green}✅ Success${colors.reset}`;
      case 'failure':
        return `${colors.red}❌ Failed${colors.reset}`;
      case 'cancelled':
        return `${colors.yellow}⏹️  Cancelled${colors.reset}`;
      case 'skipped':
        return `${colors.cyan}⏭️  Skipped${colors.reset}`;
      default:
        return `${colors.white}${conclusion}${colors.reset}`;
    }
  } else {
    switch (status) {
      case 'in_progress':
        return `${colors.blue}🔄 Running${colors.reset}`;
      case 'queued':
        return `${colors.yellow}⏳ Queued${colors.reset}`;
      case 'requested':
        return `${colors.cyan}📋 Requested${colors.reset}`;
      default:
        return `${colors.white}${status}${colors.reset}`;
    }
  }
}

/**
 * Format duration
 */
function formatDuration(startTime, endTime) {
  if (!startTime) return 'N/A';
  
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const duration = Math.round((end - start) / 1000);
  
  if (duration < 60) return `${duration}s`;
  if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
  return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
}

/**
 * Show workflow status summary
 */
function showWorkflowStatus() {
  logHeader('🔍 GitHub Actions Status Check');
  
  // Check GitHub CLI
  if (!checkGitHubCLI()) {
    logError('GitHub CLI (gh) is not installed or not authenticated');
    logInfo('Install: https://cli.github.com/');
    logInfo('Authenticate: gh auth login');
    return false;
  }
  
  // Get current repository info
  const currentBranch = getCurrentBranch();
  const remoteUrl = getRemoteUrl();
  const latestCommit = getLatestCommit();
  
  logInfo(`Repository: ${remoteUrl}`);
  logInfo(`Branch: ${currentBranch}`);
  logInfo(`Latest commit: ${latestCommit.slice(0, 8)}`);
  
  // Get workflow files
  const workflowFiles = getWorkflowFiles();
  if (workflowFiles.length === 0) {
    logWarning('No workflow files found in .github/workflows/');
    return false;
  }
  
  logInfo(`\n📋 Configured Workflows (${workflowFiles.length}):`);
  workflowFiles.forEach(file => {
    const workflow = parseWorkflowFile(file);
    logInfo(`  • ${workflow.name} (${workflow.file})`);
  });
  
  // Get recent workflow runs
  const runs = getWorkflowRuns(15);
  if (runs.length === 0) {
    logWarning('\n⚠️  No workflow runs found');
    return true;
  }
  
  // Group runs by workflow
  const runsByWorkflow = {};
  runs.forEach(run => {
    if (!runsByWorkflow[run.workflowName]) {
      runsByWorkflow[run.workflowName] = [];
    }
    runsByWorkflow[run.workflowName].push(run);
  });
  
  logInfo(`\n🔄 Recent Workflow Runs:`);
  
  Object.entries(runsByWorkflow).forEach(([workflowName, workflowRuns]) => {
    logInfo(`\n  📊 ${workflowName}:`);
    
    workflowRuns.slice(0, 5).forEach((run, index) => {
      const status = formatStatus(run.status, run.conclusion);
      const time = new Date(run.createdAt).toLocaleString();
      const branch = run.headBranch === currentBranch ? 
        `${colors.green}${run.headBranch}${colors.reset}` : 
        run.headBranch;
      
      logInfo(`    ${index + 1}. ${status} - ${branch} - ${time}`);
      if (run.displayTitle && run.displayTitle !== run.headSha) {
        logInfo(`       "${run.displayTitle}"`);
      }
    });
  });
  
  return true;
}

/**
 * Show detailed status for current branch/commit
 */
function showCurrentStatus() {
  logHeader('🎯 Current Commit Status');
  
  if (!checkGitHubCLI()) {
    logError('GitHub CLI (gh) is not installed or not authenticated');
    return false;
  }
  
  const currentBranch = getCurrentBranch();
  const latestCommit = getLatestCommit();
  
  // Get runs for current commit
  const runs = getWorkflowRuns(50);
  const currentRuns = runs.filter(run => 
    run.headSha === latestCommit || run.headBranch === currentBranch
  );
  
  if (currentRuns.length === 0) {
    logWarning(`No workflow runs found for current commit (${latestCommit.slice(0, 8)}) on branch ${currentBranch}`);
    return true;
  }
  
  logInfo(`Commit: ${latestCommit.slice(0, 8)}`);
  logInfo(`Branch: ${currentBranch}`);
  logInfo(`Found ${currentRuns.length} workflow run(s):\n`);
  
  currentRuns.forEach((run, index) => {
    const status = formatStatus(run.status, run.conclusion);
    const time = new Date(run.createdAt).toLocaleString();
    
    logInfo(`${index + 1}. ${run.workflowName}`);
    logInfo(`   Status: ${status}`);
    logInfo(`   Started: ${time}`);
    logInfo(`   URL: ${run.url}`);
    
    if (run.displayTitle) {
      logInfo(`   Title: "${run.displayTitle}"`);
    }
    
    logInfo('');
  });
  
  // Summary
  const successful = currentRuns.filter(r => r.conclusion === 'success').length;
  const failed = currentRuns.filter(r => r.conclusion === 'failure').length;
  const running = currentRuns.filter(r => r.status === 'in_progress').length;
  const pending = currentRuns.filter(r => r.status === 'queued' || r.status === 'requested').length;
  
  logInfo('📊 Summary:');
  if (successful > 0) logSuccess(`  ✅ ${successful} successful`);
  if (failed > 0) logError(`  ❌ ${failed} failed`);
  if (running > 0) logInfo(`  🔄 ${running} running`);
  if (pending > 0) logInfo(`  ⏳ ${pending} pending`);
  
  return failed === 0;
}

/**
 * Watch workflow status (polling)
 */
function watchStatus(interval = 30) {
  logHeader(`👀 Watching GitHub Actions Status (${interval}s intervals)`);
  logInfo('Press Ctrl+C to stop watching\n');
  
  let iteration = 0;
  
  const watch = () => {
    iteration++;
    logInfo(`\n${'='.repeat(60)}`);
    logInfo(`📊 Status Check #${iteration} - ${new Date().toLocaleString()}`);
    logInfo('='.repeat(60));
    
    showCurrentStatus();
    
    setTimeout(watch, interval * 1000);
  };
  
  // Initial check
  showCurrentStatus();
  
  // Start watching
  setTimeout(watch, interval * 1000);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  
  switch (command) {
    case 'status':
    case 's':
      showWorkflowStatus();
      break;
      
    case 'current':
    case 'c':
      showCurrentStatus();
      break;
      
    case 'watch':
    case 'w':
      const interval = parseInt(args[1]) || 30;
      watchStatus(interval);
      break;
      
    case 'help':
    case 'h':
      logHeader('🔍 GitHub Actions Status Checker');
      logInfo('\nUsage: node scripts/gh-status.js [command] [options]\n');
      logInfo('Commands:');
      logInfo('  status, s     Show overview of all workflows and recent runs');
      logInfo('  current, c    Show status for current commit/branch');
      logInfo('  watch, w [n]  Watch status with n second intervals (default: 30)');
      logInfo('  help, h       Show this help message\n');
      logInfo('Examples:');
      logInfo('  npm run gh:status         # Show workflow overview');
      logInfo('  npm run gh:current        # Show current commit status');
      logInfo('  npm run gh:watch          # Watch status every 30s');
      logInfo('  npm run gh:watch 10       # Watch status every 10s');
      break;
      
    default:
      logError(`Unknown command: ${command}`);
      logInfo('Use "help" to see available commands');
      process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  logInfo('\n\n👋 Stopping GitHub Actions status checker...');
  process.exit(0);
});

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  checkGitHubCLI,
  getWorkflowRuns,
  showWorkflowStatus,
  showCurrentStatus,
  watchStatus
};