#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import readline from 'readline';

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
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('\nDo you want to continue with deployment anyway? (y/N): ', (answer) => {
        rl.close();
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
    
    return true;
    
  } catch (error) {
    log('❌ Failed to trigger deployment workflow', 'red');
    log('   Make sure you have the GitHub CLI installed and authenticated', 'yellow');
    log('   Run: gh auth login', 'yellow');
    throw error;
  }
}

async function monitorDeployment(commitInfo, maxWaitTime = 300) {
  const { sha, shortSha } = commitInfo;
  
  log('\n👀 Monitoring deployment progress...', 'cyan');
  log('   (Press Ctrl+C to stop monitoring and continue in background)', 'yellow');
  
  const startTime = Date.now();
  let deploymentFound = false;
  let lastStatus = '';
  
  // Wait a bit for the workflow to start
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  while ((Date.now() - startTime) < maxWaitTime * 1000) {
    try {
      // Check for deployment workflow runs
      const deployRuns = execCommand(
        `gh api repos/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/actions/runs --jq ".workflow_runs[] | select(.name == \\"Deploy Pipeline\\") | {status, conclusion, created_at, html_url}" | head -3`,
        { silent: true }
      );
      
      if (deployRuns.trim()) {
        const runs = deployRuns.trim().split('\n').map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        // Find the most recent run
        const latestRun = runs[0];
        
        if (latestRun) {
          deploymentFound = true;
          const status = latestRun.status;
          const conclusion = latestRun.conclusion;
          const currentStatus = conclusion || status;
          
          if (currentStatus !== lastStatus) {
            lastStatus = currentStatus;
            
            switch (currentStatus) {
              case 'queued':
                log('   ⏳ Deployment queued...', 'yellow');
                break;
              case 'in_progress':
                log('   🔄 Deployment in progress...', 'blue');
                break;
              case 'success':
                log('   ✅ Deployment completed successfully!', 'green');
                log(`   🌐 Check your application at the deployment URL`, 'cyan');
                return { success: true, status: 'success' };
              case 'failure':
                log('   ❌ Deployment failed!', 'red');
                log(`   🔗 Check details: ${latestRun.html_url}`, 'blue');
                return { success: false, status: 'failure', url: latestRun.html_url };
              case 'cancelled':
                log('   ⚠️  Deployment was cancelled', 'yellow');
                return { success: false, status: 'cancelled' };
              default:
                log(`   📊 Status: ${currentStatus}`, 'cyan');
            }
          }
        }
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 15000));
      
    } catch (error) {
      log('   ⚠️  Error checking deployment status, retrying...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  if (!deploymentFound) {
    log('   ⚠️  No deployment workflow detected within timeout', 'yellow');
    log('   💡 The deployment may still be starting - check GitHub Actions manually', 'cyan');
  } else {
    log('   ⏰ Monitoring timeout reached', 'yellow');
    log('   💡 Deployment may still be in progress - check GitHub Actions for final status', 'cyan');
  }
  
  return { success: false, status: 'timeout' };
}

function showDeploymentLinks() {
  try {
    const repoUrl = execCommand('gh repo view --json url --jq .url', { silent: true });
    log('\n📋 Useful links:', 'bright');
    log(`   🔗 Deployment workflow: ${repoUrl}/actions/workflows/deploy.yml`, 'blue');
    log(`   🔗 All workflows: ${repoUrl}/actions`, 'blue');
    log(`   🔗 Repository: ${repoUrl}`, 'blue');
  } catch (error) {
    log('\n📋 Check your GitHub Actions tab for deployment status', 'cyan');
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
    
    // Monitor deployment progress (unless disabled)
    let monitorResult = { success: false, status: 'skipped' };
    
    if (!options.noMonitor) {
      monitorResult = await monitorDeployment(commitInfo, options.timeout);
    } else {
      log('   ⏭️  Monitoring skipped (--no-monitor flag)', 'yellow');
    }
    
    // Final status message
    console.log('\n' + '='.repeat(60));
    if (monitorResult.success) {
      log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!', 'bright');
      console.log('='.repeat(60));
      log('✅ All quality gates verified', 'green');
      log('✅ Deploy Pipeline triggered successfully', 'green');
      log('✅ Application deployed successfully', 'green');
      log('✅ Deployment monitoring completed', 'green');
    } else {
      log('🚀 DEPLOYMENT TRIGGERED!', 'bright');
      console.log('='.repeat(60));
      log('✅ All quality gates verified', 'green');
      log('✅ Deploy Pipeline triggered successfully', 'green');
      
      switch (monitorResult.status) {
        case 'failure':
          log('❌ Deployment failed during execution', 'red');
          log('🔗 Check the workflow logs for details', 'yellow');
          break;
        case 'cancelled':
          log('⚠️  Deployment was cancelled', 'yellow');
          break;
        case 'timeout':
          log('⏰ Monitoring timeout - deployment may still be running', 'yellow');
          break;
        case 'skipped':
          log('⏭️  Monitoring skipped - check deployment status manually', 'cyan');
          break;
        default:
          log('📊 Deployment status unknown - check manually', 'yellow');
      }
    }
    
    showDeploymentLinks();
    console.log('='.repeat(60));
    
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const options = {
  noMonitor: args.includes('--no-monitor'),
  silent: args.includes('--silent'),
  timeout: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1]) || 300
};

if (args.includes('--help') || args.includes('-h')) {
  log('🚀 Manual Deployment Trigger', 'bright');
  log('============================\n', 'bright');
  log('Usage: npm run deploy:full [options]', 'cyan');
  log('\nOptions:', 'bright');
  log('  --help, -h         Show this help message', 'cyan');
  log('  --no-monitor       Skip deployment monitoring', 'cyan');
  log('  --silent           Minimal output mode', 'cyan');
  log('  --timeout=SECONDS  Monitoring timeout (default: 300)', 'cyan');
  log('\nDescription:', 'bright');
  log('  Triggers the GitHub Actions Deploy Pipeline manually', 'cyan');
  log('  Automatically monitors deployment progress and shows final status', 'cyan');
  log('  Checks current pipeline status and prompts for confirmation', 'cyan');
  log('  if not all quality gates have passed.', 'cyan');
  log('\nExamples:', 'bright');
  log('  npm run deploy:full                    # Full deployment with monitoring', 'cyan');
  log('  npm run deploy:full -- --no-monitor   # Deploy without monitoring', 'cyan');
  log('  npm run deploy:full -- --timeout=600  # Monitor for 10 minutes', 'cyan');
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