#!/bin/bash

# Event Survey App - Standalone Setup (No Docker Required)
# This script sets up the app to run directly on your machine

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_header() { echo -e "\n${BLUE}========================================\n$1\n========================================${NC}\n"; }

print_header "🚀 Event Survey App - Standalone Setup"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found!"
    echo "Install with: brew install node"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js found: $NODE_VERSION"

# Create .env if missing
if [ ! -f "api/.env" ]; then
    cp api/.env.example api/.env
    
    # Generate secure session secret
    SESSION_SECRET=$(openssl rand -base64 48 | tr -d '\n')
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/change-this-to-a-secure-random-string-in-production-minimum-32-chars/$SESSION_SECRET/g" api/.env
    else
        sed -i "s/change-this-to-a-secure-random-string-in-production-minimum-32-chars/$SESSION_SECRET/g" api/.env
    fi
    
    print_success "Created api/.env with secure session secret"
else
    print_info "api/.env already exists"
fi

# Install dependencies
print_header "📦 Installing Dependencies"

print_info "Installing root dependencies..."
npm install --silent
print_success "Root dependencies installed"

print_info "Installing API dependencies..."
cd api && npm install --silent && cd ..
print_success "API dependencies installed"

print_info "Installing Web dependencies..."
cd web && npm install --silent && cd ..
print_success "Web dependencies installed"

# Generate Prisma client
print_header "🗄️  Setting up Database Client"
print_info "Generating Prisma client..."
cd api && npm run db:generate
cd ..
print_success "Prisma client generated"

print_header "✅ Setup Complete!"

echo ""
print_warning "⚠️  IMPORTANT: Database Configuration Required"
echo ""
print_info "Edit api/.env and configure your PostgreSQL database:"
echo "  DATABASE_URL=postgresql://user:password@localhost:5432/event_survey_db"
echo ""
print_info "Then run:"
echo "  cd api"
echo "  npm run db:push      # Create database schema"
echo "  npm run seed         # Add demo data (optional)"
echo ""
print_info "Demo admin credentials after seeding:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""

print_info "To start the application:"
echo "  npm run dev          # Starts both API and Web"
echo ""
print_info "Servers will run on:"
echo "  API:  http://localhost:3001"
echo "  Web:  http://localhost:5173"
echo ""

read -p "Open api/.env for database configuration now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ${EDITOR:-nano} api/.env
fi

print_success "Setup script completed!"
