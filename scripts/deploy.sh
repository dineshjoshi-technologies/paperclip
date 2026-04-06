#!/bin/bash
# Deploy script - run this on the VPS to deploy the platform
# Usage: ./deploy.sh [environment] [branch]
#   environment: production (default) or staging
#   branch: main (default) or develop

set -euo pipefail

ENV="${1:-production}"
BRANCH="${2:-main}"

echo "=== DJ Platform Deployment ==="
echo "Environment: $ENV"
echo "Branch: $BRANCH"
echo "Date: $(date)"
echo ""

DEPLOY_DIR="/opt/dj-platform"
if [ "$ENV" = "staging" ]; then
    DEPLOY_DIR="/opt/dj-platform-staging"
fi

# Create deploy directory if it doesn't exist
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "Creating deployment directory: $DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR"

# Configure git if first deploy
if [ ! -d ".git" ]; then
    echo "Initial repository clone..."
    git init
    git remote add origin https://github.com/dineshjoshi-technologies/paperclip.git
fi

# Pull latest code
echo "Fetching latest code..."
git fetch origin
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

# Stop containers gracefully
echo "Stopping containers..."
if [ "$ENV" = "staging" ]; then
    docker compose -f docker-compose.staging.yml down --remove-orphans
else
    docker compose down --remove-orphans
fi

# Pull latest images
echo "Pulling latest images..."
if [ "$ENV" = "staging" ]; then
    docker compose -f docker-compose.staging.yml pull
else
    docker compose pull
fi

# Start containers
echo "Starting containers..."
if [ "$ENV" = "staging" ]; then
    docker compose -f docker-compose.staging.yml up -d --remove-orphans
else
    docker compose up -d --remove-orphans
fi

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Health check
echo ""
echo "=== Health Checks ==="

if curl -sf http://localhost:80/health > /dev/null 2>&1; then
    echo "Backend API: OK"
else
    echo "Backend API: WARNING - health check failed"
fi

if curl -sf http://localhost:80/ > /dev/null 2>&1; then
    echo "Frontend: OK"
else
    echo "Frontend: WARNING - health check failed"
fi

# Run database migrations if backend is up
echo ""
echo "=== Database Migrations ==="
if docker compose exec -T backend sh -c 'npx prisma migrate deploy' 2>/dev/null; then
    echo "Migrations completed successfully"
else
    echo "WARNING: Could not run migrations (check backend status)"
fi

# Clean up old images
echo ""
echo "=== Cleanup ==="
docker image prune -f

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://localhost:80"
echo "Backend API: http://localhost:80/health"
echo "Grafana: http://localhost:3001 (admin/changeme)"
echo "Prometheus: http://localhost:9090"
