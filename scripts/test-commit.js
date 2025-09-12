#!/usr/bin/env node

/**
 * Test Commit Scripts - Verify commit scripts work correctly
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// Colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}

function logError(message) {
    log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
    log(`ℹ️ ${message}`, colors.blue);
}

function testScript(scriptPath, description) {
    try {
        log(`\n🧪 Testing: ${description}`, colors.cyan);

        // Check if script exists
        execSync(`test -f ${scriptPath}`, { cwd: rootDir });

        // Check syntax based on file type
        if (scriptPath.endsWith('.js')) {
            execSync(`node --check ${scriptPath}`, {
                encoding: 'utf8',
                cwd: rootDir
            });
            logSuccess(`${description} - JavaScript syntax OK`);
        } else if (scriptPath.endsWith('.sh')) {
            // Check if bash script is executable and has valid shebang
            execSync(`bash -n ${scriptPath}`, {
                encoding: 'utf8',
                cwd: rootDir
            });
            logSuccess(`${description} - Bash syntax OK`);
        } else {
            logSuccess(`${description} - File exists`);
        }

        return true;
    } catch (error) {
        logError(`${description} - Failed: ${error.message}`);
        return false;
    }
}

function testGitStatus() {
    try {
        execSync('git status', { stdio: 'pipe', cwd: rootDir });
        logSuccess('Git repository detected');
        return true;
    } catch (error) {
        logError('Not a git repository');
        return false;
    }
}

function main() {
    log('🧪 Testing Commit Scripts', colors.cyan);
    log('========================', colors.cyan);

    // Test git status
    if (!testGitStatus()) {
        logError('Cannot test commit scripts without git repository');
        process.exit(1);
    }

    // Test scripts
    const tests = [
        { script: 'scripts/smart-commit.js', name: 'Smart Commit (AI)' },
        { script: 'scripts/simple-commit.js', name: 'Simple Commit' },
        { script: 'scripts/commit.sh', name: 'Quick Commit (Bash)' },
        { script: 'scripts/dev-flow.js', name: 'Development Flow' },
        { script: 'scripts/pipeline-runner.js', name: 'Pipeline Runner' }
    ];

    let passed = 0;
    let failed = 0;

    tests.forEach(test => {
        if (testScript(test.script, test.name)) {
            passed++;
        } else {
            failed++;
        }
    });

    // Test NPM scripts
    log(`\n🧪 Testing NPM Scripts`, colors.cyan);

    const npmScripts = [
        'commit:simple',
        'commit:auto',
        'commit:quick',
        'pipeline',
        'flow'
    ];

    npmScripts.forEach(script => {
        try {
            // Just check if the script exists in package.json
            const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8', cwd: rootDir }));
            if (packageJson.scripts[script]) {
                logSuccess(`NPM script '${script}' exists`);
                passed++;
            } else {
                logError(`NPM script '${script}' not found`);
                failed++;
            }
        } catch (error) {
            logError(`Failed to check NPM script '${script}': ${error.message}`);
            failed++;
        }
    });

    // Summary
    log(`\n📊 Test Summary`, colors.cyan);
    log(`===============`, colors.cyan);
    log(`✅ Passed: ${passed}`, colors.green);
    log(`❌ Failed: ${failed}`, colors.red);

    if (failed === 0) {
        logSuccess('All tests passed! Commit scripts are ready to use.');

        log(`\n🚀 Quick Start Guide:`, colors.blue);
        log(`• npm run commit:simple    - Simple AI commit`, colors.white);
        log(`• npm run commit:auto      - Auto-commit without confirmation`, colors.white);
        log(`• npm run commit:quick     - Interactive bash commit`, colors.white);
        log(`• npm run commit           - Full AI commit (interactive)`, colors.white);
        log(`• npm run flow             - Complete development workflow`, colors.white);

    } else {
        logError('Some tests failed. Please check the errors above.');
        process.exit(1);
    }
}

main();