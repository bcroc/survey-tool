#!/bin/bash

# Event Survey Web App - Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Event Survey Web App - Quick Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. You have: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/6: Installing dependencies..."
npm install
echo "✅ Root dependencies installed"
echo ""

echo "📦 Installing API dependencies..."
cd api
npm install
cd ..
echo "✅ API dependencies installed"
echo ""

echo "📦 Installing Web dependencies..."
cd web
npm install
cd ..
echo "✅ Web dependencies installed"
echo ""

# Step 2: Setup environment
echo "🔧 Step 2/6: Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists, skipping..."
fi
echo ""

# Step 3: Start PostgreSQL
echo "🐘 Step 3/6: Starting PostgreSQL..."
docker-compose up -d db
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5
echo "✅ PostgreSQL is running"
echo ""

# Step 4: Setup database
echo "🗄️  Step 4/6: Setting up database..."
cd api
npx prisma generate
npx prisma db push --accept-data-loss
echo "✅ Database schema created"
echo ""

# Step 5: Seed database
echo "🌱 Step 5/6: Seeding database with demo data..."
npm run seed
echo "✅ Database seeded"
echo ""

# Step 6: Final instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   Database: localhost:5432"
echo ""
echo "🔑 Admin Credentials:"
echo "   Email:    admin@example.com"
echo "   Password: admin123"
echo ""
echo "📚 Documentation:"
echo "   README.md  - Project overview"
echo "   SETUP.md   - Detailed setup guide"
echo "   PRIVACY.md - Privacy policy"
echo ""
echo "💡 Next steps:"
echo "   1. Run 'npm run dev' to start development"
echo "   2. Open http://localhost:5173"
echo "   3. Check SETUP.md for component implementation guides"
echo ""
echo "Happy coding! 🎉"
