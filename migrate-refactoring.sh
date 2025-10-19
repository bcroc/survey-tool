#!/bin/bash

# Event Survey App - Refactoring Migration Script
# This script helps migrate to the refactored codebase structure

set -e  # Exit on error

echo "🔧 Event Survey App - Refactoring Migration"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo "ℹ $1"
}

# Check if we're in the right directory
if [ ! -d "api" ] || [ ! -d "web" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Starting refactoring migration..."
echo ""

# Step 1: Backup original files
echo "Step 1: Backing up original files..."
cd api/src

if [ -f "index.ts" ]; then
    if [ ! -f "index.ts.backup" ]; then
        cp index.ts index.ts.backup
        print_success "Backed up index.ts"
    else
        print_warning "Backup already exists, skipping"
    fi
else
    print_error "index.ts not found!"
    exit 1
fi

# Backup route files
cd routes
for file in *.ts; do
    if [ ! -f "${file}.backup" ]; then
        cp "$file" "${file}.backup"
        print_success "Backed up routes/${file}"
    fi
done

cd ../../..
echo ""

# Step 2: Check if new files exist
echo "Step 2: Checking new files..."

check_file() {
    if [ -f "$1" ]; then
        print_success "Found $1"
        return 0
    else
        print_warning "Missing $1"
        return 1
    fi
}

check_file "api/src/config/env.ts"
check_file "api/src/config/logger.ts"
check_file "api/src/config/passport.ts"
check_file "api/src/services/database.ts"
check_file "api/src/utils/errors.ts"
check_file "api/src/utils/response.ts"
check_file "api/src/index-refactored.ts"
check_file "api/.env.example"

echo ""

# Step 3: Check environment file
echo "Step 3: Checking environment configuration..."

if [ ! -f "api/.env" ]; then
    print_warning ".env file not found"
    read -p "Create .env from .env.example? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp api/.env.example api/.env
        print_success "Created .env file"
        print_warning "⚠ Please edit api/.env with your actual values!"
        echo ""
    fi
else
    print_success ".env file exists"
fi

echo ""

# Step 4: Update imports in route files
echo "Step 4: Update route imports..."

update_route_imports() {
    local file=$1
    print_info "Updating $file..."
    
    # Check if file needs updating
    if grep -q "from '../index'" "$file" 2>/dev/null; then
        # Create a temporary file with updated imports
        sed -e "s/from '\.\.\/index'/from '\.\.\/services\/database'/g" \
            "$file" > "${file}.tmp"
        
        mv "${file}.tmp" "$file"
        print_success "Updated imports in $file"
    else
        print_info "$file already updated or doesn't need changes"
    fi
}

# Update route files
for route_file in api/src/routes/*.ts; do
    # Skip backup files
    if [[ $route_file != *.backup ]]; then
        update_route_imports "$route_file"
    fi
done

echo ""

# Step 5: Replace main index file
echo "Step 5: Replace main application file..."

read -p "Replace api/src/index.ts with refactored version? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "api/src/index-refactored.ts" ]; then
        mv api/src/index.ts api/src/index.ts.old
        mv api/src/index-refactored.ts api/src/index.ts
        print_success "Replaced index.ts with refactored version"
        print_info "Original saved as index.ts.old"
    else
        print_error "index-refactored.ts not found!"
    fi
else
    print_info "Skipped replacing index.ts"
    print_info "You can manually replace it later: mv api/src/index-refactored.ts api/src/index.ts"
fi

echo ""

# Step 6: Install dependencies and generate Prisma client
echo "Step 6: Install dependencies and generate Prisma client..."

read -p "Run npm install and generate Prisma client? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Installing dependencies..."
    cd api
    npm install
    print_success "Dependencies installed"
    
    print_info "Generating Prisma client..."
    npm run db:generate
    print_success "Prisma client generated"
    
    cd ..
else
    print_warning "Skipped dependency installation"
    print_info "Run manually: cd api && npm install && npm run db:generate"
fi

echo ""

# Step 7: Final checks
echo "Step 7: Final verification..."

# Check TypeScript compilation
print_info "Checking TypeScript compilation..."
cd api
if npm run build > /dev/null 2>&1; then
    print_success "TypeScript compiles without errors"
else
    print_warning "TypeScript compilation has errors (expected if dependencies not installed)"
fi
cd ..

echo ""

# Summary
echo "=========================================="
echo "🎉 Migration Complete!"
echo "=========================================="
echo ""
print_info "Next steps:"
echo "  1. Edit api/.env with your actual configuration"
echo "  2. Review the changes in api/src/"
echo "  3. Run: cd api && npm run dev"
echo "  4. Test all endpoints"
echo "  5. Update remaining routes gradually"
echo ""
print_info "Documentation:"
echo "  - REFACTORING_SUMMARY.md - Quick overview"
echo "  - IMPLEMENTATION_GUIDE.md - Detailed steps"
echo "  - REFACTORING.md - What changed"
echo "  - CODE_REVIEW.md - Best practices"
echo "  - API_REFERENCE.md - API docs"
echo ""
print_info "To rollback changes:"
echo "  cd api/src"
echo "  mv index.ts.backup index.ts"
echo "  cd routes && for f in *.backup; do mv \"\$f\" \"\${f%.backup}\"; done"
echo ""
print_success "Migration script completed successfully!"
