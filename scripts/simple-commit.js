#!/usr/bin/env node

/**
 * Simple Commit - Non-interactive AI commit message generator
 * 
 * Generates commit messages without interactive prompts
 * Usage: node scripts/simple-commit.js [--auto] [--message "custom message"]
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

// Git utilities
function getGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: rootDir });
    return status.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    throw new Error('Not a git repository or git not available');
  }
}

function getGitDiff() {
  try {
    const diff = execSync('git diff --cached --name-status', { encoding: 'utf8', cwd: rootDir });
    return diff.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

// Simple commit message generation
function generateSimpleCommitMessage(statusLines) {
  const analysis = {
    added: [],
    modified: [],
    deleted: [],
    categories: new Set(),
    scope: new Set()
  };

  statusLines.forEach(line => {
    const status = line.substring(0, 2);
    const file = line.substring(3);
    
    // Determine change type
    if (status.includes('A')) analysis.added.push(file);
    if (status.includes('M')) analysis.modified.push(file);
    if (status.includes('D')) analysis.deleted.push(file);
    
    // Determine category and scope
    if (file.startsWith('src/')) {
      analysis.categories.add('feat');
      if (file.includes('component')) analysis.scope.add('components');
      if (file.includes('hook')) analysis.scope.add('hooks');
      if (file.includes('util')) analysis.scope.add('utils');
    }
    
    if (file.startsWith('tests/') || file.includes('.test.') || file.includes('.spec.')) {
      analysis.categories.add('test');
      analysis.scope.add('tests');
    }
    
    if (file.startsWith('.github/workflows/')) {
      analysis.categories.add('ci');
      analysis.scope.add('workflows');
    }
    
    if (file.startsWith('scripts/')) {
      analysis.categories.add('build');
      analysis.scope.add('scripts');
    }
    
    if (file === 'package.json' || file === 'package-lock.json') {
      analysis.categories.add('build');
      analysis.scope.add('deps');
    }
    
    if (file.includes('README') || file.includes('.md')) {
      analysis.categories.add('docs');
      analysis.scope.add('docs');
    }
  });

  // Determine primary type
  let type = 'feat'; // default
  if (analysis.categories.has('test') && analysis.categories.size === 1) type = 'test';
  if (analysis.categories.has('docs') && analysis.categories.size === 1) type = 'docs';
  if (analysis.categories.has('ci') && analysis.categories.size === 1) type = 'ci';
  if (analysis.categories.has('build') && analysis.categories.size === 1) type = 'build';
  if (analysis.modified.length > 0 && analysis.added.length === 0 && analysis.deleted.length === 0) {
    type = 'fix';
  }
  
  // Determine scope
  let scopeStr = '';
  if (analysis.scope.size === 1) {
    scopeStr = `(${Array.from(analysis.scope)[0]})`;
  }
  
  // Generate description
  let description = '';
  if (analysis.added.length > 0 && analysis.modified.length === 0) {
    description = analysis.added.length === 1 ? 
      `add ${analysis.added[0].split('/').pop()}` : 
      `add ${analysis.added.length} new files`;
  } else if (analysis.modified.length > 0 && analysis.added.length === 0) {
    description = analysis.modified.length === 1 ? 
      `update ${analysis.modified[0].split('/').pop()}` : 
      `update ${analysis.modified.length} files`;
  } else if (analysis.deleted.length > 0) {
    description = 'refactor and cleanup';
  } else {
    description = 'update project structure';
  }
  
  return `${type}${scopeStr}: ${description}`;
}

function main() {
  const args = process.argv.slice(2);
  let autoCommit = false;
  let customMessage = '';
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--auto') {
      autoCommit = true;
    } else if (args[i] === '--message' && args[i + 1]) {
      customMessage = args[i + 1];
      i++; // Skip next argument
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Simple Commit - Non-interactive AI commit generator

Usage: node scripts/simple-commit.js [options]

Options:
  --auto              Auto-commit without confirmation
  --message "msg"     Use custom commit message
  --help, -h          Show this help

Examples:
  node scripts/simple-commit.js
  node scripts/simple-commit.js --auto
  node scripts/simple-commit.js --message "feat: add new feature"
      `);
      process.exit(0);
    }
  }
  
  try {
    log('🤖 Simple Commit - AI-Powered Commit Messages', colors.cyan);
    
    // Check if we're in a git repository
    const statusLines = getGitStatus();
    if (statusLines.length === 0 || statusLines[0] === '') {
      logWarning('No changes detected. Stage your changes first with `git add`.');
      process.exit(0);
    }
    
    // Check if there are staged changes
    const diffLines = getGitDiff();
    if (diffLines.length === 0 || diffLines[0] === '') {
      logWarning('No staged changes detected.');
      
      // Check if there are unstaged changes
      const unstagedStatus = execSync('git status --porcelain', { encoding: 'utf8', cwd: rootDir });
      if (unstagedStatus.trim()) {
        logInfo('Auto-staging all changes with `git add .`...');
        execSync('git add .', { cwd: rootDir });
        logSuccess('All changes staged successfully!');
        
        // Re-check staged changes after adding
        const newDiffLines = getGitDiff();
        if (newDiffLines.length === 0 || newDiffLines[0] === '') {
          logWarning('No changes to commit after staging.');
          process.exit(0);
        }
      } else {
        logInfo('No changes found in working directory.');
        process.exit(0);
      }
    }
    
    // Generate or use custom message
    const commitMessage = customMessage || generateSimpleCommitMessage(statusLines);
    
    log(`\n📝 Generated commit message:`, colors.bright);
    log(`   ${commitMessage}`, colors.green);
    
    // Show files to be committed
    log(`\n📁 Files to be committed:`, colors.blue);
    statusLines.forEach(line => {
      const status = line.substring(0, 2);
      const file = line.substring(3);
      let icon = '•';
      let color = colors.white;
      
      if (status.includes('A')) { icon = '+'; color = colors.green; }
      if (status.includes('M')) { icon = '~'; color = colors.yellow; }
      if (status.includes('D')) { icon = '-'; color = colors.red; }
      
      log(`   ${icon} ${file}`, color);
    });
    
    if (!autoCommit) {
      log(`\n🎯 Press Enter to commit or Ctrl+C to cancel...`, colors.cyan);
      // Simple synchronous input
      execSync('read -r', { stdio: 'inherit' });
    }
    
    // Perform commit
    logInfo('Committing changes...');
    
    const commitCommand = `git commit -m "${commitMessage}"`;
    execSync(commitCommand, { stdio: 'inherit', cwd: rootDir });
    
    // Show commit info
    const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8', cwd: rootDir }).trim();
    
    logSuccess('Commit completed successfully!');
    log(`📝 Commit: ${commitHash}`, colors.cyan);
    log(`💬 Message: ${commitMessage}`, colors.green);
    
  } catch (error) {
    logError(`Simple commit failed: ${error.message}`);
    process.exit(1);
  }
}

// Start the application
main();