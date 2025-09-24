# Dependency Cleanup Plan - CSS Architecture Refactor

## Current State (Task 8.1.4 Analysis)

### Tailwind Dependencies Audit Results

**Dependencies Found:**
- `tailwindcss@^3.4.17` (devDependency)

**Configuration Files:**
- `config/postcss.config.js` - Contains Tailwind plugin
- `config/tailwind.config.js` - Tailwind configuration file

**Blocking Issues (Cannot Remove Yet):**
- ✅ 3 Tailwind directives in `src/index.css` (@tailwind base, components, utilities)
- ✅ 677 @apply directives across CSS files
- ✅ 139 Tailwind classes in TSX files

## Removal Prerequisites

Before Tailwind dependencies can be safely removed, the following tasks must be completed:

### 1. Complete CSS Architecture Refactor
- [ ] Remove all @tailwind directives from `src/index.css` (Task 9.1)
- [ ] Convert all 677 @apply directives to pure CSS with design tokens (Task 9.2)
- [ ] Remove all 139 Tailwind classes from TSX files (Task 13.1-13.3)

### 2. Update Build Configuration
- [ ] Remove tailwindcss plugin from `config/postcss.config.js` (Task 10.1)
- [ ] Remove `config/tailwind.config.js` file (Task 10.2)
- [ ] Update Vite configuration for pure CSS architecture (Task 10.3)

### 3. Verify No Regressions
- [ ] Run full test suite with pure CSS architecture
- [ ] Verify all 4 theme contexts work correctly
- [ ] Confirm bundle sizes remain under 500KB per chunk

## Safe Removal Process

Once all prerequisites are met, follow this process:

### Step 1: Remove Dependencies
```bash
npm uninstall tailwindcss
```

### Step 2: Update PostCSS Configuration
```javascript
// config/postcss.config.js
export default {
  plugins: {
    // Remove: tailwindcss: { config: resolve(__dirname, './tailwind.config.js') },
    autoprefixer: {}, // Keep for vendor prefixes
  },
};
```

### Step 3: Remove Configuration Files
```bash
rm config/tailwind.config.js
```

### Step 4: Update Package.json Scripts
Remove or update any scripts that reference Tailwind:
- Update build scripts if they reference Tailwind config
- Remove Tailwind-specific validation scripts

### Step 5: Verification
```bash
# Verify no Tailwind references remain
npm run css:audit-deps

# Verify build works without Tailwind
npm run build

# Verify tests pass
npm run test

# Verify CSS validation passes
npm run css:validate
```

## Monitoring Script

Use the audit script to monitor progress:

```bash
# Check current Tailwind usage status
npm run css:audit-deps
```

This script will:
- ✅ Identify Tailwind dependencies in package.json
- ✅ Check PostCSS configuration for Tailwind plugin
- ✅ Detect Tailwind config file
- ✅ Count @tailwind directives in CSS files
- ✅ Count @apply directives in CSS files
- ✅ Count Tailwind classes in TSX files
- ✅ Provide removal recommendations

## Expected Timeline

Based on the current task structure:

1. **Phase 9** (Task 9): Remove Tailwind from src/index.css
2. **Phase 10** (Task 10): Update build configuration
3. **Phase 13** (Task 13): Complete component refactoring
4. **Phase 8.1.4** (This task): Safe dependency removal

## Risk Mitigation

### Backup Strategy
- Maintain `backup/css-hybrid` branch with current Tailwind setup
- Test removal in feature branch before merging to main
- Keep rollback procedure documented

### Validation Strategy
- Run full test suite before and after removal
- Verify visual consistency across all 4 theme contexts
- Monitor bundle size changes
- Test build process in CI/CD environment

## Success Criteria

Tailwind dependencies can be considered safely removed when:

1. ✅ `npm run css:audit-deps` exits with code 0
2. ✅ `npm run build` completes successfully
3. ✅ `npm run test` passes all tests
4. ✅ `npm run css:validate` passes all validations
5. ✅ Visual regression tests pass in all 4 theme contexts
6. ✅ Bundle sizes remain under 500KB per chunk
7. ✅ No Tailwind references remain in codebase

## Current Status: NOT READY FOR REMOVAL

**Reason:** CSS architecture refactor is still in progress. Tailwind is actively used in:
- Build process (PostCSS plugin)
- CSS files (677 @apply directives)
- Component files (139 Tailwind classes)

**Next Steps:** Complete tasks 9, 10, and 13 before attempting dependency removal.