#!/bin/bash

# 🚀 Script de workflow de desarrollo
# Uso: ./scripts/dev-workflow.sh [quick|full|release]

set -e

case "${1:-quick}" in
  "quick")
    echo "🚀 Quick workflow..."
    npm run quick-check
    echo "✅ Ready to commit!"
    ;;
  
  "full")
    echo "🔍 Full validation..."
    npm run pre-push
    echo "✅ Ready for important commit!"
    ;;
  
  "release")
    echo "📦 Release validation..."
    npm run pre-push
    npm run build
    echo "📊 Build analysis:"
    du -sh dist/
    echo "✅ Ready for release!"
    ;;
  
  *)
    echo "Usage: $0 [quick|full|release]"
    echo "  quick   - Lint + TypeScript check"
    echo "  full    - All tests + security + lint"
    echo "  release - Full validation + build"
    exit 1
    ;;
esac