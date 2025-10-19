#!/bin/bash

# Event Survey App - Simplified Setup Script
# This script sets up and launches the 2-container architecture

set -e

echo "🚀 Event Survey App - Simplified Setup"
echo "========================================"
echo ""

# Check for required tools
echo "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your configuration."
    else
        echo "Creating basic .env file..."
        cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/event_survey?schema=public

# Session
SESSION_SECRET=change-this-to-a-random-string-in-production
SESSION_MAX_AGE=86400000

# Admin credentials (for seed)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Environment
NODE_ENV=production
PORT=3001
EOF
        echo "✅ Created basic .env file"
    fi
    echo ""
fi

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down 2>/dev/null || true
echo ""

# Build and start containers
echo "Building and starting containers..."
echo "This may take a few minutes on first run..."
docker-compose up -d --build

# Wait for database to be ready
echo ""
echo "Waiting for database to be ready..."
sleep 5

# Check if containers are running
if [ "$(docker ps -q -f name=event-survey-db)" ] && [ "$(docker ps -q -f name=event-survey-app)" ]; then
    echo "✅ Containers are running!"
else
    echo "❌ Failed to start containers. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "Running database migrations and seed..."
docker-compose exec -T app npm run db:push
docker-compose exec -T app npm run seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Architecture:"
echo "   - Container 1: PostgreSQL Database (port 5433)"
echo "   - Container 2: Unified App (API + Frontend on port 3001)"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3001"
echo "   API:      http://localhost:3001/api"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "🔑 Default admin credentials:"
echo "   Email:    admin@example.com"
echo "   Password: admin123"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     npm run docker:logs"
echo "   Stop:          npm run docker:down"
echo "   Restart:       npm run docker:rebuild"
echo ""
