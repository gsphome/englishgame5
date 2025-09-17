# CI Coverage Issues - Troubleshooting Guide

## 🚨 Common Coverage Issues in CI

### Issue: "lcov.info not found"

**Symptoms:**
- CI fails at coverage upload step
- Local tests pass but CI fails
- Error: `Error: Unable to locate coverage file`

**Diagnosis:**
```bash
# Run locally to check
npm run ci:diagnose
npm run test:coverage:validate
```

**Solutions:**

1. **Check Vitest Config:**
   ```typescript
   // config/vitest.config.ts
   coverage: {
     reporter: ['text', 'json', 'html', 'lcov'], // ← Must include 'lcov'
   }
   ```

2. **Verify File Generation:**
   ```bash
   npm run test:coverage
   ls -la coverage/lcov.info  # Should exist
   ```

3. **Check CI Environment:**
   - Node.js version matches local
   - Dependencies installed correctly
   - No permission issues

### Issue: "Coverage upload fails"

**Possible Causes:**
- GitHub Action version incompatibility
- Codecov token issues
- Network connectivity in CI

**Solutions:**

1. **Add Debugging:**
   ```yaml
   - name: Upload coverage
     uses: codecov/codecov-action@v4
     with:
       verbose: true
       fail_ci_if_error: false  # Don't fail CI if coverage fails
   ```

2. **Check Token:**
   - Verify `CODECOV_TOKEN` is set in repository secrets
   - Token has correct permissions

### Issue: "Coverage thresholds not met"

**Solutions:**
1. **Adjust Thresholds:**
   ```typescript
   thresholds: {
     global: {
       branches: 60,  // Lower if needed
       functions: 60,
       lines: 60,
       statements: 60
     }
   }
   ```

2. **Exclude Test Files:**
   ```typescript
   exclude: [
     'tests/**',
     '**/*.test.{ts,tsx}',
     '**/*.spec.{ts,tsx}'
   ]
   ```

## 🔧 Debugging Commands

```bash
# Full diagnostic
npm run ci:diagnose

# Validate coverage generation
npm run test:coverage:validate

# Check coverage locally
npm run test:coverage
open coverage/index.html  # View report

# Check CI logs
# Look for specific error messages in GitHub Actions
```

## 🎯 Prevention Strategies

1. **Pin Critical Dependencies:**
   ```json
   {
     "devDependencies": {
       "vitest": "^3.2.4",  // Pin major version
       "@vitest/coverage-v8": "^3.2.4"
     }
   }
   ```

2. **Test Coverage Locally:**
   ```bash
   # Always test before pushing
   npm run test:coverage:validate
   ```

3. **Monitor CI Changes:**
   - Watch for GitHub Actions runner updates
   - Monitor codecov-action releases
   - Test in staging environment

## 📚 Useful Resources

- [Vitest Coverage Config](https://vitest.dev/config/#coverage)
- [Codecov Action Docs](https://github.com/codecov/codecov-action)
- [GitHub Actions Debugging](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)

## 🆘 Emergency Fixes

If coverage is blocking deployment:

1. **Temporary Disable:**
   ```yaml
   - name: Upload coverage
     if: false  # Temporarily disable
   ```

2. **Make Non-Blocking:**
   ```yaml
   - name: Upload coverage
     continue-on-error: true
   ```

3. **Skip Coverage:**
   ```bash
   # In CI script
   npm run test:unit  # Skip coverage generation
   ```