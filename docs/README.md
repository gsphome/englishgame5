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
│   └── bem-theme-architecture.md      # BEM and theme architecture
├── configuration/          # Setup and configuration guides
│   └── environment-setup.md           # Environment variables guide
├── troubleshooting/        # Problem-solving guides
│   └── ci-coverage-issues.md          # CI/CD troubleshooting
├── performance-snapshots/  # Performance monitoring data
└── *.md                   # Implementation reports and fixes
```

## Key Documentation

### For Developers

- **[AI CSS Development Guide](./architecture/ai-css-development-guide.md)** - Comprehensive guide for AI-assisted CSS development
- **[AI Anti-Patterns](./architecture/ai-anti-patterns.md)** - Patterns to avoid in AI development
- **[Environment Setup](./configuration/environment-setup.md)** - Environment configuration guide
- **[AI Development Workflow](./ai-development-workflow.md)** - Complete AI development process

### Architecture & Design

- **[Design System Guidelines](./architecture/design-system-guidelines.md)** - Design system implementation
- **[BEM Theme Architecture](./bem-theme-architecture.md)** - BEM methodology and theming
- **[CSS Architecture Patterns](./css-architecture-patterns.md)** - CSS organization patterns

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