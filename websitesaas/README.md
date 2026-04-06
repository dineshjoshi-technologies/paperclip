# DJ Technologies Website SaaS Platform

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

AI-powered no-code website development platform. Build, customize, and publish professional websites through an intuitive drag-and-drop interface — no coding required.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Features

- **Visual Page Builder** — Drag-and-drop interface with 10+ component types
- **Real-time Preview** — Desktop, tablet, and mobile viewport switching
- **Undo/Redo** — Full history with keyboard shortcuts (Ctrl+Z/Y)
- **Auto-save** — Automatic page saving with manual save option
- **Template System** — Pre-built templates for quick website creation
- **User Authentication** — JWT-based auth with refresh tokens
- **Role-based Access** — USER, ADMIN, and AGENCY roles
- **Public Site Rendering** — Serve published websites to end users
- **Docker-ready** — Full containerization with Docker Compose

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Drag & Drop** | dnd-kit |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 16 with Prisma ORM |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **Validation** | Zod |
| **Infrastructure** | Docker Compose, Nginx reverse proxy |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Git

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd websitesaas

# Copy environment file
cp backend/.env.example backend/.env

# Start all services
docker compose up -d

# Run database migrations
docker compose exec backend npx prisma migrate dev

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost/api
# Health check: http://localhost/health
```

### Option 2: Local Development

```bash
# Backend setup
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
```

### Run Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Lint check
npm run lint
```

## Usage

### Component Types

The page builder supports the following components:

| Component | Description |
|-----------|-------------|
| Heading | H1-H6 text headings |
| Paragraph | Multi-line text blocks |
| Text | Single line text |
| Image | Image with alt text and sizing |
| Button | Clickable buttons with links |
| Container | Nestable layout containers |
| Video | YouTube/Vimeo embeds |
| Divider | Horizontal line separator |
| Spacer | Vertical spacing |
| Form | Contact/form components |

### Keyboard Shortcuts

- `Ctrl+Z` — Undo
- `Ctrl+Y` — Redo

## Project Structure

```
websitesaas/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   └── routes/          # API route definitions
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── .env.example         # Environment variables template
├── frontend/                # Next.js application
│   ├── components/
│   │   ├── builder/         # Page builder components
│   │   └── site-renderer/   # Published site renderer
│   └── lib/                 # Shared utilities and context
├── nginx/                   # Nginx configuration
│   └── conf.d/
│       └── default.conf     # Reverse proxy config
├── docs/                    # Documentation
└── docker-compose.yml       # Docker services configuration
```

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh` | Refresh access token |

### Websites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/websites` | List user's websites |
| POST | `/api/websites` | Create new website |
| GET | `/api/websites/:id` | Get website details |
| PUT | `/api/websites/:id` | Update website |
| DELETE | `/api/websites/:id` | Delete website |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List all templates |
| POST | `/api/templates` | Create template (admin) |
| GET | `/api/templates/:id` | Get template details |

### Pages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/websites/:websiteId/pages` | List pages |
| POST | `/api/websites/:websiteId/pages` | Create page |
| GET | `/api/pages/:id` | Get page details |
| PUT | `/api/pages/:id` | Update page |
| DELETE | `/api/pages/:id` | Delete page |

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sites/:slug` | Get published site data |
| GET | `/api/sites/:slug/pages/:pageSlug` | Get published page |

## Development

### Database Management

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Environment Variables

See `backend/.env.example` for all required environment variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dj_platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
PORT=4000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Deployment

### Production Docker Compose

```bash
# Build and start in production mode
docker compose -f docker-compose.yml up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### SSL/TLS Setup

For production deployment, configure SSL certificates:

1. Obtain certificates (Let's Encrypt recommended)
2. Update `nginx/conf.d/default.conf` with SSL configuration
3. Mount certificate files in `docker-compose.yml`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and setup instructions.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting process.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
