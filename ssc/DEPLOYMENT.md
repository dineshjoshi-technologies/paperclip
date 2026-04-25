# Deployment Guide

This guide covers deploying the SSC Token Platform to production, including smart contract deployment, backend/frontend deployment, and infrastructure configuration.

## Prerequisites

- Server with Ubuntu 22.04+ LTS (minimum: 4 vCPU, 8GB RAM, 50GB disk)
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)
- PostgreSQL 16+ or Docker
- Redis 7+ or Docker
- Node.js 20+
- BSC mainnet account with BNB for gas fees
- BSCScan API key for contract verification

## 1. Smart Contract Deployment

### 1.1 Setup

```bash
# Copy environment template
cp .env.production.example .env.production

# Edit and fill in your actual values:
# - BSC_PRIVATE_KEY: Deployer wallet private key
# - BSCSCAN_API_KEY: For verification
```

### 1.2 Deploy to BSC Mainnet

```bash
npx hardhat run scripts/deploy-bsc-mainnet.js --network bsc
```

This will:
1. Deploy the SSCToken proxy contract
2. Verify the implementation and proxy on BSCScan
3. Save deployment info to `deployment-bsc.json`

### 1.3 Record Addresses

After deployment, record the addresses:
- Proxy address: from `deployment-bsc.json` → `proxy`
- Implementation address: from `deployment-bsc.json` → `implementation`

Update `.env.production`:
```
SSC_TOKEN_PROXY_ADDRESS=0x...
SSC_TOKEN_IMPL_ADDRESS=0x...
```

## 2. Server Deployment

### 2.1 Production Environment Setup

Create `.env` in the server directory:
```bash
cd server
cp .env.example .env
```

Fill in:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://ssc_user:STRONG_PASSWORD@localhost:5432/ssc_production
REDIS_URL=redis://localhost:6379
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
SSC_TOKEN_PROXY_ADDRESS=0x...
SSC_TOKEN_IMPL_ADDRESS=0x...
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_CHAIN_ID=56
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Generate strong JWT secrets before filling `.env`:
```bash
openssl rand -hex 64
openssl rand -hex 64
```

The backend now fails fast at startup when `JWT_SECRET` or `JWT_REFRESH_SECRET` is missing/weak in any non-test environment.

### 2.2 Database Setup

```bash
# Create production database
CREATE USER ssc_user WITH PASSWORD 'STRONG_PASSWORD';
CREATE DATABASE ssc_production OWNER ssc_user;

# Run migrations
cd server
npx prisma migrate deploy
npx prisma generate
```

### 2.3 Build and Start

```bash
cd server
npm ci --only=production
npm run build
npm start
```

## 3. Frontend Deployment

### 3.1 Build

```bash
cd web
npm ci
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
npm run build
npm run start
```

### 3.2 Docker Alternative

```bash
docker build -t ssc-web ./web
docker run -p 3000:3000 ssc-web
```

## 4. Nginx Configuration

### 4.1 Install and Configure

```bash
sudo apt install nginx certbot python3-certbot-nginx

# Copy config
sudo cp nginx/default.conf /etc/nginx/sites-available/ssc
sudo ln -s /etc/nginx/sites-available/ssc /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t
```

### 4.2 SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 4.3 Configure Upstream

Update `/etc/nginx/sites-available/ssc` to match actual server addresses:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## 5. Docker Compose Deployment

### 5.1 Production Deploy

Create `.env` at project root with all environment variables.

```bash
# Build and start all services
docker compose --profile prod up -d

# Run database migrations
docker compose exec server npx prisma migrate deploy
```

### 5.2 Service Verification

```bash
# Check all services are running
docker compose ps

# Check logs
docker compose logs -f
docker compose logs --tail=100 server
docker compose logs --tail=100 web
```

## 6. Post-Deployment Verification

### 6.1 Health Checks

```bash
curl https://api.yourdomain.com/health
curl https://yourdomain.com
```

### 6.2 Smart Contract Verification

Check BSCScan to verify:
- Contract is verified and published
- Read/Write functions working
- Proxy and implementation addresses correct

### 6.3 Functional Testing

- [ ] User registration and login
- [ ] Wallet connection (MetaMask)
- [ ] Token balance display
- [ ] Transaction submission
- [ ] Admin panel access
- [ ] Profit distribution
- [ ] Buyback request flow

## 7. Monitoring Setup

See [MONITORING.md](./MONITORING.md) for:
- Health check endpoint configuration
- Log aggregation setup
- Alert configuration
- Performance monitoring

## 8. Rollback Plan

### 8.1 Backend Rollback

```bash
# Stop current version
docker stop ssc-server

# Restore previous version from backup
docker run --name ssc-server --restart unless-stopped <previous-image-tag>
```

### 8.2 Smart Contract Rollback

If the proxy contract has issues:
1. Contract owner can pause the contract
2. Deploy new implementation
3. Upgrade proxy to point to new implementation
4. Verify new implementation on BSCScan

## 9. Security Checklist

- [ ] Environment variables set and secured
- [ ] Rate limiting enabled
- [ ] HTTPS/SSL configured
- [ ] JWT secrets are strong and unique
- [ ] Database password is strong
- [ ] BSC private key is secured
- [ ] Firewall rules configured
- [ ] Regular backups scheduled
- [ ] Audit logging enabled
