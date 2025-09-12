# Pipeline Runner Scripts

Quick and easy way to run CI/CD pipelines locally, replicating exactly what runs in GitHub Actions.

## 🚀 Quick Start

### Interactive Mode (Recommended)
```bash
npm run pipeline
# or
node scripts/pipeline-runner.js
```

### Command Line Mode
```bash
# JavaScript version
node scripts/pipeline-runner.js quality
node scripts/pipeline-runner.js all

# Bash version  
./scripts/pipeline.sh quality
./scripts/pipeline.sh all
```

### NPM Scripts
```bash
npm run pipeline:interactive  # Interactive menu
npm run pipeline:bash         # Bash version help
```

## 📋 Available Pipelines

### 🎯 Quality Pipeline
**Command:** `quality` or `q`
**NPM Script:** `npm run pipeline:quality`

Runs all quality checks:
- ✅ ESLint code linting
- ✅ TypeScript type checking
- ✅ Unit tests
- ✅ Integration tests  
- ✅ Code formatting (Prettier)

### 🛡️ Security Pipeline
**Command:** `security` or `s`
**NPM Script:** `npm run pipeline:security`

Runs all security checks:
- ✅ Dependency vulnerability scan (moderate level)
- ✅ Production dependencies audit (high level)
- ✅ Critical vulnerabilities check
- ✅ Security patterns scan (eval, dangerouslySetInnerHTML, etc.)

### 📦 Build Pipeline
**Command:** `build` or `b`
**NPM Script:** `npm run pipeline:build`

Runs build process:
- ✅ Application compilation
- ✅ Build output verification
- ✅ Bundle size analysis

### 🚀 All Pipelines
**Command:** `all` or `a`
**NPM Script:** `npm run pipeline:all`

Runs all three pipelines in sequence:
1. Quality Pipeline
2. Security Pipeline  
3. Build Pipeline

### ⚡ Quick CI Check
**Command:** `ci-check` or `c`
**NPM Script:** `npm run ci:check`

Fast essential checks:
- ✅ ESLint
- ✅ TypeScript
- ✅ Unit tests
- ✅ Build

### 🎭 Local CI/CD
**Command:** `ci-local` or `l`
**NPM Script:** `npm run ci:local`

Full CI simulation (without deployment):
- ✅ All pipelines
- ✅ Same as GitHub Actions (minus deploy)

### 🔄 Full CI Simulation
**Command:** `ci-full` or `f`
**NPM Script:** `npm run ci:full`

Complete CI simulation:
- ✅ Fresh dependency install (`npm ci`)
- ✅ All pipelines
- ✅ Exact CI environment simulation

## 🛠️ Usage Examples

### Before Committing
```bash
# Quick check
./scripts/pipeline.sh c

# Full quality check
./scripts/pipeline.sh quality
```

### Before Pushing
```bash
# Run all pipelines
./scripts/pipeline.sh all

# Or use interactive mode
npm run pipeline
```

### Debugging CI Failures
```bash
# If Quality Pipeline fails in CI
./scripts/pipeline.sh quality

# If Security Pipeline fails in CI
./scripts/pipeline.sh security

# If Build Pipeline fails in CI
./scripts/pipeline.sh build

# Get debug information
./scripts/pipeline.sh debug
```

### Full Local Testing
```bash
# Simulate complete CI process
./scripts/pipeline.sh ci-full
```

## 🎮 Interactive Mode Features

The JavaScript version (`npm run pipeline`) provides:

- 🎨 **Colorized output** with emojis
- ⏱️ **Execution timing** for each step
- 📊 **Progress indicators** and status
- 🐛 **Debug information** collection
- 🔄 **Menu-driven interface**
- ⌨️ **Keyboard shortcuts** (q, s, b, a, c, f, d, h, x)

## 🔧 Script Features

### JavaScript Version (`pipeline-runner.js`)
- ✅ Interactive menu system
- ✅ Colorized output with timing
- ✅ Command line arguments support
- ✅ Debug information collection
- ✅ Error handling and reporting
- ✅ Cross-platform compatibility

### Bash Version (`pipeline.sh`)
- ✅ Fast execution
- ✅ Simple command interface
- ✅ Colorized output
- ✅ Unix/Linux optimized
- ✅ Lightweight and fast

## 📊 Output Examples

### Success Output
```
🎯 Quality Pipeline - Starting Execution
Description: ESLint, TypeScript, Tests, Formatting

🔄 🎯 Quality Pipeline...
✅ 🎯 Quality Pipeline completed in 45.2s
```

### Failure Output
```
🛡️ Security Pipeline - Starting Execution
Description: Vulnerabilities, Secrets, Licenses

🔄 🛡️ Security Pipeline...
❌ 🛡️ Security Pipeline failed after 12.3s
```

## 🚨 Troubleshooting

### Permission Denied (Bash Script)
```bash
chmod +x scripts/pipeline.sh
```

### Node.js Not Found
Make sure Node.js is installed and in your PATH:
```bash
node --version
npm --version
```

### Package.json Not Found
Run scripts from the project root directory where `package.json` is located.

### Pipeline Failures
1. Check the detailed error output
2. Run `./scripts/pipeline.sh debug` for environment info
3. Fix issues locally
4. Re-run the specific failed pipeline

## 🔗 Integration with CI/CD

These scripts replicate exactly what runs in GitHub Actions:

| Local Script | GitHub Actions Workflow |
|-------------|-------------------------|
| `pipeline:quality` | `.github/workflows/quality.yml` |
| `pipeline:security` | `.github/workflows/security.yml` |
| `pipeline:build` | `.github/workflows/build.yml` |
| `pipeline:all` | All three workflows |
| `ci:local` | `.github/workflows/ci.yml` (minus deploy) |

## 💡 Tips

1. **Use `ci:check` for quick feedback** during development
2. **Use `pipeline:all` before pushing** to catch issues early
3. **Use `ci:full` to simulate exact CI environment** when debugging
4. **Use interactive mode** for exploring and learning the pipelines
5. **Use bash version** for scripting and automation

## 🎯 Benefits

- ⚡ **Faster feedback** - catch issues before CI
- 🐛 **Easy debugging** - reproduce CI failures locally  
- 🔄 **Exact replication** - same commands as CI/CD
- 🎮 **User-friendly** - interactive and command-line modes
- 📊 **Detailed reporting** - timing and status information
- 🛠️ **Developer productivity** - integrated into workflow