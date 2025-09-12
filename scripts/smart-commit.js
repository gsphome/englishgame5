#!/usr/bin/env node

/**
 * Smart Commit - AI-powered commit message generator
 * 
 * Analyzes git changes and generates intelligent commit messages
 * Usage: node scripts/smart-commit.js [options]
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
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

function getGitDiffStats() {
  try {
    const stats = execSync('git diff --cached --stat', { encoding: 'utf8', cwd: rootDir });
    return stats.trim();
  } catch (error) {
    return '';
  }
}

function getGitDiffContent() {
  try {
    const diff = execSync('git diff --cached', { encoding: 'utf8', cwd: rootDir });
    return diff;
  } catch (error) {
    return '';
  }
}

// File analysis
function analyzeChanges(statusLines, diffLines) {
  const analysis = {
    added: [],
    modified: [],
    deleted: [],
    renamed: [],
    categories: new Set(),
    scope: new Set(),
    breaking: false,
    fileTypes: new Set()
  };

  statusLines.forEach(line => {
    const status = line.substring(0, 2);
    const file = line.substring(3);
    
    // Determine change type
    if (status.includes('A')) analysis.added.push(file);
    if (status.includes('M')) analysis.modified.push(file);
    if (status.includes('D')) analysis.deleted.push(file);
    if (status.includes('R')) analysis.renamed.push(file);
    
    // Determine file type
    const ext = file.split('.').pop();
    if (ext) analysis.fileTypes.add(ext);
    
    // Determine category and scope
    if (file.startsWith('src/')) {
      analysis.categories.add('feat');
      if (file.includes('component')) analysis.scope.add('components');
      if (file.includes('hook')) analysis.scope.add('hooks');
      if (file.includes('util')) analysis.scope.add('utils');
      if (file.includes('service')) analysis.scope.add('services');
      if (file.includes('store')) analysis.scope.add('store');
      if (file.includes('type')) analysis.scope.add('types');
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
    
    if (file.startsWith('config/') || file.includes('.config.')) {
      analysis.categories.add('build');
      analysis.scope.add('config');
    }
    
    if (file.includes('README') || file.includes('.md')) {
      analysis.categories.add('docs');
      analysis.scope.add('docs');
    }
    
    if (file.includes('style') || file.includes('.css') || file.includes('.scss')) {
      analysis.categories.add('style');
      analysis.scope.add('styles');
    }
  });

  return analysis;
}

// AI-powered commit message generation
function generateCommitMessage(analysis, diffContent) {
  const { added, modified, deleted, renamed, categories, scope, fileTypes } = analysis;
  
  // Determine primary type
  let type = 'feat'; // default
  if (categories.has('test') && categories.size === 1) type = 'test';
  if (categories.has('docs') && categories.size === 1) type = 'docs';
  if (categories.has('style') && categories.size === 1) type = 'style';
  if (categories.has('ci') && categories.size === 1) type = 'ci';
  if (categories.has('build') && categories.size === 1) type = 'build';
  if (modified.length > 0 && added.length === 0 && deleted.length === 0) {
    if (categories.has('feat')) type = 'feat';
    else type = 'fix';
  }
  if (deleted.length > 0) type = 'refactor';
  
  // Determine scope
  let scopeStr = '';
  if (scope.size === 1) {
    scopeStr = `(${Array.from(scope)[0]})`;
  } else if (scope.size > 1) {
    const mainScope = Array.from(scope).sort()[0];
    scopeStr = `(${mainScope})`;
  }
  
  // Generate description based on changes
  let description = '';
  
  if (added.length > 0 && modified.length === 0 && deleted.length === 0) {
    // Pure addition
    if (added.length === 1) {
      const file = added[0];
      if (file.includes('component')) description = `add ${file.split('/').pop().replace('.tsx', '').replace('.ts', '')} component`;
      else if (file.includes('hook')) description = `add ${file.split('/').pop().replace('.ts', '')} hook`;
      else if (file.includes('util')) description = `add ${file.split('/').pop().replace('.ts', '')} utility`;
      else if (file.includes('test')) description = `add tests for ${file.split('/').pop().replace('.test.', '').replace('.spec.', '')}`;
      else if (file.includes('README')) description = 'add documentation';
      else if (file.includes('workflow')) description = `add ${file.split('/').pop().replace('.yml', '')} workflow`;
      else description = `add ${file.split('/').pop()}`;
    } else {
      description = `add ${added.length} new files`;
      if (fileTypes.has('tsx') || fileTypes.has('ts')) description += ' (TypeScript)';
      if (fileTypes.has('test')) description += ' with tests';
    }
  } else if (modified.length > 0 && added.length === 0 && deleted.length === 0) {
    // Pure modification
    if (modified.length === 1) {
      const file = modified[0];
      if (file === 'package.json') description = 'update dependencies';
      else if (file.includes('README')) description = 'update documentation';
      else if (file.includes('workflow')) description = `update ${file.split('/').pop().replace('.yml', '')} workflow`;
      else if (file.includes('component')) description = `update ${file.split('/').pop().replace('.tsx', '').replace('.ts', '')} component`;
      else if (file.includes('config')) description = 'update configuration';
      else description = `update ${file.split('/').pop()}`;
    } else {
      description = `update ${modified.length} files`;
      if (scope.has('components')) description = 'update components';
      else if (scope.has('workflows')) description = 'update CI/CD workflows';
      else if (scope.has('config')) description = 'update configuration';
      else if (scope.has('tests')) description = 'update tests';
    }
  } else if (deleted.length > 0) {
    // Deletions involved
    if (deleted.length === 1 && added.length === 0 && modified.length === 0) {
      description = `remove ${deleted[0].split('/').pop()}`;
    } else {
      description = 'refactor and cleanup';
      if (added.length > 0) description += ` (${added.length} added, ${deleted.length} removed)`;
    }
  } else {
    // Mixed changes
    const totalChanges = added.length + modified.length + deleted.length;
    if (scope.has('workflows')) description = 'improve CI/CD pipeline';
    else if (scope.has('components')) description = 'enhance components';
    else if (scope.has('tests')) description = 'improve test coverage';
    else if (scope.has('config')) description = 'update project configuration';
    else if (scope.has('scripts')) description = 'enhance build scripts';
    else description = `update project structure (${totalChanges} files)`;
  }
  
  // Analyze diff content for more context
  if (diffContent) {
    const lines = diffContent.split('\n');
    const addedLines = lines.filter(line => line.startsWith('+')).length;
    const removedLines = lines.filter(line => line.startsWith('-')).length;
    
    // Look for specific patterns
    if (diffContent.includes('TODO') || diffContent.includes('FIXME')) {
      if (!description.includes('fix')) description += ' and address TODOs';
    }
    
    if (diffContent.includes('console.log') && diffContent.includes('-')) {
      description += ' and remove debug logs';
    }
    
    if (diffContent.includes('test(') || diffContent.includes('it(') || diffContent.includes('describe(')) {
      if (!description.includes('test')) description += ' with tests';
    }
    
    if (diffContent.includes('export') && diffContent.includes('+')) {
      if (!description.includes('add') && !description.includes('export')) description += ' and export utilities';
    }
  }
  
  // Construct final message
  const commitMessage = `${type}${scopeStr}: ${description}`;
  
  // Generate body if significant changes
  let body = '';
  if (added.length + modified.length + deleted.length > 5) {
    body += '\nChanges:\n';
    if (added.length > 0) body += `- Added: ${added.length} files\n`;
    if (modified.length > 0) body += `- Modified: ${modified.length} files\n`;
    if (deleted.length > 0) body += `- Deleted: ${deleted.length} files\n`;
  }
  
  return { message: commitMessage, body: body.trim() };
}

// Interactive commit process
async function promptUser(question) {
  return new Promise((resolve) => {
    process.stdout.write(`${question} `);
    
    // Set stdin to raw mode for better input handling
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    
    process.stdin.once('data', (data) => {
      const input = data.toString().trim();
      resolve(input);
    });
    
    // Resume stdin if it was paused
    process.stdin.resume();
  });
}

async function interactiveCommit(analysis, suggestions) {
  logHeader('🤖 AI-Generated Commit Messages');
  
  log('\nSuggested commit messages:', colors.bright);
  suggestions.forEach((suggestion, index) => {
    log(`  ${index + 1}. ${suggestion.message}`, colors.green);
    if (suggestion.body) {
      log(`     ${suggestion.body.replace(/\n/g, '\n     ')}`, colors.white);
    }
  });
  
  log('\nOptions:', colors.bright);
  log('  1-3: Use suggested message');
  log('  c: Custom message');
  log('  s: Show detailed changes');
  log('  q: Quit without committing');
  
  const choice = await promptUser('\n🎯 Select option:');
  
  switch (choice.toLowerCase()) {
    case '1':
    case '2':
    case '3':
      const index = parseInt(choice) - 1;
      if (suggestions[index]) {
        return suggestions[index];
      } else {
        logWarning('Invalid selection. Please try again.');
        return await interactiveCommit(analysis, suggestions);
      }
    case 'c':
      const customMessage = await promptUser('Enter custom commit message:');
      const customBody = await promptUser('Enter commit body (optional):');
      return { message: customMessage, body: customBody };
    case 's':
      showDetailedChanges(analysis);
      return await interactiveCommit(analysis, suggestions);
    case 'q':
      log('\n👋 Commit cancelled.', colors.yellow);
      process.exit(0);
    default:
      logWarning('Invalid option. Please try again.');
      return await interactiveCommit(analysis, suggestions);
  }
}

function showDetailedChanges(analysis) {
  logHeader('📊 Detailed Change Analysis');
  
  const { added, modified, deleted, renamed, categories, scope, fileTypes } = analysis;
  
  if (added.length > 0) {
    log('\n📁 Added files:', colors.green);
    added.forEach(file => log(`  + ${file}`, colors.green));
  }
  
  if (modified.length > 0) {
    log('\n📝 Modified files:', colors.yellow);
    modified.forEach(file => log(`  ~ ${file}`, colors.yellow));
  }
  
  if (deleted.length > 0) {
    log('\n🗑️ Deleted files:', colors.red);
    deleted.forEach(file => log(`  - ${file}`, colors.red));
  }
  
  if (renamed.length > 0) {
    log('\n🔄 Renamed files:', colors.blue);
    renamed.forEach(file => log(`  → ${file}`, colors.blue));
  }
  
  log('\n🏷️ Detected categories:', colors.bright);
  Array.from(categories).forEach(cat => log(`  • ${cat}`, colors.cyan));
  
  log('\n🎯 Detected scopes:', colors.bright);
  Array.from(scope).forEach(sc => log(`  • ${sc}`, colors.magenta));
  
  log('\n📄 File types:', colors.bright);
  Array.from(fileTypes).forEach(type => log(`  • ${type}`, colors.white));
}

async function main() {
  try {
    logHeader('🤖 Smart Commit - AI-Powered Commit Messages');
    
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
    
    logInfo('Analyzing changes...');
    
    // Analyze changes
    const analysis = analyzeChanges(statusLines, diffLines);
    const diffContent = getGitDiffContent();
    const diffStats = getGitDiffStats();
    
    // Generate multiple suggestions
    const suggestions = [];
    
    // Primary suggestion
    const primary = generateCommitMessage(analysis, diffContent);
    suggestions.push(primary);
    
    // Alternative suggestions
    if (analysis.categories.size > 1) {
      // More generic version
      const generic = {
        message: `feat: update project structure`,
        body: `Multiple areas updated:\n${Array.from(analysis.categories).map(c => `- ${c}`).join('\n')}`
      };
      suggestions.push(generic);
    }
    
    // Detailed version
    if (analysis.added.length + analysis.modified.length + analysis.deleted.length > 1) {
      const detailed = {
        message: primary.message,
        body: `${primary.body}\n\nFiles changed:\n${diffStats}`
      };
      suggestions.push(detailed);
    }
    
    // Interactive selection
    const selectedCommit = await interactiveCommit(analysis, suggestions);
    
    // Perform commit
    logInfo('Committing changes...');
    
    let commitCommand = `git commit -m "${selectedCommit.message}"`;
    if (selectedCommit.body && selectedCommit.body.trim()) {
      commitCommand = `git commit -m "${selectedCommit.message}" -m "${selectedCommit.body}"`;
    }
    
    execSync(commitCommand, { stdio: 'inherit', cwd: rootDir });
    
    logSuccess('Commit completed successfully!');
    
    // Show commit info
    const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8', cwd: rootDir }).trim();
    log(`\n📝 Commit: ${commitHash}`, colors.cyan);
    log(`💬 Message: ${selectedCommit.message}`, colors.green);
    
    // Exit successfully
    log('\n✨ Smart commit completed successfully!', colors.green);
    process.exit(0);
    
  } catch (error) {
    logError(`Smart commit failed: ${error.message}`);
    process.exit(1);
  }
}

// Cleanup function
function cleanup() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
  process.stdin.destroy();
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n👋 Smart commit interrupted. No changes committed.', colors.cyan);
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n👋 Smart commit terminated. No changes committed.', colors.cyan);
  cleanup();
  process.exit(0);
});

process.on('exit', () => {
  cleanup();
});

// Start the application
main().catch((error) => {
  logError('Smart commit crashed:');
  console.error(error);
  cleanup();
  process.exit(1);
});