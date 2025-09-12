# English4 Controlled Evolution - Baseline State Documentation

## Overview
This document captures the complete baseline state before implementing the English4 controlled evolution from B2-C2 coverage to full A1-C2 coverage.

**Backup Tag**: `english4-backup-baseline`
**Date**: 2025-01-09
**Commit**: bd0b636 (HEAD -> main, tag: v0.1, origin/main)

## System Status Verification

### Build Status ✅
- **Command**: `npm run build`
- **Status**: SUCCESS
- **Duration**: 9.49s
- **Output Size**: 802.29 kB main bundle (gzipped: 226.32 kB)
- **Warning**: Large chunks detected (>500kB) - expected for current state

### Test Status ✅
- **Command**: `npm test -- --run`
- **Status**: ALL PASSING
- **Results**: 25 passed | 11 skipped (36 total)
- **Duration**: 5.07s
- **Test Files**: 7 passed (7)

### Current Module Count
- **Total Modules**: 21 modules (B2-C2 coverage only)
- **Distribution**:
  - Flashcard: 8 modules
  - Quiz: 10 modules  
  - Completion: 3 modules
  - Matching: 2 modules (demo/sample)
  - Sorting: 2 modules

### Data Architecture (Current - Problematic)
```
src/assets/data/              # ❌ Source location (not copied to build in production)
├── app-config.json           # ✅ Present in build
├── learningModules.json      # ✅ Present in build  
├── completion-*.json         # ✅ Present in build (3 files)
├── flashcard-*.json          # ✅ Present in build (8 files)
├── quiz-*.json               # ✅ Present in build (10 files)
├── matching-*.json           # ✅ Present in build (2 files)
└── sorting-*.json            # ✅ Present in build (2 files)

public/src/assets/data/       # ✅ Files copied to dist/src/assets/data/ (33 files total)
```

### Current Categories (Hardcoded)
```typescript
// In settingsStore.ts - Version 1
categories: ["Vocabulary", "Grammar", "PhrasalVerbs", "Idioms"]  // 4 categories only
```

### Current Levels Coverage
- **A1**: ❌ No modules
- **A2**: ❌ No modules  
- **B1**: ❌ No modules
- **B2**: ✅ 7 modules
- **C1**: ✅ 8 modules
- **C2**: ✅ 8 modules

### Prerequisites System
- **Status**: ❌ Not implemented
- **Current**: All modules accessible immediately
- **Needed**: A1→A2→B1→B2→C1→C2 progression

## File Inventory

### Core Application Files
- `src/App.tsx` - Main application component
- `src/main.tsx` - Application entry point
- `src/index.css` - Global styles
- `package.json` - Dependencies and scripts

### Configuration Files
- `config/vite.config.ts` - Build configuration
- `config/tsconfig.json` - TypeScript configuration
- `config/tailwind.config.js` - Tailwind CSS configuration
- `config/vitest.config.ts` - Test configuration

### Store Files
- `src/stores/settingsStore.ts` - Settings management (Version 1)
- `src/stores/appStore.ts` - Application state
- `src/stores/progressStore.ts` - Progress tracking
- `src/stores/userStore.ts` - User data
- `src/stores/toastStore.ts` - Toast notifications

### Service Files
- `src/services/api.ts` - Data fetching service
- `src/utils/pathUtils.ts` - Path resolution utilities

### Component Files
- `src/components/learning/` - Learning mode components (5 files)
- `src/components/ui/` - UI components (15 files)
- `src/components/common/` - Common components (2 files)

### Data Files (33 total)
All currently located in `public/src/assets/data/` and successfully copied to build.

## Critical Issues Identified

### 1. Data Location Issue ⚠️
- **Problem**: Files in `src/assets/data/` are not reliably copied to production builds
- **Current Workaround**: Files are in `public/src/assets/data/` (working)
- **Solution Needed**: Ensure all new modules go to `public/src/assets/data/`

### 2. Hardcoded Categories ⚠️
- **Problem**: Only 4 categories hardcoded in settingsStore
- **Impact**: Cannot add new categories without code changes
- **Solution Needed**: Dynamic category loading from app-config.json

### 3. No Prerequisites System ⚠️
- **Problem**: All modules accessible immediately
- **Impact**: Poor pedagogical progression
- **Solution Needed**: Implement A1→A2→B1→B2→C1→C2 progression

### 4. Inconsistent Data Formats ⚠️
- **Problem**: Mixed formats in matching modules (term/definition vs left/right)
- **Impact**: Component complexity and maintenance issues
- **Solution Needed**: Standardize to {left, right, explanation} format

## Rollback Instructions

### Quick Rollback (Emergency)
```bash
# Reset to baseline state
git reset --hard english4-backup-baseline
git clean -fd

# Verify rollback
npm test -- --run
npm run build
```

### Selective Rollback (Partial)
```bash
# Reset specific files/directories
git checkout english4-backup-baseline -- src/assets/data/
git checkout english4-backup-baseline -- src/stores/settingsStore.ts
git checkout english4-backup-baseline -- src/services/api.ts

# Verify functionality
npm test -- --run
```

### Verification After Rollback
1. Run tests: `npm test -- --run` (should show 25 passed | 11 skipped)
2. Build app: `npm run build` (should complete in ~9s)
3. Check modules: All 21 B2-C2 modules should be accessible
4. Check categories: Should show 4 categories (Vocabulary, Grammar, PhrasalVerbs, Idioms)

## Success Criteria for Evolution

### Phase Completion Criteria
- [ ] All existing tests continue to pass
- [ ] Build completes successfully
- [ ] All 21 existing modules remain functional
- [ ] New A1-B1 modules load correctly (19 new modules)
- [ ] Prerequisites system works (A1→A2→B1 progression)
- [ ] Dynamic categories system functional (10 categories)
- [ ] Performance remains acceptable (<2s module load)

### Rollback Triggers
- Any existing test fails
- Build process fails
- Existing modules become non-functional
- Performance degrades significantly (>5s module load)
- Data corruption or loss detected

## Environment Information
- **Node.js**: Current version in use
- **Package Manager**: npm
- **Build Tool**: Vite 6.3.5
- **Test Framework**: Vitest 2.1.9
- **TypeScript**: Configured with strict mode
- **CSS Framework**: Tailwind CSS

## Next Steps
1. Proceed with Task 2: Migración Crítica de Arquitectura de Datos
2. Monitor all success criteria during implementation
3. Create incremental backups after each major phase
4. Document any deviations from this baseline state

---
**Generated**: 2025-01-09 23:36 UTC
**Git Tag**: english4-backup-baseline
**Commit**: bd0b636