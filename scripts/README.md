# 🛠️ Development Scripts

Comprehensive development automation tools for quality, security, building, and intelligent commits.

## 🏗️ Architecture Overview

```
scripts/
├── 🎭 dev-tools.js          # Main development orchestrator
├── 🤖 smart-commit.js       # AI-powered commit generation
├── 🧪 test-runner.js        # Test and validation runner
├── 🛠️ commit.sh             # Bash commit script (for bash users)
├── 🧹 cleanup.js            # Project cleanup utility
├── ⚙️ toggle-cache-logs.js  # Cache logging toggle utility
├── ⚙️ utils/                # Shared utilities
│   ├── git-utils.js         # Git operations
│   ├── ai-analyzer.js       # AI analysis engine
│   └── logger.js            # Consistent logging
└── 📚 README.md             # This file
```

## 🚀 Quick Start

### Main Commands
```bash
# Development workflow (replaces multiple scripts)
npm run dev-tools

# AI-powered commits
npm run commit

# Pipeline validation
npm run pipeline

# Complete development flow
npm run flow
```

### Direct Script Access
```bash
# Main development orchestrator
node scripts/dev-tools.js [command]

# AI commit generation
node scripts/smart-commit.js

# Test and validation
node scripts/test-runner.js
```

## 📋 Available Commands

### 🎭 Development Tools (`dev-tools.js`)
**Replaces:** `dev-flow.js`, `pipeline-runner.js`, `pipeline.sh`

```bash
npm run dev-tools
# or
node scripts/dev-tools.js [command]
```

**Commands:**
- `quality` - Run quality pipeline (ESLint, TypeScript, Tests, Format)
- `security` - Run security pipeline (Audit, Patterns, Licenses)
- `build` - Run build pipeline (Build, Verify, Analysis)
- `all` - Run all pipelines
- `commit` - Quality check + AI commit + push
- `fix` - Auto-fix issues + commit
- `test` - Run test suite
- `interactive` - Interactive menu mode

### 🤖 Smart Commit (`smart-commit.js`)
**Replaces:** `simple-commit.js`, `commit.sh`

```bash
npm run commit
# or
node scripts/smart-commit.js [options]
```

**Options:**
- `--auto` - Auto-commit without interaction
- `--message "msg"` - Use custom message
- `--stage-all` - Stage all changes first
- `--push` - Push after commit
- `--simple` - Simple mode (single suggestion)

### 🧪 Test Runner (`test-runner.js`)
**Replaces:** `test-commit.js`

```bash
node scripts/test-runner.js [target]
```

**Targets:**
- `scripts` - Test all scripts
- `pipelines` - Test pipeline functionality
- `git` - Test git operations
- `all` - Run all tests

## 🎯 NPM Scripts Integration

### Core Scripts
```json
{
  "dev-tools": "node scripts/dev-tools.js",
  "commit": "node scripts/smart-commit.js",
  "test-scripts": "node scripts/test-runner.js",
  
  // Pipeline shortcuts
  "pipeline": "node scripts/dev-tools.js interactive",
  "pipeline:quality": "node scripts/dev-tools.js quality",
  "pipeline:security": "node scripts/dev-tools.js security", 
  "pipeline:build": "node scripts/dev-tools.js build",
  "pipeline:all": "node scripts/dev-tools.js all",
  
  // Commit shortcuts
  "commit:auto": "node scripts/smart-commit.js --auto",
  "commit:push": "node scripts/smart-commit.js --stage-all --push",
  
  // Development flow shortcuts
  "flow": "node scripts/dev-tools.js interactive",
  "flow:quick": "node scripts/dev-tools.js commit",
  "flow:safe": "node scripts/dev-tools.js quality && node scripts/smart-commit.js",
  "flow:full": "node scripts/dev-tools.js all && node scripts/smart-commit.js --push"
}
```

## 🧠 AI Features

### Intelligent Commit Analysis
- **File Change Detection**: Analyzes added, modified, deleted files
- **Commit Type Suggestion**: feat, fix, docs, style, refactor, test, build, ci
- **Scope Detection**: components, hooks, utils, services, tests, config
- **Conventional Commits**: Follows standard format automatically
- **Multiple Suggestions**: Provides options for different contexts

### Smart Pipeline Selection
- **Context Awareness**: Suggests relevant pipelines based on changes
- **Dependency Detection**: Identifies when security/quality checks are needed
- **Performance Optimization**: Runs only necessary validations

## 🔧 Configuration

### Environment Variables
```bash
# Enable debug logging
DEBUG_SCRIPTS=true

# Skip interactive prompts
CI_MODE=true

# Custom commit message templates
COMMIT_TEMPLATE="custom"
```

### Git Integration
```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
npm run pipeline:quality

# Add to .git/hooks/pre-push  
#!/bin/bash
npm run pipeline:all
```

## 📊 Usage Examples

### Daily Development Workflow
```bash
# Make your changes
# ...

# Quick quality check + commit + push
npm run flow:quick

# Or step by step
npm run pipeline:quality
npm run commit
git push
```

### Feature Development
```bash
# Complete validation before commit
npm run flow:safe

# Or full pipeline with auto-push
npm run flow:full
```

### Bug Fixes
```bash
# Auto-fix common issues + commit
node scripts/dev-tools.js fix
```

### Release Preparation
```bash
# Full validation suite
npm run pipeline:all

# Commit with detailed analysis
npm run commit
```

## 🧪 Testing

### Test All Scripts
```bash
npm run test-scripts
```

### Test Specific Components
```bash
node scripts/test-runner.js scripts
node scripts/test-runner.js pipelines
node scripts/test-runner.js git
```

## 🔄 Migration from Old Scripts

### ✅ Completed Consolidation
- ❌ `dev-flow.js` → ✅ `dev-tools.js` (consolidated)
- ❌ `pipeline-runner.js` → ✅ `dev-tools.js interactive` (consolidated)
- ❌ `pipeline.sh` → ✅ `dev-tools.js [command]` (consolidated)
- ❌ `simple-commit.js` → ✅ `smart-commit.js --simple` (consolidated)
- ❌ `test-commit.js` → ✅ `test-runner.js` (consolidated)
- ✅ `commit.sh` → Kept for bash users preference

### 🆕 New Utilities Added
- ✅ `utils/logger.js` - Consistent logging across all scripts
- ✅ `utils/git-utils.js` - Shared git operations
- ✅ `utils/ai-analyzer.js` - AI analysis engine for commits

### Migration Commands
```bash
# Old → New
npm run dev-flow → npm run dev-tools
npm run pipeline → npm run dev-tools interactive
./scripts/pipeline.sh quality → node scripts/dev-tools.js quality
npm run commit:simple → npm run commit --simple
./scripts/commit.sh --auto → npm run commit:auto
```

## 💡 Best Practices

### Commit Workflow
1. **Make changes** to your code
2. **Run quality checks**: `npm run pipeline:quality`
3. **Stage changes**: `git add .` (or let smart-commit do it)
4. **Generate commit**: `npm run commit`
5. **Push changes**: `git push` (or use `--push` flag)

### Development Workflow
1. **Start development**: `npm run dev-tools` (interactive mode)
2. **Select appropriate pipeline** based on changes
3. **Use AI commit** for consistent messages
4. **Validate before push** with full pipeline

### Automation
- Use `--auto` flags for CI/CD integration
- Set `CI_MODE=true` for non-interactive environments
- Integrate with git hooks for automatic validation

## 🎯 Benefits of Consolidation

- **Single Entry Point**: One main script for all development tasks
- **Consistent Interface**: Unified command structure across all tools
- **Reduced Complexity**: Fewer files to maintain and understand
- **Better Integration**: Seamless workflow between different tools
- **Improved Performance**: Shared utilities and optimized execution
- **Easier Maintenance**: Centralized logic and configuration

## 🚀 Future Enhancements

- **Plugin System**: Extensible architecture for custom tools
- **Configuration Files**: Project-specific settings and preferences
- **Integration APIs**: Hooks for external tools and services
- **Performance Metrics**: Timing and optimization insights
- **Team Collaboration**: Shared configurations and standards