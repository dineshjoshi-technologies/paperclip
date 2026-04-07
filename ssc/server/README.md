# SSC Platform Backend

## Overview

Node.js + Express REST API backend for the SSC (Sawariya Seth Community) token ecosystem platform.

## Features

- **TypeScript** - Full type safety
- **PostgreSQL** + **Prisma ORM** - Database with migrations
- **Redis** - Caching and session management
- **JWT Authentication** - Access/refresh token flow
- **Rate Limiting** - API protection
- **Docker** - Containerized development and production
- **CI/CD** - GitHub Actions pipeline

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+

### Local Development

```bash
# Start infrastructure
docker-compose up -d postgres redis

# Install dependencies
cd server
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Docker Development

```bash
# Build and run everything
docker-compose up --build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Revoke refresh token

### User
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/change-password` - Change password

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - List user transactions (paginated)
- `GET /api/transactions/:id` - Get transaction details

### Buyback Requests
- `POST /api/buyback-requests` - Create buyback request
- `GET /api/buyback-requests` - List user buyback requests (paginated)

### Admin (requires ADMIN or SUPER_ADMIN role)
- `GET /api/admin/users` - List all users (searchable, paginated)
- `PUT /api/admin/users/:userId` - Update user role/status
- `GET /api/admin/stats` - Get platform statistics

### Health
- `GET /api/health` - Health check

## Database Schema

See [prisma/schema.prisma](server/prisma/schema.prisma) for the full schema definition.

Key models:
- **User** - User accounts with roles (USER, ADMIN, SUPER_ADMIN)
- **Transaction** - BUY, SELL, BUYBACK, PROFIT_DISTRIBUTION, TRANSFER
- **BuybackRequest** - User-initiated token buyback requests
- **ProfitDistribution** - Admin-controlled profit distribution with snapshot
- **RefreshToken** - JWT refresh token management
- **AuditLog** - Action tracking for compliance

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run database migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

See [.env.example](server/.env.example) for all available configuration options.
