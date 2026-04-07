# Environment Setup Guide

This guide covers everything you need to set up a complete development environment for the DJ Technologies platform.

## Prerequisites

### Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|-------------|
| Node.js | 20.x | Runtime for frontend and backend | [nvm](https://github.com/nvm-sh/nvm) recommended |
| npm | 10.x | Package manager | Comes with Node.js |
| Docker | 24.x+ | Container runtime | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| Docker Compose | 2.x+ | Multi-container orchestration | Comes with Docker Desktop |
| Git | 2.x+ | Version control | [git-scm.com](https://git-scm.com) |

### Recommended Tools

| Tool | Purpose |
|------|---------|
| VS Code | IDE with excellent TypeScript/React support |
| psql | PostgreSQL CLI client for database debugging |
| Postman/Insomnia | API testing and exploration |
| Prisma Studio | Visual database browser |

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 4 GB | 8 GB+ |
| Disk | 10 GB free | 20 GB+ |
| CPU | 2 cores | 4 cores+ |

---

## Initial Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/dineshjoshi-technologies/paperclip.git
cd my-project
```

### Step 2: Verify Node.js Version

```bash
# Check .nvmrc for required version
cat .nvmrc

# If using nvm, switch to correct version
nvm use
```

### Step 3: Configure Environment Variables

#### Backend Configuration

```bash
cp backend/.env.example backend/.env
```

**Required Backend Variables:**

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/djtech"

# JWT Secrets (generate secure random strings)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Environment
NODE_ENV="development"
PORT=4000

# CORS (comma-separated origins)
CORS_ORIGIN="http://localhost:3000"

# AI Configuration (optional)
AI_PROVIDER="ollama"
AI_MODEL="llama2"
AI_API_URL="http://localhost:11434"

# Payment Gateway (optional)
RAZORPAY_KEY_ID="your_razorpay_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
STRIPE_SECRET_KEY="your_stripe_secret"

# Email Service (optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your_smtp_user"
SMTP_PASS="your_smtp_password"
EMAIL_FROM="noreply@djtechnologies.net"

# Webhook
WEBHOOK_SECRET="your-webhook-signing-secret"
```

**Generate secure secrets:**

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate webhook secret
openssl rand -hex 32
```

#### Frontend Configuration

Create or update `website-platform/.env`:

```bash
# API URL
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"

# Frontend
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI (optional)
AI_API_URL="http://localhost:11434"
```

### Step 4: Start Docker Services

```bash
# Start all services in development mode
docker compose -f docker-compose.dev.yml up -d

# Check service status
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

**Services started:**

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Database |
| Backend API | 4000 | Express.js server |
| Nginx | 80, 443 | Reverse proxy |

### Step 5: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../website-platform
npm install
```

### Step 6: Database Setup

```bash
cd backend

# Generate Prisma Client (creates TypeScript types)
npx prisma generate

# Run database migrations (creates tables)
npx prisma migrate dev

# (Optional) Seed database with test data
npx prisma db seed

# Open Prisma Studio for visual database editing
npx prisma studio
```

### Step 7: Verify Setup

```bash
# Check backend health
curl http://localhost:4000/health

# Expected response:
# {"status":"ok","timestamp":"2026-04-07T..."}

# Frontend should be accessible at:
open http://localhost:3000
```

---

## Development Workflow

### Starting Services

```bash
# Start all Docker services
docker compose -f docker-compose.dev.yml up -d

# Start backend with hot reloading (if not using Docker)
cd backend
npm run dev

# Start frontend with hot reloading (if not using Docker)
cd website-platform
npm run dev
```

### Running Tests

```bash
# Backend unit tests
cd backend
npm test

# Backend tests with coverage
npm run test:coverage

# Backend tests for specific module
npm test -- --testPathPattern=auth

# Frontend E2E tests
cd website-platform
npx playwright test

# Frontend E2E tests with UI
npx playwright test --ui
```

### Linting and Type Checking

```bash
# Backend
cd backend
npm run lint
npx tsc --noEmit

# Frontend
cd website-platform
npm run lint
npm run type-check
```

### Database Operations

```bash
cd backend

# View current database state
npx prisma db pull

# Create new migration after schema change
npx prisma migrate dev --name add_user_avatar

# Reset database (DEVELOPMENT ONLY - deletes all data)
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate deploy

# View migration history
npx prisma migrate status

# Generate TypeScript types from schema
npx prisma generate

# Open Prisma Studio (database GUI at localhost:5555)
npx prisma studio
```

---

## Troubleshooting

### Port Already in Use

**Symptom:** `EADDRINUSE: address already in use :::4000`

```bash
# Find process using the port
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or find what's using port 4000 on macOS
sudo lsof -i :4000 -sTCP:LISTEN
```

### Database Connection Issues

**Symptom:** `PrismaClientInitializationError: Can't reach database server`

```bash
# Check if PostgreSQL is running
docker compose -f docker-compose.dev.yml ps postgres

# View PostgreSQL logs
docker compose -f docker-compose.dev.yml logs postgres

# Test database connection
npx prisma db pull

# Restart PostgreSQL container
docker compose -f docker-compose.dev.yml restart postgres

# Check DATABASE_URL in .env matches docker-compose.dev.yml
cat backend/.env | grep DATABASE_URL
```

### Docker Issues

**Symptom:** Containers not starting or crashing

```bash
# View all container logs
docker compose -f docker-compose.dev.yml logs

# Rebuild and restart containers
docker compose -f docker-compose.dev.yml up -d --build

# Remove all containers and start fresh
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d

# Clear Docker cache (frees disk space)
docker system prune -a

# Check Docker resources (Mac/Windows)
docker info | grep -i "memory\|cpu"
```

### NPM Issues

**Symptom:** `npm install` fails or modules missing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use exact Node.js version
nvm use

# Check npm version
npm -v
```

### Prisma Issues

**Symptom:** Type errors after schema changes

```bash
# Regenerate Prisma Client
npx prisma generate

# If migration is stuck
npx prisma migrate resolve --rolled-back "<migration-name>"

# Check migration status
npx prisma migrate status

# Reset database and reapply all migrations
npx prisma migrate reset
```

### CORS Errors

**Symptom:** `Access-Control-Allow-Origin` errors in browser console

```bash
# Check CORS configuration in backend .env
cat backend/.env | grep CORS_ORIGIN

# Ensure frontend URL is included
# CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

### Authentication Issues

**Symptom:** 401 Unauthorized on API calls

```bash
# Verify JWT secrets are set
cat backend/.env | grep JWT_SECRET

# Check token expiry (JWT access tokens expire in 15 minutes)
# Login again to get fresh tokens

# Verify API key format (should start with 'dk_' or 'dj_live_')
echo $DJ_API_TOKEN
```

---

## Common Development Tasks

### Add New Environment Variable

1. Add to `backend/.env.example` with placeholder value
2. Update documentation in this file
3. Add validation in config file if required
4. Commit changes

### Add Database Migration

```bash
# Edit schema
nano backend/prisma/schema.prisma

# Create migration
npx prisma migrate dev --name descriptive_name

# Generate types
npx prisma generate

# Commit migration file
git add backend/prisma/migrations/
```

### Add New API Route

1. Create route file in `backend/src/routes/newFeature.routes.js`
2. Create controller in `backend/src/controllers/newFeature.controller.js`
3. Register route in `backend/src/app.js` or `backend/src/routes/index.js`
4. Add validation middleware
5. Write tests
6. Update API documentation

### Debug API Requests

```bash
# Verbose curl with headers
curl -v http://localhost:4000/api/v1/websites \
  -H "Authorization: Bearer $TOKEN"

# View backend logs in real-time
docker compose -f docker-compose.dev.yml logs -f backend

# Use Postman/Insomnia with saved environments
# Enable request/response logging
```

---

## Environment Variable Reference

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| JWT_SECRET | Yes | - | JWT signing secret (min 32 chars) |
| JWT_REFRESH_SECRET | Yes | - | Refresh token signing secret |
| NODE_ENV | Yes | development | Environment (development/production) |
| PORT | No | 4000 | Backend server port |
| CORS_ORIGIN | No | * | Allowed CORS origins (comma-separated) |
| AI_PROVIDER | No | ollama | AI provider (ollama/openai/anthropic) |
| AI_MODEL | No | llama2 | AI model name |
| AI_API_URL | No | http://localhost:11434 | AI API endpoint URL |
| RAZORPAY_KEY_ID | No | - | Razorpay public key |
| RAZORPAY_KEY_SECRET | No | - | Razorpay secret key |
| STRIPE_SECRET_KEY | No | - | Stripe secret key |
| SMTP_HOST | No | - | Email SMTP server host |
| SMTP_PORT | No | 587 | Email SMTP server port |
| SMTP_USER | No | - | Email SMTP username |
| SMTP_PASS | No | - | Email SMTP password |
| EMAIL_FROM | No | noreply@djtechnologies.net | From email address |
| LOG_LEVEL | No | info | Logging level (debug/info/warn/error) |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | Yes | - | Backend API base URL |
| NEXT_PUBLIC_APP_URL | No | http://localhost:3000 | Frontend app URL |
| AI_API_URL | No | - | AI API endpoint URL |

---

## Production Setup

For production deployment, see:

- [Deployment Runbook](DEPLOYMENT-RUNBOOK.md) — Complete production deployment procedures
- [Infrastructure Guide](../INFRASTRUCTURE.md) — Infrastructure architecture and setup
- [Docker Production Dockerfile](../docker-compose.yml) — Production Docker configuration

### Key Differences from Development

| Aspect | Development | Production |
|--------|------------|------------|
| NODE_ENV | development | production |
| Database | Local PostgreSQL | Managed PostgreSQL (backups enabled) |
| SSL | Self-signed/None | Let's Encrypt (Certbot) |
| Logging | Console | Structured logs + monitoring |
| Debugging | Enabled | Disabled |
| Migrations | Auto-applied | Manual review + apply |
| Rate Limits | Relaxed | Strict |

---

## Next Steps

1. Follow the [Getting Started Guide](GETTING-STARTED.md) for your first API call
2. Read the [Architecture Overview](ARCHITECTURE.md) to understand system design
3. Explore [Integration Examples](examples/) with working code samples
4. Check the [Contributing Guide](../CONTRIBUTING.md) for development standards
