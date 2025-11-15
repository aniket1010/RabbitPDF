#!/bin/bash

# AWS Deployment Script for ChatPDF
# Usage: ./scripts/deploy-aws.sh

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env.production exists
if [[ ! -f .env.production ]]; then
    error ".env.production file not found! Please create it first."
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi

if ! docker info &> /dev/null; then
    error "Docker is not running. Please start Docker first."
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose is not available."
fi

log "Starting deployment..."

# Load environment variables
log "Loading environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

# Stop existing containers
log "Stopping existing containers..."
docker-compose -f docker-compose.production.yml down || true

# Build images
log "Building Docker images..."
docker-compose -f docker-compose.production.yml build

# Start services
log "Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be ready
log "Waiting for services to start..."
sleep 30

# Check if database is ready
log "Checking database connection..."
for i in {1..30}; do
    if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U ${POSTGRES_USER:-chatpdf_user} &> /dev/null; then
        success "Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Database failed to start"
    fi
    sleep 2
done

# Run migrations
log "Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T backend npx prisma migrate deploy || {
    warning "Migrations failed, but continuing..."
}

# Check Redis
log "Checking Redis connection..."
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ${REDIS_PASSWORD:+-a ${REDIS_PASSWORD}} ping &> /dev/null; then
    success "Redis is ready"
else
    warning "Redis connection check failed"
fi

# Health checks
log "Running health checks..."
sleep 10

# Check backend
if curl -f http://localhost:5000/health &> /dev/null; then
    success "Backend is healthy"
else
    warning "Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:3000 &> /dev/null; then
    success "Frontend is healthy"
else
    warning "Frontend health check failed"
fi

# Show status
log "Service status:"
docker-compose -f docker-compose.production.yml ps

success "Deployment completed!"
log "View logs with: docker-compose -f docker-compose.production.yml logs -f"
log "Check status with: docker-compose -f docker-compose.production.yml ps"

