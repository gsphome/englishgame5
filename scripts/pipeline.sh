#!/bin/bash

# Pipeline Runner - Quick CI/CD pipeline execution
# Usage: ./scripts/pipeline.sh [command]
# 
# Commands:
#   quality, q    - Run quality pipeline (ESLint, TypeScript, Tests)
#   security, s   - Run security pipeline (Audit, Patterns, Licenses)
#   build, b      - Run build pipeline (Build, Verify, Analysis)
#   all, a        - Run all pipelines
#   ci-check, c   - Quick CI check
#   ci-local, l   - Local CI/CD simulation
#   ci-full, f    - Full CI simulation with fresh install
#   debug, d      - Show debug information
#   help, h       - Show this help

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
TARGET="🎯"
SHIELD="🛡️"
PACKAGE="📦"
LIGHTNING="⚡"
THEATER="🎭"
RECYCLE="🔄"
BUG="🐛"
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"

# Helper functions
log() {
    echo -e "${2:-$NC}$1${NC}"
}

log_header() {
    echo
    echo "============================================================"
    log "$1" "$CYAN"
    echo "============================================================"
}

log_success() {
    log "$CHECK $1" "$GREEN"
}

log_error() {
    log "$CROSS $1" "$RED"
}

log_warning() {
    log "$WARNING $1" "$YELLOW"
}

log_info() {
    log "$INFO $1" "$BLUE"
}

# Timer functions
start_timer() {
    START_TIME=$(date +%s)
}

end_timer() {
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo "${DURATION}s"
}

# Execute npm script with timing
run_npm_script() {
    local script=$1
    local description=$2
    local color=${3:-$NC}
    
    log_header "$color$description"
    log_info "Running: npm run $script"
    
    start_timer
    
    if npm run "$script"; then
        local duration=$(end_timer)
        log_success "$description completed in $duration"
        return 0
    else
        local duration=$(end_timer)
        log_error "$description failed after $duration"
        return 1
    fi
}

# Show help
show_help() {
    log_header "${THEATER} PIPELINE RUNNER - Quick CI/CD Execution"
    
    echo
    log "Available commands:" "$WHITE"
    log "  quality, q    ${TARGET} Quality Pipeline (ESLint, TypeScript, Tests)" "$BLUE"
    log "  security, s   ${SHIELD} Security Pipeline (Audit, Patterns, Licenses)" "$RED"
    log "  build, b      ${PACKAGE} Build Pipeline (Build, Verify, Analysis)" "$GREEN"
    log "  all, a        ${ROCKET} All Pipelines (Quality + Security + Build)" "$MAGENTA"
    log "  ci-check, c   ${LIGHTNING} Quick CI Check (Essential checks only)" "$CYAN"
    log "  ci-local, l   ${THEATER} Local CI/CD (Full simulation, no deploy)" "$YELLOW"
    log "  ci-full, f    ${RECYCLE} Full CI Simulation (Fresh install + all checks)" "$WHITE"
    log "  debug, d      ${BUG} Debug Information (Versions, dependencies)" "$YELLOW"
    log "  help, h       Show this help" "$WHITE"
    
    echo
    log "Examples:" "$WHITE"
    log "  ./scripts/pipeline.sh quality     # Run quality checks"
    log "  ./scripts/pipeline.sh all         # Run all pipelines"
    log "  ./scripts/pipeline.sh c           # Quick CI check"
    log "  node scripts/pipeline-runner.js   # Interactive mode"
}

# Show debug information
show_debug() {
    log_header "${BUG} DEBUG INFORMATION"
    
    log "Environment:" "$WHITE"
    log "  Node.js: $(node --version)" "$GREEN"
    log "  NPM: $(npm --version)" "$GREEN"
    log "  OS: $(uname -s) $(uname -m)" "$BLUE"
    
    if command -v git &> /dev/null; then
        if git rev-parse --git-dir > /dev/null 2>&1; then
            log "  Git Branch: $(git branch --show-current)" "$CYAN"
            log "  Git Commit: $(git rev-parse --short HEAD)" "$CYAN"
        else
            log "  Git: Not a git repository" "$YELLOW"
        fi
    else
        log "  Git: Not installed" "$YELLOW"
    fi
    
    echo
    log "Project Info:" "$WHITE"
    if [ -f "package.json" ]; then
        local name=$(node -p "require('./package.json').name")
        local version=$(node -p "require('./package.json').version")
        log "  Project: $name v$version" "$BLUE"
    fi
    
    echo
    log "Key Dependencies:" "$WHITE"
    for dep in typescript vite vitest eslint prettier; do
        if npm list "$dep" --depth=0 &> /dev/null; then
            local version=$(npm list "$dep" --depth=0 2>/dev/null | grep "$dep@" | sed 's/.*@//' | sed 's/ .*//')
            log "  $dep: $version" "$GREEN"
        else
            log "  $dep: Not found" "$RED"
        fi
    done
}

# Main execution
main() {
    local command=${1:-help}
    
    case "$command" in
        "quality"|"q")
            run_npm_script "pipeline:quality" "${TARGET} Quality Pipeline" "$BLUE"
            ;;
        "security"|"s")
            run_npm_script "pipeline:security" "${SHIELD} Security Pipeline" "$RED"
            ;;
        "build"|"b")
            run_npm_script "pipeline:build" "${PACKAGE} Build Pipeline" "$GREEN"
            ;;
        "all"|"a")
            run_npm_script "pipeline:all" "${ROCKET} All Pipelines" "$MAGENTA"
            ;;
        "ci-check"|"c")
            run_npm_script "ci:check" "${LIGHTNING} Quick CI Check" "$CYAN"
            ;;
        "ci-local"|"l")
            run_npm_script "ci:local" "${THEATER} Local CI/CD" "$YELLOW"
            ;;
        "ci-full"|"f")
            run_npm_script "ci:full" "${RECYCLE} Full CI Simulation" "$WHITE"
            ;;
        "debug"|"d")
            show_debug
            ;;
        "help"|"h"|"--help"|"-h")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Run main function
main "$@"