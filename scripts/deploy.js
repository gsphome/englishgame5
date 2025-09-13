#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

/**
 * Deploy Script - Manual deployment trigger
 * Triggers the GitHub Actions Deploy Pipeline with current commit info
 */

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

function execCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    }).trim();
  } catch (error) {
    if (!options.silent) {
      log(`❌ Command failed: ${command}`, 'red');
      log(`Error: ${error.message}`, 'red');
    }
    throw error;
  }
}

function getCurrentCommitInfo() {
  try {
    const commitSha = execCommand('git rev-parse HEAD', { silent: true });
    const shortSha = commitSha.substring(0, 8);
    const branch = execCommand('git branch --show-current', { silent: true });
    const commitMessage = execCommand('git log -1 --pretty=format:"%s"', { silent: true });
    
    return {
      sha: commitSha,
      shortSha,
      branch,
      message: commitMessage
    };
  } catch (error) {
    throw new Error('Failed to get git information. Make sure you are in a git repository.');
  }
}

function checkGitHubCLI() {
  try {
    execCommand('gh --version', { silent: true });
    return true;
  } catch (error) {
    return false;
  }
}

function getLatestPipelineStatus(commitSha) {
  try {
    log('🔍 Checking latest pipeline status...', 'cyan');
    
    // Get workflow runs for this commit
    const qualityStatus = execCommand(
      `gh api repos/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/actions/runs --jq ".workflow_runs[] | select(.head_sha == \\"${commitSha}\\" and .name == \\"Quality Checks\\") | .conclusion" | head -1`,
      { silent: true }
    );
    
    const securityStatus = execCommand(
      `gh api repos/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/actions/runs --jq ".workflow_runs[] | select(.head_sha == \\"${commitSha}\\" and .name == \\"Security Checks\\") | .conclusion" | head -1`,
      { silent: true }
    );
    
    const buildStatus = execCommand(
      `gh api repos/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/actions/runs --jq ".workflow_runs[] | select(.head_sha == \\"${commitSha}\\" and .name == \\"Build Pipeline\\") | .conclusion" | head -1`,
      { silent: true }
    );

    return {
      quality: qualityStatus || 'unknown',
      security: securityStatus || 'unknown',
      build: buildStatus || 'unknown'
    };
  } catch (error) {
    log('⚠️  Could not fetch pipeline status from GitHub', 'yellow');
    return {
      quality: 'unknown',
      security: 'unknown',
      build: 'unknown'
    };
  }
}

function validatePipelineStatus(status) {
  const { quality, security, build } = status;
  
  log('\n📊 Pipeline Status Check:', 'bright');
  log(`  Quality:  ${quality === 'success' ? '✅' : '❌'} ${quality}`, quality === 'success' ? 'green' : 'red');
  log(`  Security: ${security === 'success' ? '✅' : '❌'} ${security}`, security === 'success' ? 'green' : 'red');
  log(`  Build:    ${build === 'success' ? '✅' : '❌'} ${build}`, build === 'success' ? 'green' : 'red');
  
  const allPassed = quality === 'success' && security === 'success' && build === 'success';
  
  if (!allPassed) {
    log('\n⚠️  Warning: Not all pipelines have passed successfully', 'yellow');
    log('   Recommended: Wait for all pipelines to pass before deploying', 'yellow');
    
    // Ask user if they want to continue
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      readline.question('\nDo you want to continue with deployment anyway? (y/N): ', (answer) => {
        readline.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }
  
  return Promise.resolve(true);
}

async function triggerDeploy(commitInfo, pipelineStatus) {
  const { sha, shortSha } = commitInfo;
  const { quality, security, build } = pipelineStatus;
  
  log('\n🚀 Triggering deployment...', 'cyan');
  
  const artifactName = `build-files-${sha}`;
  
  try {
    const result = execCommand(`gh workflow run deploy.yml --field artifact-name="${artifactName}" --field quality-status="${quality}" --field security-status="${security}" --field build-status="${build}"`, { silent: true });
    
    log('✅ Deployment workflow triggered successfully!', 'green');
    log(`   Artifact: ${artifactName}`, 'cyan');
    log(`   Commit: ${shortSha}`, 'cyan');
    
    // Wait a moment and show the workflow URL
    setTimeout(() => {
      log('\n📋 You can monitor the deployment at:', 'bright');
      try {
        const repoUrl = execCommand('gh repo view --json url --jq .url', { silent: true });
        log(`   ${repoUrl}/actions/workflows/deploy.yml`, 'blue');
      } catch (error) {
        log('   Check your GitHub Actions tab', 'blue');
      }
    }, 2000);
    
  } catch (error) {
    log('❌ Failed to trigger deployment workflow', 'red');
    log('   Make sure you have the GitHub CLI installed and authenticated', 'yellow');
    log('   Run: gh auth login', 'yellow');
    throw error;
  }
}

async function main() {
  try {
    log('🚀 Manual Deployment Trigger', 'bright');
    log('================================\n', 'bright');
    
    // Check prerequisites
    if (!checkGitHubCLI()) {
      log('❌ GitHub CLI (gh) is not installed or not in PATH', 'red');
      log('   Install it from: https://cli.github.com/', 'yellow');
      process.exit(1);
    }
    
    // Get current commit info
    const commitInfo = getCurrentCommitInfo();
    log(`📍 Current commit: ${commitInfo.shortSha} (${commitInfo.branch})`, 'cyan');
    log(`📝 Message: ${commitInfo.message}`, 'cyan');
    
    // Get pipeline status
    const pipelineStatus = getLatestPipelineStatus(commitInfo.sha);
    
    // Validate pipeline status
    const shouldContinue = await validatePipelineStatus(pipelineStatus);
    
    if (!shouldContinue) {
      log('\n🛑 Deployment cancelled by user', 'yellow');
      process.exit(0);
    }
    
    // Trigger deployment
    await triggerDeploy(commitInfo, pipelineStatus);
    
    log('\n🎉 Deployment process initiated!', 'green');
    log('   Monitor the progress in GitHub Actions', 'cyan');
    
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('🚀 Manual Deployment Trigger', 'bright');
  log('============================\n', 'bright');
  log('Usage: npm run deploy:manual [options]', 'cyan');
  log('\nOptions:', 'bright');
  log('  --help, -h    Show this help message', 'cyan');
  log('\nDescription:', 'bright');
  log('  Triggers the GitHub Actions Deploy Pipeline manually', 'cyan');
  log('  Checks current pipeline status and prompts for confirmation', 'cyan');
  log('  if not all quality gates have passed.', 'cyan');
  log('\nPrerequisites:', 'bright');
  log('  - GitHub CLI (gh) installed and authenticated', 'cyan');
  log('  - Current directory must be a git repository', 'cyan');
  log('  - Repository must have the Deploy Pipeline workflow', 'cyan');
  process.exit(0);
}

// Run the main function
main().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});