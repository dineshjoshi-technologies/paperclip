# DJ Technologies — Docker Infrastructure

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Nginx     │────▶│  Frontend   │     │  PostgreSQL  │
│  (80/443)   │     │  (Next.js)  │     │   (5432)     │
└──────┬──────┘     └──────┬──────┘     └──────┬───────┘
       │                   │                   │
       │            ┌──────▼──────┐            │
       └───────────▶│   Backend   │────────────┘
                    │  (Express)  │
                    └─────────────┘
```

## Services

| Service    | Port | Description                    |
|------------|------|--------------------------------|
| Nginx      | 80   | Reverse proxy + SSL termination |
| Frontend   | 3000 | Next.js application            |
| Backend    | 4000 | Express.js API                 |
| PostgreSQL | 5432 | Database                       |
| Certbot    | -    | SSL certificate automation     |

## Quick Start

### Development

```bash
docker compose -f docker-compose.dev.yml up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health check: http://localhost:4000/health

### Production

```bash
# First time: provision SSL certificates
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  -d yourdomain.com \
  --email you@example.com \
  --agree-tos --no-eff-email

# Then uncomment HTTPS blocks in nginx/conf.d/default.conf and run:
docker compose up -d --build
```

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci-cd.yml`):

1. **Lint & Test** — runs on every push/PR
2. **Docker Build** — builds and pushes images on push to `main`/`develop`
3. **Deploy** — deploys to VPS via SSH on push to `main`

### Required Secrets

| Secret          | Description              |
|-----------------|--------------------------|
| `VPS_HOST`      | VPS hostname or IP       |
| `VPS_USER`      | SSH username             |
| `VPS_SSH_KEY`   | SSH private key          |

## Health Checks

All services include Docker health checks:

- Frontend: `http://localhost:3000/`
- Backend: `http://localhost:4000/health`
- PostgreSQL: `pg_isready`
- Nginx: `http://localhost:80/`

## SSL / Certbot

Certbot runs in a sidecar container, renewing certificates every 12 hours.
Nginx is configured to serve ACME challenges from the certbot webroot.

To manually renew:

```bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```
