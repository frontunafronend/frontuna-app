#!/bin/bash

# Frontuna.ai Deployment Script
# This script handles deployment to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_REGISTRY="your-registry.com"
IMAGE_TAG=${1:-latest}
SERVICE_NAME="frontuna-ai"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build frontend
    print_status "Building frontend image..."
    docker build -t ${DOCKER_REGISTRY}/frontuna-frontend:${IMAGE_TAG} ./frontend
    
    # Build backend
    print_status "Building backend image..."
    docker build -t ${DOCKER_REGISTRY}/frontuna-backend:${IMAGE_TAG} ./backend
    
    print_success "Docker images built successfully"
}

# Push images to registry
push_images() {
    print_status "Pushing images to registry..."
    
    docker push ${DOCKER_REGISTRY}/frontuna-frontend:${IMAGE_TAG}
    docker push ${DOCKER_REGISTRY}/frontuna-backend:${IMAGE_TAG}
    
    print_success "Images pushed to registry"
}

# Deploy to production
deploy_production() {
    print_status "Deploying to production..."
    
    # Create production docker-compose file
    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: \${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: frontuna
    volumes:
      - mongodb_data:/data/db
    networks:
      - frontuna-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - frontuna-network

  backend:
    image: ${DOCKER_REGISTRY}/frontuna-backend:${IMAGE_TAG}
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: \${MONGODB_URI}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: \${JWT_SECRET}
      JWT_REFRESH_SECRET: \${JWT_REFRESH_SECRET}
      OPENAI_API_KEY: \${OPENAI_API_KEY}
      FRONTEND_URL: \${FRONTEND_URL}
      SMTP_HOST: \${SMTP_HOST}
      SMTP_USER: \${SMTP_USER}
      SMTP_PASS: \${SMTP_PASS}
    volumes:
      - uploads_data:/app/uploads
      - logs_data:/app/logs
    depends_on:
      - mongodb
      - redis
    networks:
      - frontuna-network

  frontend:
    image: ${DOCKER_REGISTRY}/frontuna-frontend:${IMAGE_TAG}
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - frontuna-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - frontuna-network

volumes:
  mongodb_data:
  redis_data:
  uploads_data:
  logs_data:

networks:
  frontuna-network:
    driver: bridge
EOF

    # Deploy using docker-compose
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Deployment completed"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost > /dev/null 2>&1; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        exit 1
    fi
    
    print_success "All health checks passed"
}

# Backup database
backup_database() {
    print_status "Creating database backup..."
    
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    docker exec frontuna-mongodb mongodump --out /backup
    docker cp frontuna-mongodb:/backup $BACKUP_DIR/
    
    print_success "Database backup created: $BACKUP_DIR"
}

# Rollback deployment
rollback() {
    print_warning "Rolling back deployment..."
    
    # Stop current services
    docker-compose -f docker-compose.prod.yml down
    
    # Deploy previous version (assuming 'previous' tag exists)
    IMAGE_TAG="previous" deploy_production
    
    print_success "Rollback completed"
}

# Main deployment process
main() {
    echo "🚀 Starting Frontuna.ai deployment process..."
    echo "Image tag: $IMAGE_TAG"
    echo ""
    
    case "${2:-deploy}" in
        "build")
            build_images
            ;;
        "push")
            build_images
            push_images
            ;;
        "deploy")
            build_images
            push_images
            backup_database
            deploy_production
            health_check
            ;;
        "rollback")
            rollback
            ;;
        "health")
            health_check
            ;;
        *)
            echo "Usage: $0 [tag] [build|push|deploy|rollback|health]"
            echo "  tag: Docker image tag (default: latest)"
            echo "  action: Deployment action (default: deploy)"
            exit 1
            ;;
    esac
    
    print_success "🎉 Deployment process completed successfully!"
}

# Run main function
main "$@"