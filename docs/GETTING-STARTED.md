# Developer Getting Started Guide

This guide walks you through setting up your development environment, understanding the platform architecture, and making your first API call.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** (exact version in `.nvmrc`)
- **npm 10+** (comes with Node.js)
- **Docker** and **Docker Compose**
- **Git**

### Recommended Tools

- VS Code with ESLint and Prettier extensions
- Postman or Insomnia for API testing
- psql (PostgreSQL client) for database debugging

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/dineshjoshi-technologies/paperclip.git
cd my-project
```

### 2. Set Up Environment Variables

Copy the example environment files and configure them:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp website-platform/.env.example website-platform/.env 2>/dev/null || echo "Check .env in website-platform/"
```

Key variables to configure in `backend/.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/djtech"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
NODE_ENV="development"
PORT=4000
```

### 3. Start the Development Environment

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Backend API** on port 4000
- **Nginx** reverse proxy on port 80/443

### 4. Install Dependencies and Run Migrations

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../website-platform && npm install

# Run database migrations
cd ../backend && npx prisma migrate dev
```

### 5. Verify Services

```bash
# Check backend health
curl http://localhost:4000/health

# Check frontend
open http://localhost:3000

# View running containers
docker compose -f docker-compose.dev.yml ps
```

## Project Structure

```
my-project/
├── backend/                 # Express.js API server
│   ├── src/                 # Source code
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/        # Business logic layer
│   │   ├── controllers/     # Request handlers
│   │   └── lib/             # Utilities and shared code
│   ├── prisma/              # Database schema and migrations
│   └── tests/               # Unit and integration tests
│
├── website-platform/        # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React context providers
│   │   ├── lib/             # Utilities and API client
│   │   └── generated/       # Auto-generated types
│   ├── templates/           # Website templates
│   └── tests/               # Playwright E2E tests
│
├── nginx/                   # Nginx reverse proxy configuration
├── monitoring/              # Prometheus + Grafana setup
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Production configuration
├── docker-compose.dev.yml   # Development configuration
└── docker-compose.monitoring.yml  # Monitoring stack
```

## Architecture Overview

DJ Technologies is a multi-tenant SaaS platform with three main layers:

```
┌─────────────────────────────────────────────────────────┐
│                    Clients (Browser)                     │
└────────────────────────────┬────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Nginx Reverse  │
                    │      Proxy      │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌────────▼────────┐
     │  Next.js App     │          │   Frontend /    │
     │  (SSR/SSG)       │          │   Static Sites  │
     └────────┬────────┘          └─────────────────┘
              │
     ┌────────▼────────┐
     │  Express.js API │◄────────┐
     │  Server (v1)    │         │
     └────────┬────────┘         │
              │                  │
     ┌────────▼────────┐   ┌─────▼──────┐
     │   PostgreSQL     │   │  AI Layer  │
     │   (Prisma ORM)   │   │  Ollama/   │
     └─────────────────┘   │  External  │
                           └────────────┘
```

### Key Components

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| Nginx | nginx | 80/443 | Reverse proxy, SSL termination, load balancing |
| Frontend Platform | Next.js 15 | 3000 | Admin dashboard, builder UI, user management |
| Backend API | Express.js | 4000 | REST API, authentication, business logic |
| Database | PostgreSQL 15 | 5432 | Primary data store with Prisma ORM |
| AI Engine | Ollama/External | 11434 | AI website generation and editing |
| Monitoring | Prometheus + Grafana | 9090/3000 | Metrics collection and visualization |

## Making Your First API Call

### 1. Register a User Account

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "SecureP@ss123",
    "name": "Developer"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "dev@example.com",
      "name": "Developer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User registered successfully"
}
```

### 2. Login and Get Access Token

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "SecureP@ss123"
  }'
```

Save the `accessToken` for subsequent requests:

```bash
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 3. Create a Website

```bash
curl -X POST http://localhost:4000/api/v1/websites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My First Site",
    "domain": "mysite.example.com",
    "templateId": "template_default"
  }'
```

### 4. Create a Page

```bash
curl -X POST http://localhost:4000/api/v1/websites/{websiteId}/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Home",
    "slug": "home",
    "components": [
      {
        "type": "hero",
        "props": {
          "title": "Welcome to My Site",
          "subtitle": "Built with DJ Technologies"
        }
      }
    ]
  }'
```

## Authentication Overview

The platform uses JWT-based authentication with access and refresh tokens:

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens
- **API Keys**: Long-lived credentials for programmatic access

All authenticated endpoints require the `Authorization: Bearer <token>` header.

See the [Authentication Guide](authentication.md) for details on all endpoints and security best practices.

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Backend tests with coverage
cd backend && npm run test:coverage

# Playwright E2E tests
cd website-platform && npx playwright test

# Run specific test file
cd backend && npm test -- --grep "auth"
```

### Linting and Type Checking

```bash
# Backend
cd backend && npm run lint
cd backend && npx tsc --noEmit

# Frontend
cd website-platform && npm run lint
cd website-platform && npm run type-check
```

### Database Operations

```bash
# Generate Prisma client
cd backend && npx prisma generate

# Create a new migration
cd backend && npx prisma migrate dev --name descriptive_name

# Reset database (development only)
cd backend && npx prisma migrate reset

# Open Prisma Studio (database GUI)
cd backend && npx prisma studio

# Seed database with test data
cd backend && npx prisma db seed
```

### Hot Reloading

Both the frontend and backend support hot reloading during development:

- **Backend**: Nodemon restarts the server on file changes
- **Frontend**: Next.js fast refresh updates components automatically

## Common Development Tasks

### Adding a New API Endpoint

1. Define the route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Add business logic in `backend/src/services/`
4. Add validation middleware
5. Write tests
6. Update this documentation

### Creating a New React Component

1. Create component in `website-platform/src/components/`
2. Use TypeScript and functional components
3. Add PropTypes or TypeScript interfaces
4. Write unit tests if applicable
5. Document component usage

### Adding Database Fields

1. Update Prisma schema: `backend/prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name add_field_name`
3. Update TypeScript types
4. Update API validation
5. Update documentation

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :4000  # for backend
lsof -i :3000  # for frontend

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose -f docker-compose.dev.yml ps postgres

# View PostgreSQL logs
docker compose -f docker-compose.dev.yml logs postgres

# Reset the database
cd backend && npx prisma migrate reset
```

### Docker Issues

```bash
# Rebuild containers
docker compose -f docker-compose.dev.yml up -d --build

# Clear Docker cache
docker system prune -a

# Restart specific service
docker compose -f docker-compose.dev.yml restart backend
```

### Prisma Errors

```bash
# Regenerate Prisma client
cd backend && npx prisma generate

# If schema is out of sync
cd backend && npx prisma db pull
cd backend && npx prisma generate
```

## Next Steps

1. Read the [API Reference](openapi.yaml) for all available endpoints
2. Explore [Integration Examples](examples/) with code samples in JavaScript, Python, and cURL
3. Set up [Webhooks](webhooks.md) for real-time event notifications
4. Learn about [Rate Limits](rate-limits.md) and best practices
5. Review [Error Handling](errors.md) for error code reference
6. Check the [Deployment Runbook](DEPLOYMENT-RUNBOOK.md) for production setup

## Getting Help

- Open an issue on GitHub for bug reports or feature requests
- Consult the [Error Code Reference](errors.md) for troubleshooting
- Review the [QA Reports](QA-FOLLOW-UP-2026-04-06.md) for known issues
- Ask questions in the project discussions
