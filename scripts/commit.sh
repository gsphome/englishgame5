#!/bin/bash

# Smart Commit - Quick AI-powered commit messages
# Usage: ./scripts/commit.sh [message] [--all] [--push]

set -e

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
ROBOT="🤖"
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"
SPARKLES="✨"
GEAR="⚙️"

# Helper functions
log() {
    echo -e "${2:-$NC}$1${NC}"
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

log_header() {
    echo
    echo "============================================================"
    log "$1" "$CYAN"
    echo "============================================================"
}

# Check git status and auto-stage if needed
check_git_status() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not a git repository"
        exit 1
    fi
    
    if ! git diff --cached --quiet; then
        return 0  # Has staged changes
    else
        # No staged changes, check for unstaged changes
        if ! git diff --quiet; then
            log_info "No staged changes found. Auto-staging all changes..."
            git add .
            log_success "All changes staged successfully!"
            return 0  # Now has staged changes
        else
            return 1  # No changes at all
        fi
    fi
}

# Auto-stage all changes if --all flag is used
auto_stage_all() {
    log_info "Staging all changes..."
    git add .
    log_success "All changes staged"
}

# Generate simple commit message based on file changes
generate_simple_message() {
    local staged_files=$(git diff --cached --name-only)
    local added_files=$(git diff --cached --name-status | grep "^A" | wc -l)
    local modified_files=$(git diff --cached --name-status | grep "^M" | wc -l)
    local deleted_files=$(git diff --cached --name-status | grep "^D" | wc -l)
    
    # Analyze file types and locations
    local has_src=$(echo "$staged_files" | grep -q "^src/" && echo "true" || echo "false")
    local has_tests=$(echo "$staged_files" | grep -q "test\|spec" && echo "true" || echo "false")
    local has_config=$(echo "$staged_files" | grep -q "config\|\.config\." && echo "true" || echo "false")
    local has_workflows=$(echo "$staged_files" | grep -q "\.github/workflows" && echo "true" || echo "false")
    local has_scripts=$(echo "$staged_files" | grep -q "^scripts/" && echo "true" || echo "false")
    local has_docs=$(echo "$staged_files" | grep -q "README\|\.md$" && echo "true" || echo "false")
    local has_package=$(echo "$staged_files" | grep -q "package\.json" && echo "true" || echo "false")
    
    # Determine commit type and scope
    local commit_type="feat"
    local scope=""
    local description=""
    
    # Determine type based on changes
    if [ "$has_tests" = "true" ] && [ "$added_files" -gt 0 ] && [ "$modified_files" -eq 0 ]; then
        commit_type="test"
        description="add test coverage"
    elif [ "$has_docs" = "true" ] && [ "$modified_files" -gt 0 ] && [ "$added_files" -eq 0 ]; then
        commit_type="docs"
        description="update documentation"
    elif [ "$has_workflows" = "true" ]; then
        commit_type="ci"
        scope="workflows"
        description="update CI/CD pipeline"
    elif [ "$has_config" = "true" ] || [ "$has_package" = "true" ]; then
        commit_type="build"
        scope="config"
        description="update configuration"
    elif [ "$has_scripts" = "true" ]; then
        commit_type="build"
        scope="scripts"
        description="update build scripts"
    elif [ "$deleted_files" -gt 0 ] && [ "$added_files" -gt 0 ]; then
        commit_type="refactor"
        description="restructure codebase"
    elif [ "$modified_files" -gt 0 ] && [ "$added_files" -eq 0 ]; then
        commit_type="fix"
        description="improve functionality"
    else
        commit_type="feat"
        description="add new functionality"
    fi
    
    # Add scope if determined
    if [ -n "$scope" ]; then
        scope="($scope)"
    fi
    
    # Customize description based on file count
    if [ "$added_files" -gt 3 ] || [ "$modified_files" -gt 3 ]; then
        description="update multiple components"
    fi
    
    echo "${commit_type}${scope}: ${description}"
}

# Show commit preview
show_commit_preview() {
    local message="$1"
    
    log_header "$SPARKLES Smart Commit Preview"
    
    log "Staged changes:" "$WHITE"
    git diff --cached --stat | sed 's/^/  /'
    
    echo
    log "Generated commit message:" "$GREEN"
    log "  $message" "$WHITE"
    
    echo
    log "Files to be committed:" "$BLUE"
    git diff --cached --name-only | sed 's/^/  • /'
}

# Interactive confirmation
confirm_commit() {
    local message="$1"
    
    echo
    read -p "$(echo -e "${CYAN}${GEAR} Proceed with this commit? (y/n/e): ${NC}")" -n 1 -r
    echo
    
    case $REPLY in
        [Yy]* ) return 0;;
        [Ee]* ) 
            read -p "$(echo -e "${BLUE}${GEAR} Enter custom message: ${NC}")" custom_message
            if [ -n "$custom_message" ]; then
                echo "$custom_message"
                return 0
            else
                log_warning "Empty message, using generated one"
                echo "$message"
                return 0
            fi
            ;;
        * ) return 1;;
    esac
}

# Perform commit
do_commit() {
    local message="$1"
    local push_after="$2"
    
    log_info "Committing changes..."
    
    if git commit -m "$message"; then
        local commit_hash=$(git rev-parse --short HEAD)
        log_success "Commit completed: $commit_hash"
        
        if [ "$push_after" = "true" ]; then
            log_info "Pushing to remote..."
            if git push; then
                log_success "Changes pushed to remote"
            else
                log_warning "Push failed, but commit was successful"
            fi
        fi
        
        return 0
    else
        log_error "Commit failed"
        return 1
    fi
}

# Main function
main() {
    local custom_message=""
    local stage_all=false
    local push_after=false
    local interactive=true
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all|-a)
                stage_all=true
                shift
                ;;
            --push|-p)
                push_after=true
                shift
                ;;
            --yes|-y)
                interactive=false
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                if [ -z "$custom_message" ]; then
                    custom_message="$1"
                fi
                shift
                ;;
        esac
    done
    
    log_header "$ROBOT Smart Commit - AI-Powered Git Commits"
    
    # Stage all if requested
    if [ "$stage_all" = true ]; then
        auto_stage_all
    fi
    
    # Check for staged changes (auto-staging is handled in check_git_status)
    if ! check_git_status; then
        log_warning "No changes found in working directory"
        log_info "Nothing to commit"
        exit 0
    fi
    
    # Use custom message or generate one
    local commit_message
    if [ -n "$custom_message" ]; then
        commit_message="$custom_message"
        log_info "Using custom message: $commit_message"
    else
        log_info "Analyzing changes and generating commit message..."
        commit_message=$(generate_simple_message)
    fi
    
    # Show preview
    show_commit_preview "$commit_message"
    
    # Interactive confirmation or auto-commit
    if [ "$interactive" = true ]; then
        final_message=$(confirm_commit "$commit_message")
        if [ $? -eq 0 ]; then
            do_commit "$final_message" "$push_after"
        else
            log_warning "Commit cancelled"
            exit 0
        fi
    else
        do_commit "$commit_message" "$push_after"
    fi
}

# Show help
show_help() {
    log_header "$ROBOT Smart Commit Help"
    
    echo
    log "Usage:" "$WHITE"
    log "  ./scripts/commit.sh [message] [options]" "$CYAN"
    
    echo
    log "Options:" "$WHITE"
    log "  --all, -a     Stage all changes before committing" "$BLUE"
    log "  --push, -p    Push to remote after successful commit" "$GREEN"
    log "  --yes, -y     Skip confirmation (auto-commit)" "$YELLOW"
    log "  --help, -h    Show this help" "$WHITE"
    
    echo
    log "Examples:" "$WHITE"
    log "  ./scripts/commit.sh                           # Interactive mode with AI message"
    log "  ./scripts/commit.sh \"fix: resolve login bug\"   # Custom message"
    log "  ./scripts/commit.sh --all --push              # Stage all, commit, and push"
    log "  ./scripts/commit.sh \"feat: new feature\" -p    # Custom message and push"
    
    echo
    log "AI Features:" "$WHITE"
    log "  • Analyzes file changes to determine commit type"
    log "  • Suggests appropriate scope based on modified files"
    log "  • Follows conventional commit format"
    log "  • Provides interactive confirmation"
    
    echo
    log "For advanced AI analysis, use:" "$MAGENTA"
    log "  node scripts/smart-commit.js"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Run main function
main "$@"