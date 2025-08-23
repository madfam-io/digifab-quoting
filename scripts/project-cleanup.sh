#!/bin/bash

# Project Cleanup Script
# This script performs various cleanup operations on the codebase

set -e

echo "🧹 Starting Project Cleanup..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Dry run mode
DRY_RUN=${1:-false}

if [ "$DRY_RUN" = "--dry-run" ]; then
    echo -e "${YELLOW}Running in DRY RUN mode - no changes will be made${NC}"
    echo ""
fi

# Function to execute or preview commands
execute() {
    if [ "$DRY_RUN" = "--dry-run" ]; then
        echo -e "${YELLOW}[DRY RUN]${NC} $1"
    else
        eval "$1"
    fi
}

# 1. Clean build artifacts and temporary files
echo "📁 Cleaning build artifacts and temporary files..."
execute "find . -name '*.log' -not -path './node_modules/*' -not -path './.git/*' -delete"
execute "find . -name '.turbo' -type d -not -path './node_modules/*' -exec rm -rf {} + 2>/dev/null || true"
execute "find . -name 'dist-debug' -type d -exec rm -rf {} + 2>/dev/null || true"
execute "find . -name 'build_output.txt' -delete"
execute "find . -name '.DS_Store' -delete 2>/dev/null || true"
execute "find . -name 'Thumbs.db' -delete 2>/dev/null || true"

# 2. Remove backup files
echo "🗑️  Removing backup files..."
execute "find . -name '*.backup' -not -path './node_modules/*' -delete"
execute "find . -name '*.bak' -not -path './node_modules/*' -delete"

# 3. Clean up console.log statements
echo "🔍 Removing console.log statements..."
if [ "$DRY_RUN" = "--dry-run" ]; then
    echo -e "${YELLOW}[DRY RUN]${NC} Would remove console.log from:"
    grep -r "console\.\(log\|error\|warn\|debug\)" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist . | grep -v "seed.ts" | head -20
else
    # Remove console statements except in seed files and test files
    find . -name "*.ts" -o -name "*.tsx" | \
        grep -v node_modules | \
        grep -v ".next" | \
        grep -v "dist" | \
        grep -v "seed.ts" | \
        grep -v ".spec.ts" | \
        grep -v ".test.ts" | \
        xargs -I {} sed -i.bak '/console\.\(log\|error\|warn\|debug\)/d' {} 2>/dev/null || true
    
    # Clean up sed backup files
    find . -name "*.bak" -delete
fi

# 4. Fix TODO comments
echo "📝 Collecting TODO comments..."
TODO_FILE="TODO_CLEANUP.md"
if [ "$DRY_RUN" != "--dry-run" ]; then
    echo "# TODO Cleanup Report" > $TODO_FILE
    echo "Generated on: $(date)" >> $TODO_FILE
    echo "" >> $TODO_FILE
    echo "## TODO Comments Found:" >> $TODO_FILE
    echo "" >> $TODO_FILE
    
    grep -r "TODO:" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist . | \
        sed 's/^/- /' >> $TODO_FILE || true
fi

# 5. Remove unused imports (using ESLint)
echo "🔧 Fixing unused imports with ESLint..."
execute "npm run lint -- --fix --rule 'no-unused-vars: error' --rule '@typescript-eslint/no-unused-imports: error' 2>/dev/null || true"

# 6. Clean duplicate/refactored files
echo "🔄 Handling duplicate files..."
DUPLICATES=(
    "apps/api/src/modules/quotes/quotes.service.refactored.ts"
    "apps/api/src/modules/files/files.service.improved.ts"
    "apps/api/prisma/schema-updates.prisma"
)

for file in "${DUPLICATES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}Found duplicate file: $file${NC}"
        if [ "$DRY_RUN" != "--dry-run" ]; then
            # Move to a backup directory instead of deleting
            mkdir -p .cleanup-backup
            execute "mv '$file' '.cleanup-backup/$(basename $file).$(date +%Y%m%d_%H%M%S)'"
        fi
    fi
done

# 7. Clean package.json dependencies
echo "📦 Checking for unused dependencies..."
if command -v depcheck &> /dev/null; then
    execute "depcheck --json > dependency-report.json 2>/dev/null || true"
else
    echo "Install depcheck globally to check for unused dependencies: npm i -g depcheck"
fi

# 8. Format code
echo "💅 Formatting code..."
execute "npm run format 2>/dev/null || true"

# 9. Clean git
echo "🌿 Cleaning git..."
execute "git gc --aggressive --prune=now 2>/dev/null || true"

# 10. Generate cleanup report
if [ "$DRY_RUN" != "--dry-run" ]; then
    echo ""
    echo "📊 Generating cleanup report..."
    
    REPORT_FILE="CLEANUP_REPORT.md"
    echo "# Cleanup Report" > $REPORT_FILE
    echo "Date: $(date)" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    
    # Count removed files
    echo "## Files Cleaned:" >> $REPORT_FILE
    echo "- Log files removed: $(find . -name '*.log' -not -path './node_modules/*' 2>/dev/null | wc -l)" >> $REPORT_FILE
    echo "- Backup files: $(ls -la .cleanup-backup 2>/dev/null | wc -l)" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    
    # Disk space saved
    echo "## Space Saved:" >> $REPORT_FILE
    echo "- Before: $(du -sh . 2>/dev/null | cut -f1)" >> $REPORT_FILE
    
    echo "" >> $REPORT_FILE
    echo "## Next Steps:" >> $REPORT_FILE
    echo "1. Review $TODO_FILE for remaining TODO items" >> $REPORT_FILE
    echo "2. Check dependency-report.json for unused dependencies" >> $REPORT_FILE
    echo "3. Review .cleanup-backup directory and delete if changes are correct" >> $REPORT_FILE
    echo "4. Run tests to ensure nothing was broken" >> $REPORT_FILE
fi

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"

if [ "$DRY_RUN" = "--dry-run" ]; then
    echo ""
    echo "To perform actual cleanup, run without --dry-run flag:"
    echo "  ./scripts/project-cleanup.sh"
fi