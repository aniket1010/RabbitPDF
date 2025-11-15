#!/bin/bash

# Production Deployment Script for ChatPDF
# Usage: ./scripts/deploy.sh [environment]

set -euo pipefail

# Configuration
ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Prerequisite checks
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running"
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not available"
    fi
    
    # Check if environment file exists
    if [[ ! -f "$PROJECT_ROOT/backend/.env.$ENVIRONMENT" ]]; then
        error "Backend environment file .env.$ENVIRONMENT not found"
    fi
    
    if [[ ! -f "$PROJECT_ROOT/frontend/.env.$ENVIRONMENT" ]]; then
        error "Frontend environment file .env.$ENVIRONMENT not found"
    fi
    
    success "Prerequisites check passed"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build backend image
    log "Building backend image..."
    docker build -t chatpdf-backend:$ENVIRONMENT ./backend
    
    # Build frontend image
    log "Building frontend image..."
    docker build -t chatpdf-frontend:$ENVIRONMENT ./frontend
    
    success "Docker images built successfully"
}

# Database operations
setup_database() {
    log "Setting up database..."
    
    cd "$PROJECT_ROOT"
    
    # Copy environment file
    cp "backend/.env.$ENVIRONMENT" "backend/.env"
    
    # Start only the database for migrations
    docker-compose -f docker-compose.$ENVIRONMENT.yml up -d postgres redis
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    sleep 30
    
    # Run migrations
    log "Running database migrations..."
    docker-compose -f docker-compose.$ENVIRONMENT.yml run --rm backend npx prisma migrate deploy
    
    success "Database setup completed"
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    
    cd "$PROJECT_ROOT"
    
    # Pull latest images if using registry
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "Pulling latest images..."
        docker-compose -f docker-compose.$ENVIRONMENT.yml pull || warning "Some images could not be pulled"
    fi
    
    # Start all services
    log "Starting all services..."
    docker-compose -f docker-compose.$ENVIRONMENT.yml up -d
    
    success "Services deployed successfully"
}

# Health checks
run_health_checks() {
    log "Running health checks..."
    
    # Wait for services to start
    sleep 60
    
    # Check backend health
    log "Checking backend health..."
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        success "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend health
    log "Checking frontend health..."
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend is healthy"
    else
        error "Frontend health check failed"
    fi
    
    # Check database connectivity
    log "Checking database connectivity..."
    if docker-compose -f docker-compose.$ENVIRONMENT.yml exec -T postgres pg_isready -U chatpdf_user > /dev/null 2>&1; then
        success "Database is healthy"
    else
        error "Database health check failed"
    fi
    
    # Check Redis connectivity
    log "Checking Redis connectivity..."
    if docker-compose -f docker-compose.$ENVIRONMENT.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        success "Redis is healthy"
    else
        error "Redis health check failed"
    fi
    
    success "All health checks passed"
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    success "Cleanup completed"
}

# Backup function
backup_data() {
    log "Creating backup..."
    
    BACKUP_DIR="$PROJECT_ROOT/backups/$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    log "Backing up database..."
    docker-compose -f docker-compose.$ENVIRONMENT.yml exec -T postgres pg_dump -U chatpdf_user chatpdf_production > "$BACKUP_DIR/database.sql"
    
    # Backup uploads (if using local storage)
    if [[ -d "$PROJECT_ROOT/backend/uploads" ]]; then
        log "Backing up uploads..."
        cp -r "$PROJECT_ROOT/backend/uploads" "$BACKUP_DIR/"
    fi
    
    success "Backup created at $BACKUP_DIR"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop current services
    docker-compose -f docker-compose.$ENVIRONMENT.yml down
    
    # Restore from latest backup
    LATEST_BACKUP=$(ls -t "$PROJECT_ROOT/backups" | head -n1)
    if [[ -n "$LATEST_BACKUP" ]]; then
        log "Restoring from backup: $LATEST_BACKUP"
        
        # Restore database
        docker-compose -f docker-compose.$ENVIRONMENT.yml up -d postgres
        sleep 30
        cat "$PROJECT_ROOT/backups/$LATEST_BACKUP/database.sql" | docker-compose -f docker-compose.$ENVIRONMENT.yml exec -T postgres psql -U chatpdf_user chatpdf_production
        
        success "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Main deployment function
main() {
    log "Starting deployment for environment: $ENVIRONMENT"
    
    cd "$PROJECT_ROOT"
    
    case "${2:-deploy}" in
        "backup")
            backup_data
            ;;
        "rollback")
            rollback
            ;;
        "deploy")
            check_prerequisites
            backup_data
            build_images
            setup_database
            deploy_services
            run_health_checks
            cleanup
            success "Deployment completed successfully!"
            ;;
        *)
            echo "Usage: $0 [environment] [action]"
            echo "Actions: deploy (default), backup, rollback"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"





