/**
 * AI Analyzer - Intelligent analysis of code changes for commit messages
 */

import { getCategorizedGitStatus, getGitDiffContent } from './git-utils.js';
import { logDebug } from './logger.js';

/**
 * Analyze file changes and suggest commit type and scope
 */
export function analyzeChanges(statusLines, diffLines) {
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
    
    // Determine category and scope based on file patterns
    analyzeFileForCategoryAndScope(file, analysis);
  });

  logDebug(`Analysis result: ${JSON.stringify({
    categories: Array.from(analysis.categories),
    scopes: Array.from(analysis.scope),
    fileTypes: Array.from(analysis.fileTypes)
  })}`);

  return analysis;
}

/**
 * Analyze individual file for category and scope
 */
function analyzeFileForCategoryAndScope(file, analysis) {
  // Source code files
  if (file.startsWith('src/')) {
    analysis.categories.add('feat');
    
    if (file.includes('component')) analysis.scope.add('components');
    if (file.includes('hook')) analysis.scope.add('hooks');
    if (file.includes('util')) analysis.scope.add('utils');
    if (file.includes('service')) analysis.scope.add('services');
    if (file.includes('store')) analysis.scope.add('store');
    if (file.includes('type')) analysis.scope.add('types');
    if (file.includes('style') || file.includes('.css') || file.includes('.scss')) {
      analysis.categories.add('style');
      analysis.scope.add('styles');
    }
  }
  
  // Test files
  if (file.startsWith('tests/') || file.includes('.test.') || file.includes('.spec.')) {
    analysis.categories.add('test');
    analysis.scope.add('tests');
  }
  
  // CI/CD files
  if (file.startsWith('.github/workflows/')) {
    analysis.categories.add('ci');
    analysis.scope.add('workflows');
  }
  
  // Build scripts
  if (file.startsWith('scripts/')) {
    analysis.categories.add('build');
    analysis.scope.add('scripts');
  }
  
  // Dependencies
  if (file === 'package.json' || file === 'package-lock.json') {
    analysis.categories.add('build');
    analysis.scope.add('deps');
  }
  
  // Configuration files
  if (file.startsWith('config/') || file.includes('.config.') || file.includes('tsconfig') || file.includes('vite.config')) {
    analysis.categories.add('build');
    analysis.scope.add('config');
  }
  
  // Documentation
  if (file.includes('README') || file.includes('.md')) {
    analysis.categories.add('docs');
    analysis.scope.add('docs');
  }
  
  // Public assets
  if (file.startsWith('public/')) {
    analysis.categories.add('feat');
    analysis.scope.add('assets');
  }
}

/**
 * Generate commit message based on analysis
 */
export function generateCommitMessage(analysis, diffContent = '') {
  const { added, modified, deleted, renamed, categories, scope, fileTypes } = analysis;
  
  // Determine primary type
  let type = determineCommitType(analysis);
  
  // Determine scope
  let scopeStr = determineCommitScope(scope);
  
  // Generate description
  let description = generateCommitDescription(analysis, diffContent);
  
  // Generate body if significant changes
  let body = generateCommitBody(analysis);
  
  const commitMessage = `${type}${scopeStr}: ${description}`;
  
  logDebug(`Generated commit: ${commitMessage}`);
  
  return { message: commitMessage, body: body.trim() };
}

/**
 * Determine the most appropriate commit type
 */
function determineCommitType(analysis) {
  const { added, modified, deleted, categories } = analysis;
  
  // Single category scenarios
  if (categories.has('test') && categories.size === 1) return 'test';
  if (categories.has('docs') && categories.size === 1) return 'docs';
  if (categories.has('style') && categories.size === 1) return 'style';
  if (categories.has('ci') && categories.size === 1) return 'ci';
  if (categories.has('build') && categories.size === 1) return 'build';
  
  // Change pattern scenarios
  if (deleted.length > 0 && added.length > 0) return 'refactor';
  if (deleted.length > 0 && added.length === 0 && modified.length === 0) return 'remove';
  if (modified.length > 0 && added.length === 0 && deleted.length === 0) {
    return categories.has('feat') ? 'feat' : 'fix';
  }
  if (added.length > 0) return 'feat';
  
  return 'feat'; // default
}

/**
 * Determine the most appropriate scope
 */
function determineCommitScope(scope) {
  if (scope.size === 0) return '';
  if (scope.size === 1) return `(${Array.from(scope)[0]})`;
  
  // Priority order for multiple scopes
  const priorityOrder = ['components', 'workflows', 'scripts', 'config', 'deps', 'tests', 'docs'];
  
  for (const priority of priorityOrder) {
    if (scope.has(priority)) {
      return `(${priority})`;
    }
  }
  
  // Fallback to first scope alphabetically
  return `(${Array.from(scope).sort()[0]})`;
}

/**
 * Generate commit description based on changes
 */
function generateCommitDescription(analysis, diffContent) {
  const { added, modified, deleted, scope, fileTypes } = analysis;
  
  // Scope-based descriptions
  if (scope.has('scripts')) {
    if (added.length > 0 && modified.length > 0) {
      return 'enhance development scripts and add new tools';
    } else if (added.length > 0) {
      return 'add new development scripts';
    } else {
      return 'improve development scripts';
    }
  }
  
  if (scope.has('workflows')) return 'update CI/CD workflows';
  if (scope.has('docs')) return 'update documentation';
  if (scope.has('deps')) return 'update dependencies';
  if (scope.has('config')) return 'update configuration';
  if (scope.has('tests')) return 'improve test coverage';
  if (scope.has('components')) {
    if (added.length > 0) return 'add new components';
    return 'update components';
  }
  
  // Pattern-based descriptions
  if (added.length > 0 && modified.length === 0 && deleted.length === 0) {
    if (added.length === 1) {
      const file = added[0];
      return `add ${file.split('/').pop().replace(/\.(tsx?|jsx?)$/, '')}`;
    }
    return `add ${added.length} new files`;
  }
  
  if (modified.length > 0 && added.length === 0 && deleted.length === 0) {
    if (modified.length === 1) {
      const file = modified[0];
      return `update ${file.split('/').pop()}`;
    }
    return `update ${modified.length} files`;
  }
  
  if (deleted.length > 0) {
    return 'refactor and cleanup';
  }
  
  // Fallback
  const totalChanges = added.length + modified.length + deleted.length;
  return `update project structure (${totalChanges} files)`;
}

/**
 * Generate commit body for significant changes
 */
function generateCommitBody(analysis) {
  const { added, modified, deleted } = analysis;
  let body = '';
  
  if (added.length + modified.length + deleted.length > 5) {
    body += '\nChanges:\n';
    if (added.length > 0) body += `- Added: ${added.length} files\n`;
    if (modified.length > 0) body += `- Modified: ${modified.length} files\n`;
    if (deleted.length > 0) body += `- Deleted: ${deleted.length} files\n`;
  }
  
  return body;
}

/**
 * Generate multiple commit message suggestions
 */
export function generateMultipleSuggestions(analysis, diffContent) {
  const suggestions = [];
  
  // Primary suggestion
  const primary = generateCommitMessage(analysis, diffContent);
  suggestions.push(primary);
  
  // Alternative generic version for multiple categories
  if (analysis.categories.size > 1) {
    const generic = {
      message: 'feat: update project structure',
      body: `Multiple areas updated:\n${Array.from(analysis.categories).map(c => `- ${c}`).join('\n')}`
    };
    suggestions.push(generic);
  }
  
  // Detailed version for significant changes
  if (analysis.added.length + analysis.modified.length + analysis.deleted.length > 3) {
    const detailed = {
      message: primary.message,
      body: `${primary.body}\n\nDetailed changes:\n- Added: ${analysis.added.length} files\n- Modified: ${analysis.modified.length} files\n- Deleted: ${analysis.deleted.length} files`
    };
    suggestions.push(detailed);
  }
  
  return suggestions;
}

/**
 * Analyze diff content for additional context
 */
export function analyzeDiffContent(diffContent) {
  if (!diffContent) return {};
  
  const lines = diffContent.split('\n');
  const addedLines = lines.filter(line => line.startsWith('+')).length;
  const removedLines = lines.filter(line => line.startsWith('-')).length;
  
  const patterns = {
    hasTodos: diffContent.includes('TODO') || diffContent.includes('FIXME'),
    hasConsoleLog: diffContent.includes('console.log'),
    hasTests: diffContent.includes('test(') || diffContent.includes('it(') || diffContent.includes('describe('),
    hasExports: diffContent.includes('export'),
    hasImports: diffContent.includes('import')
  };
  
  return {
    addedLines,
    removedLines,
    patterns
  };
}