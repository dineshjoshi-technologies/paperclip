#!/bin/bash
# Database Setup Script for DJ Technologies SaaS Platform
# Run this script to set up PostgreSQL for development

set -e

echo "🚀 Setting up PostgreSQL for DJ Platform..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker found. Starting PostgreSQL container..."
    
    # Start PostgreSQL container
    docker run -d \
        --name dj-postgres-dev \
        -p 5432:5432 \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=dj_platform \
        -v postgres-data-dev:/var/lib/postgresql/data \
        postgres:16-alpine \
        -c 'max_connections=200'
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
    
    # Verify connection
    if docker exec dj-postgres-dev pg_isready -U postgres; then
        echo "✅ PostgreSQL is running and ready!"
        echo ""
        echo "📋 Connection Details:"
        echo "   Host: localhost"
        echo "   Port: 5432"
        echo "   Database: dj_platform"
        echo "   User: postgres"
        echo "   Password: postgres"
        echo "   URL: postgresql://postgres:postgres@localhost:5432/dj_platform"
        echo ""
        echo "🔧 Next steps:"
        echo "   1. cd backend"
        echo "   2. npm install"
        echo "   3. npx prisma generate"
        echo "   4. npx prisma migrate dev"
        echo ""
        echo "🛑 To stop: docker stop dj-postgres-dev"
        echo "🗑️  To remove: docker rm dj-postgres-dev && docker volume rm postgres-data-dev"
    else
        echo "❌ PostgreSQL failed to start. Check logs: docker logs dj-postgres-dev"
        exit 1
    fi
else
    echo "❌ Docker not found. Please install Docker or PostgreSQL manually."
    echo ""
    echo "📦 Install Docker: https://docs.docker.com/get-docker/"
    echo "🐘 Install PostgreSQL: https://www.postgresql.org/download/"
    echo ""
    echo "🔧 Manual PostgreSQL setup:"
    echo "   1. Install PostgreSQL 16+"
    echo "   2. Create database: createdb dj_platform"
    echo "   3. Create user: createuser -s postgres"
    echo "   4. Set password: psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
    echo "   5. Update .env with: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dj_platform"
    exit 1
fi
