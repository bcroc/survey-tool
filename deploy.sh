#!/bin/bash

# Production Deployment Script for Survey Tool
# This script helps deploy the application to a VPS with proper configuration

set -e  # Exit on error

# Configuration
VPS_HOST="bryan@159.198.74.129"
VPS_PROJECT_DIR="/home/bryan/survey-tool"
VPS_DIST_DIR="/home/bryan/survey-tool-web-dist"

echo "🚀 Survey Tool Production Deployment Script"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Build Frontend
echo "📦 Step 1: Building frontend..."
cd web
if [ ! -d "node_modules" ]; then
    print_warning "Installing frontend dependencies..."
    npm install
fi

print_status "Building production frontend..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Frontend build failed - dist directory not found"
    exit 1
fi
cd ..
print_status "Frontend built successfully"
echo ""

# Step 2: Check VPS connectivity
echo "🔌 Step 2: Checking VPS connectivity..."
if ssh -o ConnectTimeout=5 $VPS_HOST "echo 'Connected'" > /dev/null 2>&1; then
    print_status "Connected to VPS"
else
    print_error "Cannot connect to VPS at $VPS_HOST"
    exit 1
fi
echo ""

# Step 3: Check for existing nginx on VPS
echo "🔍 Step 3: Checking for conflicting services on VPS..."
if ssh $VPS_HOST "sudo systemctl is-active nginx" > /dev/null 2>&1; then
    print_warning "System nginx is running on VPS"
    read -p "Do you want to stop and disable system nginx? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ssh $VPS_HOST "sudo systemctl stop nginx && sudo systemctl disable nginx"
        print_status "System nginx stopped and disabled"
    else
        print_error "Cannot proceed with system nginx running on ports 80/443"
        exit 1
    fi
else
    print_status "No conflicting nginx service found"
fi
echo ""

# Step 4: Transfer frontend build
echo "📤 Step 4: Transferring frontend build to VPS..."
ssh $VPS_HOST "mkdir -p $VPS_DIST_DIR"
rsync -avz --delete --progress web/dist/ $VPS_HOST:$VPS_DIST_DIR/
print_status "Frontend transferred successfully"
echo ""

# Step 5: Transfer project files
echo "📤 Step 5: Transferring project files to VPS..."
ssh $VPS_HOST "mkdir -p $VPS_PROJECT_DIR"
rsync -avz --delete --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'web/dist' \
    --exclude 'web/node_modules' \
    --exclude 'api/node_modules' \
    ./ $VPS_HOST:$VPS_PROJECT_DIR/
print_status "Project files transferred successfully"
echo ""

# Step 6: Check environment file
echo "⚙️  Step 6: Checking environment configuration..."
if ssh $VPS_HOST "[ -f $VPS_PROJECT_DIR/.env ]"; then
    print_status "Environment file exists"
    print_warning "Please verify your .env file has all required variables"
else
    print_error "No .env file found on VPS"
    print_warning "Creating .env template..."
    ssh $VPS_HOST "cat > $VPS_PROJECT_DIR/.env << 'EOF'
DATABASE_URL=\"postgresql://postgres:CHANGE_ME@db:5432/event_survey\"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME
POSTGRES_DB=event_survey

SESSION_SECRET=CHANGE_ME
JWT_SECRET=CHANGE_ME

NODE_ENV=production
PORT=3001
FRONTEND_URL=https://uncharitablecowichan.ca
EOF"
    print_error "⚠️  IMPORTANT: You must edit the .env file on the VPS before continuing!"
    echo "Run: ssh $VPS_HOST 'nano $VPS_PROJECT_DIR/.env'"
    exit 1
fi
echo ""

# Step 7: Check SSL certificates
echo "🔒 Step 7: Verifying SSL certificates..."
if ssh $VPS_HOST "sudo ls /etc/letsencrypt/live/uncharitablecowichan.ca/fullchain.pem" > /dev/null 2>&1; then
    print_status "SSL certificates found"
    # Check expiration
    EXPIRY=$(ssh $VPS_HOST "sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/uncharitablecowichan.ca/fullchain.pem" | cut -d= -f2)
    echo "   Certificate expires: $EXPIRY"
else
    print_error "SSL certificates not found at /etc/letsencrypt/live/uncharitablecowichan.ca/"
    print_warning "You need to obtain SSL certificates before deploying"
    exit 1
fi
echo ""

# Step 8: Deploy on VPS
echo "🚀 Step 8: Deploying application on VPS..."
read -p "Ready to start Docker containers on VPS? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled"
    exit 0
fi

ssh $VPS_HOST "cd $VPS_PROJECT_DIR && docker-compose -f docker-compose.prod.yml up -d --build"
print_status "Containers started"
echo ""

# Step 9: Run migrations
echo "🗄️  Step 9: Running database migrations..."
sleep 5  # Wait for containers to be ready
ssh $VPS_HOST "cd $VPS_PROJECT_DIR && docker-compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy"
print_status "Migrations completed"
echo ""

# Step 10: Verify deployment
echo "✅ Step 10: Verifying deployment..."
echo ""
echo "Container status:"
ssh $VPS_HOST "cd $VPS_PROJECT_DIR && docker-compose -f docker-compose.prod.yml ps"
echo ""

# Test endpoints
print_status "Testing endpoints..."
echo ""

echo "Testing HTTP redirect..."
if curl -Is http://uncharitablecowichan.ca | grep -q "301\|302"; then
    print_status "HTTP redirects to HTTPS ✓"
else
    print_warning "HTTP redirect may not be working"
fi

echo "Testing HTTPS..."
if curl -Is https://uncharitablecowichan.ca | grep -q "200"; then
    print_status "HTTPS is working ✓"
else
    print_warning "HTTPS may not be working correctly"
fi

echo "Testing API health..."
if curl -s https://uncharitablecowichan.ca/health | grep -q "ok\|healthy"; then
    print_status "API health check passed ✓"
else
    print_warning "API health check may have failed"
fi

echo ""
echo "=============================================="
echo "🎉 Deployment Complete!"
echo "=============================================="
echo ""
echo "Your application should now be running at:"
echo "  https://uncharitablecowichan.ca"
echo ""
echo "To view logs:"
echo "  ssh $VPS_HOST 'cd $VPS_PROJECT_DIR && docker-compose -f docker-compose.prod.yml logs -f'"
echo ""
echo "To check status:"
echo "  ssh $VPS_HOST 'cd $VPS_PROJECT_DIR && docker-compose -f docker-compose.prod.yml ps'"
echo ""
print_warning "Remember to set up SSL certificate auto-renewal! See PRODUCTION_DEPLOYMENT_CHECKLIST.md"
echo ""
