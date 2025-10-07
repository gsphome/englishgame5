# FluentFlow Documentation

## Overview

This directory contains all project documentation organized by category for easy navigation and maintenance.

## Directory Structure

```
docs/
├── architecture/           # System architecture and design patterns
│   ├── ai-css-development-guide.md    # AI development patterns for CSS
│   ├── ai-anti-patterns.md            # Anti-patterns to avoid
│   ├── design-system-guidelines.md    # Design system guidelines
│   ├── bem-theme-architecture.md      # BEM and theme architecture
│   ├── css-architecture-*.md          # CSS architecture documentation
│   └── css-specificity-architecture.md # CSS specificity guidelines
├── configuration/          # Setup and configuration guides
│   └── environment-setup.md           # Environment variables guide
├── development/            # Development workflows and patterns
│   ├── ai-development-workflow.md     # AI development process
│   ├── ai-safe-modification-patterns.md # Safe modification patterns
│   └── lazy-loading-patterns.md       # Lazy loading implementation
├── audits/                 # Code audits and verification reports
│   ├── ai-readiness-verification-report.md # AI readiness assessment
│   ├── dependency-cleanup-plan.md     # Dependency audit results
│   └── *-audit*.md                   # Various audit reports
├── performance/            # Performance optimization documentation
│   ├── bundle-*.md                   # Bundle optimization reports
│   ├── performance-monitoring.md     # Performance monitoring setup
│   └── *-optimization.md             # Various optimization guides
├── ui-ux/                  # UI/UX improvements and design fixes
│   ├── compact-*.md                  # Compact design implementations
│   ├── dark-mode-*.md                # Dark mode improvements
│   ├── *-contrast-*.md               # Contrast enhancement fixes
│   └── visual-hierarchy-alignment.md # Visual hierarchy improvements
├── fixes/                  # Specific bug fixes and corrections
│   ├── consistency-*.md              # Consistency fixes
│   ├── container-*.md                # Container-related fixes
│   ├── *-alignment*.md               # Alignment corrections
│   └── MATCHING_FIXES_SUMMARY.md     # Summary of matching fixes
├── implementation/         # Implementation reports and summaries
│   ├── phase-*.md                    # Phase implementation reports
│   ├── level-*.md                    # Level consolidation reports
│   ├── task-*.md                     # Task completion summaries
│   └── cleanup-summary.md            # Cleanup implementation summary
├── troubleshooting/        # Problem-solving guides
│   ├── ai-troubleshooting-guide.md   # AI development troubleshooting
│   ├── build-warnings.md             # Build warning solutions
│   └── ci-coverage-issues.md         # CI/CD troubleshooting
├── performance-snapshots/  # Performance monitoring data
└── *.md                   # Root level documentation and reports
```

## Key Documentation

### For Developers

- **[AI CSS Development Guide](./architecture/ai-css-development-guide.md)** - Comprehensive guide for AI-assisted CSS development
- **[AI Anti-Patterns](./architecture/ai-anti-patterns.md)** - Patterns to avoid in AI development
- **[Environment Setup](./configuration/environment-setup.md)** - Environment configuration guide
- **[AI Development Workflow](./development/ai-development-workflow.md)** - Complete AI development process
- **[AI Troubleshooting Guide](./troubleshooting/ai-troubleshooting-guide.md)** - Common AI development issues

### Architecture & Design

- **[Design System Guidelines](./architecture/design-system-guidelines.md)** - Design system implementation
- **[BEM Theme Architecture](./architecture/bem-theme-architecture.md)** - BEM methodology and theming
- **[CSS Architecture Patterns](./architecture/css-architecture-patterns.md)** - CSS organization patterns
- **[CSS Specificity Architecture](./architecture/css-specificity-architecture.md)** - CSS specificity guidelines

### Performance & Optimization

- **[Performance Monitoring](./performance/performance-monitoring.md)** - Performance tracking setup
- **[Bundle Optimization](./performance/bundle-optimization-summary.md)** - Bundle size optimization
- **[Lazy Loading Patterns](./development/lazy-loading-patterns.md)** - Lazy loading implementation

### UI/UX Documentation

- **[Compact Design Adjustments](./ui-ux/compact-design-adjustments.md)** - Compact UI implementation
- **[Dark Mode Improvements](./ui-ux/dark-mode-contrast-fixes.md)** - Dark mode enhancements
- **[Visual Hierarchy](./ui-ux/visual-hierarchy-alignment.md)** - Visual hierarchy improvements

### Implementation Reports

The root level contains numerous implementation reports documenting specific fixes, optimizations, and feature implementations. These serve as historical records and reference materials for similar future work.

## Recent Reorganization

**Date**: October 2025

**Changes Made**:
- Moved documentation files from `src/` to `docs/` for better organization
- Created structured subdirectories for different documentation types
- Updated all internal references to reflect new locations
- Maintained backward compatibility where possible

**Files Moved**:
- `src/styles/README-AI.md` → `docs/architecture/ai-css-development-guide.md`
- `src/styles/AI-ANTI-PATTERNS.md` → `docs/architecture/ai-anti-patterns.md`
- `src/styles/design-system/enhancement-guidelines.md` → `docs/architecture/design-system-guidelines.md`
- `config/ENV_CONFIG.md` → `docs/configuration/environment-setup.md`

## Contributing to Documentation

When adding new documentation:

1. **Choose the appropriate directory** based on content type
2. **Use descriptive filenames** with kebab-case
3. **Update this README** if adding new categories
4. **Cross-reference related documents** using relative links
5. **Follow the established markdown formatting** patterns

## Maintenance

Documentation should be:
- **Kept up-to-date** with code changes
- **Reviewed regularly** for accuracy
- **Organized logically** for easy discovery
- **Cross-referenced** appropriately

For questions about documentation organization or content, refer to the project's development guidelines or create an issue.