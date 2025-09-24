# CSS Architecture Rollback Procedures

## Overview

This document provides comprehensive rollback procedures for the CSS architecture refactor from hybrid (BEM + Tailwind + @apply) to pure BEM with design tokens. These procedures ensure safe recovery in case of critical issues.

## Backup Branch Information

### Backup Branch Details
- **Branch Name**: `backup/css-hybrid`
- **Created**: During task 1.1 (Pre-Migration Setup)
- **Contains**: Complete hybrid CSS architecture before refactor
- **Retention**: Minimum 30 days from refactor completion
- **Purpose**: Full system rollback capability

### Backup Branch Contents
```
backup/css-hybrid/
├── src/index.css                    # Original hybrid CSS with @tailwind and @apply
├── src/styles/
│   ├── theme-fix.css               # Original patch files
│   ├── mobile-theme-fix.css        # Original mobile patches
│   ├── safari-mobile-fix.css       # Original Safari fixes
│   └── components/                 # Original component CSS with @apply
├── config/
│   ├── postcss.config.js          # Original PostCSS with Tailwind
│   └── tailwind.config.js          # Original Tailwind configuration
├── package.json                    # Original dependencies with Tailwind
└── tests/                          # Original test suite for hybrid architecture
```

## Rollback Scenarios and Procedures

### Scenario 1: Critical Visual Regression

**Symptoms:**
- Components not rendering correctly
- Theme switching broken
- Accessibility issues
- Performance degradation > 20%

**Immediate Response (< 5 minutes):**
```bash
# 1. Stop current deployment
git checkout main

# 2. Quick rollback to backup branch
git checkout backup/css-hybrid

# 3. Create emergency rollback branch
git checkout -b emergency/css-rollback-$(date +%Y%m%d-%H%M)

# 4. Force push to main (if needed for production)
git push origin emergency/css-rollback-$(date +%Y%m%d-%H%M):main --force

# 5. Verify rollback
npm install
npm run build
npm run test
```

### Scenario 2: Build Process Failure

**Symptoms:**
- Build fails due to CSS processing
- PostCSS errors
- Vite configuration issues
- Missing dependencies

**Rollback Procedure:**
```bash
# 1. Restore build configuration
git checkout backup/css-hybrid -- config/postcss.config.js
git checkout backup/css-hybrid -- config/tailwind.config.js
git checkout backup/css-hybrid -- config/vite.config.ts

# 2. Restore package.json dependencies
git checkout backup/css-hybrid -- package.json
npm install

# 3. Test build process
npm run build

# 4. If successful, commit and deploy
git add .
git commit -m "Rollback: Restore build configuration"
git push
```

### Scenario 3: Partial Component Rollback

**Symptoms:**
- Specific component broken
- Other components working fine
- Need granular rollback

**Selective Rollback Procedure:**
```bash
# 1. Identify problematic component
COMPONENT_NAME="MatchingComponent"

# 2. Restore component files
git checkout backup/css-hybrid -- "src/components/**/${COMPONENT_NAME}*"
git checkout backup/css-hybrid -- "src/styles/components/${COMPONENT_NAME,,}*"

# 3. Restore component tests
git checkout backup/css-hybrid -- "tests/**/*${COMPONENT_NAME}*"

# 4. Test component in isolation
npm run test -- --testNamePattern="${COMPONENT_NAME}"

# 5. If successful, commit changes
git add .
git commit -m "Rollback: Restore ${COMPONENT_NAME} to hybrid architecture"
```

### Scenario 4: Performance Regression

**Symptoms:**
- Bundle size increased > 500KB per chunk
- Theme switching > 100ms
- CSS loading performance issues

**Performance Rollback:**
```bash
# 1. Check current performance metrics
npm run css:bundle-check
npm run css:analyze

# 2. Restore performance-critical files
git checkout backup/css-hybrid -- src/index.css
git checkout backup/css-hybrid -- src/styles/themes/
git checkout backup/css-hybrid -- config/vite.config.ts

# 3. Restore Tailwind for performance
git checkout backup/css-hybrid -- config/postcss.config.js
git checkout backup/css-hybrid -- config/tailwind.config.js

# 4. Restore dependencies
git checkout backup/css-hybrid -- package.json
npm install

# 5. Verify performance improvement
npm run build
npm run css:bundle-check
```

## Automated Rollback Scripts

### Emergency Rollback Script
```bash
#!/bin/bash
# scripts/emergency-css-rollback.sh

set -e

echo "🚨 Emergency CSS Architecture Rollback"
echo "======================================"

# Backup current state
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
git checkout -b "emergency/pre-rollback-${TIMESTAMP}"
git add .
git commit -m "Emergency backup before CSS rollback" || true

# Switch to backup branch
echo "📦 Switching to backup branch..."
git checkout backup/css-hybrid

# Create rollback branch
ROLLBACK_BRANCH="emergency/css-rollback-${TIMESTAMP}"
git checkout -b "${ROLLBACK_BRANCH}"

# Restore critical files
echo "🔄 Restoring critical files..."
cp -r src/styles/ src/styles-rollback/
cp src/index.css src/index.css.rollback
cp config/postcss.config.js config/postcss.config.js.rollback
cp config/tailwind.config.js config/tailwind.config.js.rollback
cp package.json package.json.rollback

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Test build
echo "🔨 Testing build..."
npm run build

# Test basic functionality
echo "🧪 Running tests..."
npm run test:unit

echo "✅ Emergency rollback completed"
echo "Branch: ${ROLLBACK_BRANCH}"
echo "Next steps:"
echo "1. Review changes: git diff main"
echo "2. Deploy if needed: git push origin ${ROLLBACK_BRANCH}:main"
echo "3. Investigate original issue"
```

### Selective Component Rollback Script
```bash
#!/bin/bash
# scripts/rollback-component.sh

COMPONENT_NAME=$1

if [ -z "$COMPONENT_NAME" ]; then
  echo "Usage: ./rollback-component.sh <ComponentName>"
  exit 1
fi

echo "🔄 Rolling back component: ${COMPONENT_NAME}"

# Create rollback branch
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ROLLBACK_BRANCH="rollback/${COMPONENT_NAME,,}-${TIMESTAMP}"
git checkout -b "${ROLLBACK_BRANCH}"

# Restore component files
echo "📦 Restoring component files..."
git checkout backup/css-hybrid -- "src/components/**/*${COMPONENT_NAME}*" || true
git checkout backup/css-hybrid -- "src/styles/components/*${COMPONENT_NAME,,}*" || true
git checkout backup/css-hybrid -- "tests/**/*${COMPONENT_NAME}*" || true

# Test component
echo "🧪 Testing component..."
npm run test -- --testNamePattern="${COMPONENT_NAME}"

echo "✅ Component rollback completed"
echo "Branch: ${ROLLBACK_BRANCH}"
```

## Rollback Validation Checklist

### Pre-Rollback Validation
- [ ] Identify specific issue and scope
- [ ] Determine if partial or full rollback needed
- [ ] Create backup of current state
- [ ] Notify team of rollback procedure
- [ ] Document issue for post-mortem

### Post-Rollback Validation
- [ ] Build process completes successfully
- [ ] All tests pass
- [ ] Visual regression tests pass
- [ ] Performance metrics within acceptable range
- [ ] Theme switching works correctly
- [ ] Accessibility compliance maintained
- [ ] Bundle sizes under targets

### Rollback Testing Procedure
```bash
# 1. Build validation
npm run build
echo "✅ Build completed"

# 2. Test suite validation
npm run test
echo "✅ Tests passed"

# 3. CSS validation
npm run css:validate
echo "✅ CSS validation passed"

# 4. Performance validation
npm run css:bundle-check
echo "✅ Bundle size validation passed"

# 5. Visual validation (manual)
npm run dev
echo "🔍 Manual visual validation required"
```

## Recovery Procedures

### After Successful Rollback

1. **Immediate Actions:**
   - Document the issue that caused rollback
   - Notify stakeholders of rollback completion
   - Monitor system stability
   - Plan investigation and fix

2. **Investigation Phase:**
   - Analyze root cause of failure
   - Review rollback effectiveness
   - Identify prevention measures
   - Update rollback procedures if needed

3. **Recovery Planning:**
   - Create fix strategy
   - Plan re-implementation approach
   - Schedule testing and validation
   - Prepare communication plan

### Rollback Branch Maintenance

```bash
# Keep backup branch updated (weekly)
git checkout backup/css-hybrid
git merge main --no-commit --no-ff
git reset --hard HEAD  # Discard merge if conflicts

# Extend backup retention if needed
git tag "backup/css-hybrid-$(date +%Y%m%d)" backup/css-hybrid
git push origin "backup/css-hybrid-$(date +%Y%m%d)"

# Clean up old rollback branches (monthly)
git branch -D $(git branch | grep "emergency/css-rollback" | head -n -5)
```

## Communication Templates

### Rollback Notification Template
```
Subject: [URGENT] CSS Architecture Rollback Initiated

Team,

We have initiated a rollback of the CSS architecture refactor due to:
- Issue: [Description]
- Impact: [Scope and severity]
- Rollback Type: [Full/Partial/Component-specific]

Current Status:
- Rollback Branch: [branch-name]
- ETA: [estimated completion time]
- Next Steps: [immediate actions]

We will provide updates every 15 minutes until resolution.

[Your Name]
```

### Rollback Completion Template
```
Subject: [RESOLVED] CSS Architecture Rollback Completed

Team,

The CSS architecture rollback has been completed successfully.

Summary:
- Issue: [Original problem]
- Rollback Completed: [timestamp]
- System Status: Stable
- Performance: Within normal parameters

Next Steps:
1. Root cause analysis scheduled for [date/time]
2. Fix development planning session [date/time]
3. Re-implementation timeline TBD

All systems are now operating normally.

[Your Name]
```

## Monitoring and Alerts

### Post-Rollback Monitoring
- Bundle size monitoring (< 500KB per chunk)
- Theme switching performance (< 100ms)
- Build time monitoring
- Test suite success rate
- User-reported issues

### Alert Thresholds
- Bundle size > 500KB: Immediate alert
- Theme switching > 100ms: Warning
- Build failure: Immediate alert
- Test failure rate > 5%: Warning
- User reports > 3 in 1 hour: Investigation

## Lessons Learned Integration

### Post-Rollback Review Process
1. **Immediate Review (within 24 hours):**
   - What went wrong?
   - Was rollback procedure effective?
   - What could be improved?

2. **Detailed Analysis (within 1 week):**
   - Root cause analysis
   - Prevention strategies
   - Rollback procedure updates
   - Testing improvements

3. **Process Updates:**
   - Update rollback procedures
   - Improve monitoring and alerts
   - Enhance testing coverage
   - Document new patterns

This comprehensive rollback documentation ensures safe recovery from any CSS architecture issues while maintaining system stability and team confidence.