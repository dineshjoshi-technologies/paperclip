# Database Setup Guide

## Quick Start

The SaaS platform uses PostgreSQL 16 as its database. Follow these steps to get your development database running.

### Option 1: Docker (Recommended)

```bash
# Run the setup script
./scripts/setup-db.sh

# Or manually with docker-compose
docker-compose -f docker-compose.dev.yml up -d db
```

### Option 2: Local PostgreSQL

1. Install PostgreSQL 16+
2. Create database and user:
   ```bash
   createdb dj_platform
   createuser -s postgres
   psql -c "ALTER USER postgres PASSWORD 'postgres';"
   ```

### Option 3: Full Development Stack

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts PostgreSQL, backend, and frontend together.

## Configuration

### Environment Variables

Create `backend/.env` (copy from `backend/.env.example`):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dj_platform
```

### Connection Details

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 5432 |
| Database | dj_platform |
| Username | postgres |
| Password | postgres |
| URL | `postgresql://postgres:postgres@localhost:5432/dj_platform` |

## Database Management

### Run Migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### View Database Schema

```bash
npx prisma studio
```

### Reset Database

```bash
npx prisma migrate reset
```

### Seed Data

```bash
npx prisma db seed
```

## Schema Overview

The database includes the following models:

- **Users** - Authentication and user management
- **Websites** - User-created websites with templates
- **Templates** - Pre-built website templates
- **Pages** - Individual pages within websites
- **Components** - Reusable page components (hero, features, etc.)

See `backend/prisma/schema.prisma` for the full schema definition.

## Troubleshooting

### Connection Refused

- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Check logs: `docker logs dj-postgres-dev`

### Migration Errors

- Reset database: `npx prisma migrate reset`
- Regenerate client: `npx prisma generate`

### Port Already in Use

- Check what's using port 5432: `lsof -i :5432`
- Stop existing PostgreSQL: `sudo systemctl stop postgresql` (if running locally)
