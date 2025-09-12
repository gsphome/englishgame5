# Smart Commit Scripts

AI-powered commit message generation and automated development workflows.

## 🤖 Overview

These scripts provide intelligent commit message generation using AI analysis of your code changes, following conventional commit standards and best practices.

## 🚀 Quick Start

### AI-Powered Commits (Recommended)
```bash
# Interactive AI commit with multiple suggestions
npm run commit

# Stage all changes and commit with AI
npm run commit:all

# Stage, commit, and push with AI
npm run commit:push
```

### Quick Commits
```bash
# Simple AI commit (bash version)
npm run commit:quick

# Custom message
./scripts/commit.sh "feat: add new feature"

# Stage all, commit, and push
./scripts/commit.sh --all --push
```

### Development Workflows
```bash
# Complete development flow
npm run flow

# Quick commit workflow
npm run flow:quick

# Safe commit with full validation
npm run flow:safe
```

## 📋 Available Scripts

### 🤖 AI Commit Scripts

| Script                 | Command                            | Description                                     |
| ---------------------- | ---------------------------------- | ----------------------------------------------- |
| `npm run commit`       | `node scripts/smart-commit.js`     | Interactive AI commit with multiple suggestions |
| `npm run commit:ai`    | `node scripts/smart-commit.js`     | Same as above (alias)                           |
| `npm run commit:quick` | `./scripts/commit.sh`              | Fast AI commit (bash version)                   |
| `npm run commit:all`   | `./scripts/commit.sh --all`        | Stage all changes and commit                    |
| `npm run commit:push`  | `./scripts/commit.sh --all --push` | Stage, commit, and push                         |

### 🔄 Development Flow Scripts

| Script               | Command                                 | Description                      |
| -------------------- | --------------------------------------- | -------------------------------- |
| `npm run flow`       | `node scripts/dev-flow.js`              | Interactive development workflow |
| `npm run flow:quick` | `node scripts/dev-flow.js quick-commit` | Quick commit flow                |
| `npm run flow:safe`  | `node scripts/dev-flow.js safe-commit`  | Safe commit with validation      |
| `npm run flow:full`  | `node scripts/dev-flow.js full-flow`    | Complete development flow        |

## 🎯 Features

### 🤖 Smart Commit (`smart-commit.js`)

**Advanced AI Analysis:**
- ✅ Analyzes file changes and git diff
- ✅ Determines appropriate commit type (feat, fix, docs, etc.)
- ✅ Suggests relevant scope based on modified files
- ✅ Generates multiple commit message options
- ✅ Interactive selection with preview
- ✅ Follows conventional commit format
- ✅ Detailed change analysis and statistics

**Interactive Features:**
- 🎨 Colorized output with emojis
- 📊 Detailed change analysis
- 🔍 File-by-file breakdown
- 🎮 Menu-driven interface
- ⌨️ Keyboard shortcuts
- 📝 Custom message option

### ⚡ Quick Commit (`commit.sh`)

**Fast and Simple:**
- ✅ Lightweight bash implementation
- ✅ Basic AI analysis of file changes
- ✅ Automatic commit type detection
- ✅ Interactive confirmation
- ✅ Auto-staging option
- ✅ Push integration

**Command Line Options:**
```bash
./scripts/commit.sh [message] [options]

Options:
  --all, -a     Stage all changes before committing
  --push, -p    Push to remote after successful commit
  --yes, -y     Skip confirmation (auto-commit)
  --help, -h    Show help
```

### 🔄 Development Flow (`dev-flow.js`)

**Complete Workflows:**
- ⚡ **Quick Commit**: Fast quality check + AI commit + push
- 🛡️ **Safe Commit**: Full quality + security + AI commit
- 🚀 **Full Flow**: Complete pipeline + AI commit + push
- 📤 **Pre-Push**: Validate before pushing existing commits
- 🔧 **Fix and Commit**: Auto-fix issues + commit + push

## 🎮 Usage Examples

### Basic AI Commit
```bash
# Stage your changes
git add .

# Generate AI commit message
npm run commit
```

### Quick Development Cycle
```bash
# Make changes to your code
# ...

# Quick commit with validation
npm run flow:quick
```

### Safe Development Cycle
```bash
# Make changes to your code
# ...

# Full validation + commit
npm run flow:safe
```

### Custom Commit Messages
```bash
# Use custom message with quick commit
./scripts/commit.sh "feat(auth): implement OAuth login"

# Stage all and push
./scripts/commit.sh "fix: resolve login bug" --all --push
```

### Auto-fix and Commit
```bash
# Auto-fix linting and formatting issues, then commit
npm run flow:fix
```

## 🧠 AI Analysis Features

### File Change Analysis
- **Added files**: Detects new components, tests, documentation
- **Modified files**: Identifies updates to existing functionality
- **Deleted files**: Recognizes cleanup and refactoring
- **File types**: Analyzes TypeScript, tests, configs, docs

### Commit Type Detection
- **feat**: New features and functionality
- **fix**: Bug fixes and improvements
- **docs**: Documentation updates
- **style**: Code formatting and style changes
- **refactor**: Code restructuring
- **test**: Test additions and updates
- **build**: Build system and dependency changes
- **ci**: CI/CD pipeline updates

### Scope Detection
- **components**: React components
- **hooks**: Custom hooks
- **utils**: Utility functions
- **services**: API services
- **store**: State management
- **tests**: Test files
- **config**: Configuration files
- **workflows**: GitHub Actions

## 📊 Output Examples

### AI Commit Suggestions
```
🤖 AI-Generated Commit Messages

Suggested commit messages:
  1. feat(components): add UserProfile component
     New component for displaying user information
     with avatar, name, and contact details

  2. feat: update project structure
     Multiple areas updated:
     - components
     - tests

  3. feat(components): add UserProfile component
     New component for displaying user information
     
     Files changed:
      src/components/UserProfile.tsx | 45 ++++++++++++++++++++
      tests/components/UserProfile.test.tsx | 23 +++++++++++
      2 files changed, 68 insertions(+)

Options:
  1-3: Use suggested message
  c: Custom message
  s: Show detailed changes
  q: Quit without committing
```

### Development Flow
```
🔄 Development Flow - Automated Workflow

Available workflows:
  1. ⚡ Quick Commit
     Quick quality check + AI commit + push

  2. 🛡️ Safe Commit
     Full quality + security check + AI commit

  3. 🚀 Full Development Flow
     Complete pipeline + AI commit + push

  4. 📤 Pre-Push Validation
     Validate before pushing existing commits

  5. 🔧 Fix and Commit
     Auto-fix issues + commit + push
```

## 🔧 Configuration

### Conventional Commits
The scripts follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Supported Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts

### Supported Scopes
- `components`: React components
- `hooks`: Custom hooks
- `utils`: Utility functions
- `services`: API services
- `store`: State management
- `tests`: Test files
- `config`: Configuration
- `workflows`: CI/CD workflows
- `deps`: Dependencies

## 🚨 Troubleshooting

### No Staged Changes
```bash
# Error: No staged changes detected
# Solution: Stage your changes first
git add .
npm run commit
```

### Permission Denied
```bash
# Error: Permission denied
# Solution: Make scripts executable
chmod +x scripts/commit.sh
chmod +x scripts/dev-flow.js
```

### Git Not Found
```bash
# Error: Not a git repository
# Solution: Initialize git or run from project root
git init
# or
cd /path/to/your/project
```

### Node.js Not Found
```bash
# Error: node: command not found
# Solution: Install Node.js
# Visit: https://nodejs.org/
```

## 💡 Tips and Best Practices

### Before Committing
1. **Review your changes**: `git diff`
2. **Run quality checks**: `npm run ci:check`
3. **Stage relevant files**: `git add <files>`
4. **Use AI commit**: `npm run commit`

### Development Workflow
1. **Make changes** to your code
2. **Test locally**: `npm run pipeline:quality`
3. **Use development flow**: `npm run flow:safe`
4. **Push to remote**: Included in flow or manual `git push`

### Commit Message Quality
- ✅ Use AI suggestions as starting point
- ✅ Customize messages for clarity
- ✅ Include scope when relevant
- ✅ Keep first line under 50 characters
- ✅ Use imperative mood ("add" not "added")

### Integration with CI/CD
- Scripts validate code before committing
- Reduces CI/CD failures
- Maintains code quality standards
- Follows project conventions

## 🔗 Integration

### Git Hooks
You can integrate these scripts with git hooks:

```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run ci:check
```

### IDE Integration
Add to your IDE's external tools:
- **Command**: `npm run commit`
- **Working Directory**: `$ProjectFileDir$`

### Alias Setup
Add to your shell profile:
```bash
alias commit="npm run commit"
alias flow="npm run flow"
alias quick="npm run flow:quick"
```

## 🎯 Benefits

- 🤖 **AI-powered**: Intelligent commit message generation
- ⚡ **Fast**: Quick workflows for daily development
- 🛡️ **Safe**: Quality validation before commits
- 📊 **Informative**: Detailed change analysis
- 🎮 **Interactive**: User-friendly interfaces
- 🔄 **Automated**: Complete development workflows
- 📝 **Consistent**: Follows conventional commit standards
- 🚀 **Productive**: Reduces manual work and errors