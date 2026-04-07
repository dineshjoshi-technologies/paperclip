# SSC Token Platform

Full-stack blockchain token platform for the Sawariya Seth Community (SSC), featuring a BEP-20 token on Binance Smart Chain with trading, buyback, and profit distribution capabilities.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Backend    │────▶│  Database   │
│  (Next.js)  │     │  (Express)  │     │ (PostgreSQL)│
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  BSC Chain  │     │    Redis    │
│ (Smart Ctx) │     │  (Cache)    │
└─────────────┘     └─────────────┘
```

## Project Structure

- `contracts/` - Solidity smart contract (BEP-20, UUPS upgradeable)
- `server/` - Backend API (Node.js/Express, TypeScript, Prisma ORM)
- `web/` - Frontend dApp (Next.js, React, Tailwind CSS)
- `scripts/` - Deployment scripts for smart contracts
- `.github/workflows/` - CI/CD pipelines

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- MetaMask wallet (for frontend testing)
- BSC network access (mainnet or testnet)

### Local Development

```bash
# Install dependencies (all workspaces)
npm ci

# Start infrastructure (PostgreSQL, Redis)
docker compose up -d postgres redis

# Setup database
cd server && npm run db:generate && npm run db:migrate

# Start backend
npm run dev  # in /server

# Start frontend
npm run dev  # in /web
```

### Docker Compose

```bash
# Development (with hot-reload)
docker compose --profile dev up

# Production
docker compose --profile prod up
```

## Documentation

- [Backend API](server/README.md) - API endpoints, database schema, and setup guide
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Monitoring Setup](MONITORING.md) - Monitoring and alerting configuration
- [Admin User Guide](ADMIN_GUIDE.md) - Platform administration instructions
- [Training Plan](TRAINING_PLAN.md) - Client team training curriculum
- [Support Plan](SUPPORT_PLAN.md) - Post-deployment support framework

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.22, OpenZeppelin, Hardhat |
| Blockchain | Binance Smart Chain (BSC) |
| Backend | Node.js 20, Express, TypeScript, Prisma |
| Database | PostgreSQL 16, Redis 7 |
| Frontend | Next.js 14, React 18, ethers.js 6 |
| Testing | Hardhat + Chai, Jest + Supertest, Storybook |
| CI/CD | GitHub Actions |
| Containerization | Docker, Docker Compose |
