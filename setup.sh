#!/bin/bash

# Acquisitions API - Docker Setup Script
# This script helps you set up the development environment quickly

set -e  # Exit on any error

echo "🚀 Setting up Acquisitions API with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
    echo "❌ .env.development not found. Please make sure it exists and contains your Neon credentials."
    echo "Required variables:"
    echo "  - NEON_API_KEY=your_neon_api_key_here"
    echo "  - NEON_PROJECT_ID=your_neon_project_id_here"
    exit 1
fi

# Validate that Neon credentials are set
if grep -q "your_neon_api_key_here" .env.development; then
    echo "⚠️  Please update your NEON_API_KEY in .env.development with your actual API key"
    echo "You can find your API key at: https://console.neon.tech/app/settings/api-keys"
    read -p "Press Enter after updating the credentials..."
fi

if grep -q "your_neon_project_id_here" .env.development; then
    echo "⚠️  Please update your NEON_PROJECT_ID in .env.development with your actual project ID"
    echo "You can find your project ID in the Neon console"
    read -p "Press Enter after updating the credentials..."
fi

echo "📦 Building Docker images..."
docker-compose -f docker-compose.dev.yml build

echo "🔥 Starting development environment..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "📋 Available endpoints:"
    echo "  - Application: http://localhost:3000"
    echo "  - Health Check: http://localhost:3000/health"
    echo "  - API Status: http://localhost:3000/api"
    echo "  - Database (Neon Local): localhost:5432"
    echo ""
    echo "🔧 Useful commands:"
    echo "  - View logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "  - Stop services: docker-compose -f docker-compose.dev.yml down"
    echo "  - Run migrations: docker-compose -f docker-compose.dev.yml exec app npm run db:migrate"
    echo "  - Access shell: docker-compose -f docker-compose.dev.yml exec app sh"
    echo ""
    echo "🎉 Setup complete! Your development environment is ready."
else
    echo "❌ Services failed to start. Check logs with:"
    echo "docker-compose -f docker-compose.dev.yml logs"
fi