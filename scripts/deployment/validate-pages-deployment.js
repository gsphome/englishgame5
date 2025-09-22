#!/usr/bin/env node

/**
 * GitHub Pages Deployment Validator
 * 
 * Validates the latest deployment status from GitHub Pages API
 * Usage: node scripts/deployment/validate-pages-deployment.js [options]
 */

import { execSync } from 'child_process';

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

// Repository configuration
const REPO_OWNER = 'gsphome';
const REPO_NAME = 'englishgame5';
const PAGES_URL = `https://${REPO_OWNER}.github.io/${REPO_NAME}/`;

/**
 * Get current commit hash
 */
function getCurrentCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    logError('Failed to get current commit hash');
    return null;
  }
}

/**
 * Get current branch
 */
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    logError('Failed to get current branch');
    return null;
  }
}

/**
 * Fetch GitHub Pages deployment status
 */
async function fetchPagesDeployment() {
  try {
    logInfo('Fetching GitHub Pages deployment status...');
    
    // Use curl to fetch GitHub API
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pages`;
    const curlCommand = `curl -s -H "Accept: application/vnd.github.v3+json" "${apiUrl}"`;
    
    const response = execSync(curlCommand, { encoding: 'utf8' });
    const pagesInfo = JSON.parse(response);
    
    if (pagesInfo.message && pagesInfo.message === 'Not Found') {
      logWarning('GitHub Pages API not accessible (may be private repo or Pages not configured via API)');
      return null;
    } else if (pagesInfo.message) {
      throw new Error(pagesInfo.message);
    }
    
    return pagesInfo;
  } catch (error) {
    logWarning(`Pages API not available: ${error.message}`);
    return null;
  }
}

/**
 * Fetch latest deployment from deployments API
 */
async function fetchLatestDeployment() {
  try {
    logInfo('Fetching latest deployment information...');
    
    // Try both production and github-pages environments
    const environments = ['production', 'github-pages'];
    let latestDeployment = null;
    let deploymentStatus = null;
    
    for (const env of environments) {
      const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/deployments?environment=${env}&per_page=1`;
      const curlCommand = `curl -s -H "Accept: application/vnd.github.v3+json" "${apiUrl}"`;
      
      const response = execSync(curlCommand, { encoding: 'utf8' });
      const deployments = JSON.parse(response);
      
      if (Array.isArray(deployments) && deployments.length > 0) {
        const deployment = deployments[0];
        
        // Use the most recent deployment across all environments
        if (!latestDeployment || new Date(deployment.created_at) > new Date(latestDeployment.created_at)) {
          latestDeployment = deployment;
          
          // Fetch deployment status
          const statusUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/deployments/${deployment.id}/statuses`;
          const statusCommand = `curl -s -H "Accept: application/vnd.github.v3+json" "${statusUrl}"`;
          
          const statusResponse = execSync(statusCommand, { encoding: 'utf8' });
          const statuses = JSON.parse(statusResponse);
          
          deploymentStatus = Array.isArray(statuses) && statuses.length > 0 ? statuses[0] : null;
        }
      }
    }
    
    if (!latestDeployment) {
      return null;
    }
    
    return {
      deployment: latestDeployment,
      status: deploymentStatus
    };
  } catch (error) {
    logError(`Failed to fetch deployment: ${error.message}`);
    return null;
  }
}

/**
 * Test if the deployed site is accessible
 */
async function testSiteAccessibility() {
  try {
    logInfo(`Testing site accessibility: ${PAGES_URL}`);
    
    const curlCommand = `curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${PAGES_URL}"`;
    const httpCode = execSync(curlCommand, { encoding: 'utf8' }).trim();
    
    return {
      accessible: httpCode === '200',
      httpCode: httpCode
    };
  } catch (error) {
    logError(`Failed to test site accessibility: ${error.message}`);
    return {
      accessible: false,
      httpCode: 'ERROR'
    };
  }
}

/**
 * Get deployment timestamp in readable format
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  let timeAgo = '';
  if (diffDays > 0) {
    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = 'Just now';
  }
  
  return `${date.toLocaleString()} (${timeAgo})`;
}

/**
 * Main validation function
 */
async function validateDeployment() {
  logHeader('🚀 GitHub Pages Deployment Validator');
  
  const currentCommit = getCurrentCommit();
  const currentBranch = getCurrentBranch();
  
  if (currentCommit) {
    logInfo(`Current commit: ${currentCommit.substring(0, 8)}`);
  }
  if (currentBranch) {
    logInfo(`Current branch: ${currentBranch}`);
  }
  
  // Fetch Pages configuration
  const pagesInfo = await fetchPagesDeployment();
  if (pagesInfo) {
    console.log('\n📋 GitHub Pages Configuration:');
    logInfo(`Source: ${pagesInfo.source?.branch || 'Unknown'} branch`);
    logInfo(`URL: ${pagesInfo.html_url || PAGES_URL}`);
    logInfo(`Status: ${pagesInfo.status || 'Unknown'}`);
    
    if (pagesInfo.cname) {
      logInfo(`Custom domain: ${pagesInfo.cname}`);
    }
  }
  
  // Fetch latest deployment
  const deploymentInfo = await fetchLatestDeployment();
  if (deploymentInfo) {
    const { deployment, status } = deploymentInfo;
    
    console.log('\n📦 Latest Deployment:');
    logInfo(`Deployment ID: ${deployment.id}`);
    logInfo(`SHA: ${deployment.sha?.substring(0, 8) || 'Unknown'}`);
    logInfo(`Environment: ${deployment.environment || 'Unknown'}`);
    logInfo(`Created: ${formatTimestamp(deployment.created_at)}`);
    
    if (status) {
      console.log('\n🔄 Deployment Status:');
      const statusColor = status.state === 'success' ? colors.green : 
                         status.state === 'failure' ? colors.red : 
                         status.state === 'pending' ? colors.yellow : colors.white;
      
      log(`Status: ${status.state}`, statusColor);
      logInfo(`Updated: ${formatTimestamp(status.created_at)}`);
      
      if (status.target_url) {
        logInfo(`Target URL: ${status.target_url}`);
      }
      
      if (status.description) {
        logInfo(`Description: ${status.description}`);
      }
    }
    
    // Check if current commit matches deployed commit
    if (currentCommit && deployment.sha) {
      const isCurrentDeployed = currentCommit.startsWith(deployment.sha) || deployment.sha.startsWith(currentCommit);
      
      console.log('\n🔍 Commit Comparison:');
      if (isCurrentDeployed) {
        logSuccess('Current commit is deployed');
      } else {
        logWarning('Current commit differs from deployed commit');
        logInfo(`Local:    ${currentCommit.substring(0, 8)}`);
        logInfo(`Deployed: ${deployment.sha.substring(0, 8)}`);
      }
    }
  }
  
  // Test site accessibility
  const accessibility = await testSiteAccessibility();
  
  console.log('\n🌐 Site Accessibility:');
  if (accessibility.accessible) {
    logSuccess(`Site is accessible (HTTP ${accessibility.httpCode})`);
    logSuccess(`URL: ${PAGES_URL}`);
  } else {
    logError(`Site is not accessible (HTTP ${accessibility.httpCode})`);
    logWarning(`URL: ${PAGES_URL}`);
  }
  
  // Final summary
  console.log('\n📊 Deployment Summary:');
  
  let overallStatus = 'UNKNOWN';
  let statusColor = colors.white;
  
  // Determine status based on available information
  if (accessibility.accessible) {
    if (deploymentInfo?.status?.state === 'success') {
      overallStatus = 'HEALTHY';
      statusColor = colors.green;
    } else if (deploymentInfo?.status?.state === 'pending') {
      overallStatus = 'DEPLOYING';
      statusColor = colors.yellow;
    } else if (deploymentInfo?.status?.state === 'failure') {
      overallStatus = 'FAILED';
      statusColor = colors.red;
    } else {
      // Site is accessible but we don't have deployment status
      overallStatus = 'ACCESSIBLE';
      statusColor = colors.green;
    }
  } else {
    overallStatus = 'INACCESSIBLE';
    statusColor = colors.red;
  }
  
  log(`Overall Status: ${overallStatus}`, colors.bright + statusColor);
  
  if (overallStatus === 'HEALTHY' || overallStatus === 'ACCESSIBLE') {
    logSuccess('✨ Deployment is healthy and accessible!');
  } else if (overallStatus === 'DEPLOYING') {
    logWarning('⏳ Deployment is in progress...');
  } else {
    logError('🚨 Deployment has issues that need attention');
  }
  
  // Additional information about deployment method
  if (deploymentInfo?.deployment) {
    console.log('\n💡 Deployment Info:');
    if (deploymentInfo.deployment.environment === 'production') {
      logInfo('Site is deployed directly from main branch via GitHub Actions');
      logInfo('New commits to main branch automatically trigger deployment');
    } else if (deploymentInfo.deployment.ref === 'gh-pages') {
      logInfo('Site is deployed from gh-pages branch (GitHub Actions workflow)');
      logInfo('New commits to main branch require GitHub Actions to update gh-pages');
    }
  }
  
  console.log('='.repeat(60));
  
  return overallStatus === 'HEALTHY' || overallStatus === 'ACCESSIBLE';
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  validateDeployment()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logError(`Validation failed: ${error.message}`);
      process.exit(1);
    });
}

export { validateDeployment };