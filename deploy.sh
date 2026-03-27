#!/bin/bash

set -e

echo "=================================="
echo "AI Portal - Deployment Script"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo ""
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and set your passwords and secrets!"
    echo ""
    echo "Required settings:"
    echo "  - DB_PASSWORD"
    echo "  - NEXTAUTH_SECRET"
    echo "  - SSL_EMAIL"
    echo ""
    echo "After editing .env, run this script again."
    exit 1
fi

# Load environment variables
source .env

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found. Installing..."
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Build and start services
echo "Step 1: Building Docker images..."
docker-compose build

echo ""
echo "Step 2: Starting database..."
docker-compose up -d db

echo "Waiting for database to be ready..."
sleep 10

echo ""
echo "Step 3: Running database migrations..."
docker-compose run --rm app npx prisma migrate deploy

echo ""
echo "Step 4: Starting all services..."
docker-compose up -d

echo ""
echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "Services status:"
docker-compose ps
echo ""
echo "Next steps:"
echo "1. Make sure DNS points to this server:"
echo "   ai-portal.skillaro.eu -> $(curl -s ifconfig.me)"
echo ""
echo "2. Run SSL setup:"
echo "   sudo ./setup-ssl.sh"
echo ""
echo "3. After SSL is configured, access your site at:"
echo "   https://ai-portal.skillaro.eu"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Stop: docker-compose down"
echo "  - Check status: docker-compose ps"
echo ""
