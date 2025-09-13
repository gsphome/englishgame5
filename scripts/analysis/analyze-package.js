#!/usr/bin/env node

/**
 * Package.json Analyzer - Detect duplications and optimize scripts
 */

import { readFileSync } from 'fs';
import { log, logHeader, logSuccess, logError, logWarning, logInfo, colors } from './utils/logger.js';

function analyzePackageScripts() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts;
    
    logHeader('📦 Package.json Scripts Analysis');
    
    // Group scripts by category
    const categories = {
      development: [],
      testing: [],
      building: [],
      linting: [],
      security: [],
      pipeline: [],
      commit: [],
      flow: [],
      utility: []
    };
    
    // Categorize scripts
    Object.entries(scripts).forEach(([name, command]) => {
      if (name.startsWith('dev') || name === 'preview') {
        categories.development.push({ name, command });
      } else if (name.startsWith('test')) {
        categories.testing.push({ name, command });
      } else if (name.startsWith('build') || name === 'analyze') {
        categories.building.push({ name, command });
      } else if (name.startsWith('lint') || name.startsWith('format') || name === 'type-check') {
        categories.linting.push({ name, command });
      } else if (name.startsWith('security')) {
        categories.security.push({ name, command });
      } else if (name.startsWith('pipeline')) {
        categories.pipeline.push({ name, command });
      } else if (name.startsWith('commit')) {
        categories.commit.push({ name, command });
      } else if (name.startsWith('flow')) {
        categories.flow.push({ name, command });
      } else {
        categories.utility.push({ name, command });
      }
    });
    
    // Display categorized scripts
    Object.entries(categories).forEach(([category, scriptList]) => {
      if (scriptList.length > 0) {
        log(`\n📋 ${category.toUpperCase()} Scripts (${scriptList.length}):`, colors.bright);
        scriptList.forEach(({ name, command }) => {
          log(`  ${name.padEnd(20)} → ${command}`, colors.white);
        });
      }
    });
    
    // Detect potential duplications
    logHeader('🔍 Duplication Analysis');
    
    const commandGroups = {};
    Object.entries(scripts).forEach(([name, command]) => {
      if (!commandGroups[command]) {
        commandGroups[command] = [];
      }
      commandGroups[command].push(name);
    });
    
    const duplicates = Object.entries(commandGroups).filter(([cmd, names]) => names.length > 1);
    
    if (duplicates.length > 0) {
      logWarning('Found potential duplications:');
      duplicates.forEach(([command, names]) => {
        log(`  Command: ${command}`, colors.yellow);
        log(`  Scripts: ${names.join(', ')}`, colors.white);
        log('', colors.reset);
      });
    } else {
      logSuccess('No exact command duplications found');
    }
    
    // Analyze script patterns
    logHeader('📊 Script Patterns Analysis');
    
    const patterns = {
      'dev-tools.js': Object.keys(scripts).filter(name => scripts[name].includes('dev-tools.js')),
      'smart-commit.js': Object.keys(scripts).filter(name => scripts[name].includes('smart-commit.js')),
      'test-runner.js': Object.keys(scripts).filter(name => scripts[name].includes('test-runner.js')),
      'npm run': Object.keys(scripts).filter(name => scripts[name].includes('npm run')),
      'node scripts/': Object.keys(scripts).filter(name => scripts[name].includes('node scripts/'))
    };
    
    Object.entries(patterns).forEach(([pattern, matches]) => {
      if (matches.length > 0) {
        log(`${pattern.padEnd(15)} → ${matches.length} scripts: ${matches.join(', ')}`, colors.cyan);
      }
    });
    
    // Summary and recommendations
    logHeader('💡 Recommendations');
    
    const totalScripts = Object.keys(scripts).length;
    const consolidatedScripts = patterns['dev-tools.js'].length + patterns['smart-commit.js'].length + patterns['test-runner.js'].length;
    
    logInfo(`Total scripts: ${totalScripts}`);
    logInfo(`Consolidated scripts: ${consolidatedScripts} (${((consolidatedScripts/totalScripts)*100).toFixed(1)}%)`);
    
    if (duplicates.length === 0) {
      logSuccess('✅ No duplications found - scripts are well organized');
    }
    
    if (consolidatedScripts > totalScripts * 0.3) {
      logSuccess('✅ Good consolidation - most scripts use unified tools');
    }
    
    // Check for missing essential scripts
    const essentialScripts = ['dev-tools', 'commit', 'pipeline', 'test-scripts'];
    const missingEssential = essentialScripts.filter(script => !scripts[script]);
    
    if (missingEssential.length > 0) {
      logWarning(`Missing essential scripts: ${missingEssential.join(', ')}`);
    } else {
      logSuccess('✅ All essential scripts are present');
    }
    
    return {
      totalScripts,
      categories,
      duplicates: duplicates.length,
      consolidationRate: (consolidatedScripts/totalScripts)*100
    };
    
  } catch (error) {
    logError(`Failed to analyze package.json: ${error.message}`);
    return null;
  }
}

function main() {
  const analysis = analyzePackageScripts();
  
  if (analysis) {
    logHeader('📈 Analysis Summary');
    logInfo(`Total Scripts: ${analysis.totalScripts}`);
    logInfo(`Duplications: ${analysis.duplicates}`);
    logInfo(`Consolidation Rate: ${analysis.consolidationRate.toFixed(1)}%`);
    
    if (analysis.duplicates === 0 && analysis.consolidationRate > 30) {
      logSuccess('🎉 Package.json is well organized and consolidated!');
    }
  }
}

main();