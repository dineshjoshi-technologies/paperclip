# DJ Technologies — Deployment Runbooks

## Table of Contents
1. [Production Deployment](#production-deployment)
2. [Staging Deployment](#staging-deployment)
3. [Feature Branch Deployment](#feature-branch-deployment)
4. [SSL Certificate Management](#ssl-certificate-management)
5. [Rollback Procedure](#rollback-procedure)
6. [Database Migration](#database-migration)
7. [Monitoring Setup](#monitoring-setup)
8. [Incident Response](#incident-response)
9. [Emergency Procedures](#emergency-procedures)

---

## Production Deployment

### Prerequisites
- All CI tests pass on `main` branch
- VPS secrets configured in GitHub (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`)
- SSL certificates provisioned (see [SSL Certificate Management](#ssl-certificate-management))
- Database backups completed

### Automated Deployment
```bash
git push origin main
```
The CI/CD pipeline automatically:
1. Runs lint and tests
2. Builds Docker images
3. Pushes to GitHub Container Registry
4. Deploys to VPS via SSH
5. Prunes old images

### Manual Deployment
```bash
ssh user@your-vps-host
cd /opt/dj-platform
git pull origin main
docker compose pull
docker compose up -d --remove-orphans
docker image prune -f
```

### Verify Deployment
```bash
# Check container health
docker compose ps

# Check logs
docker compose logs -f backend
docker compose logs -f frontend

# Test endpoints
curl -f https://yourdomain.com/health
curl -f https://yourdomain.com/api
```

---

## Staging Deployment

### Start Staging Environment
```bash
docker compose -f docker-compose.staging.yml up -d --build
```

### Access Staging
- Frontend: http://your-domain:8080
- Backend API: http://your-domain:8080/api
- Health: http://your-domain:8080/health
- Grafana: http://your-domain:3001 (admin/changeme-staging)

### Stop Staging
```bash
docker compose -f docker-compose.staging.yml down
```

---

## Feature Branch Deployment

### Deploy Feature Branch
```bash
# Deploy specific branch to isolated environment
git checkout feature-branch

# Use development compose for quick testing
docker compose -f docker-compose.dev.yml up -d --build

# Access at http://localhost:3000
```

### Clean Up Feature Deployment
```bash
docker compose -f docker-compose.dev.yml down --rmi local
```

---

## SSL Certificate Management

### Provision New Certificate
```bash
./scripts/ssl-provision.sh yourdomain.com admin@djtechnologies.com
```

### Renew Certificates
```bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

### Enable HTTPS
1. Uncomment HTTPS block in `nginx/conf.d/default.conf`
2. Replace `yourdomain.com` with actual domain
3. Comment out direct proxy in HTTP block (keep only ACME + redirect)
4. Run `docker compose up -d --build`

### Multi-Domain Support
```bash
./scripts/ssl-provision.sh domain1.com admin@djtechnologies.com
./scripts/ssl-provision.sh domain2.com admin@djtechnologies.com
```

---

## Rollback Procedure

### Rollback to Previous Version
```bash
ssh user@your-vps-host
cd /opt/dj-platform

# Check available images
docker images

# Rollback deployment
docker compose down
docker compose pull
docker compose up -d --remove-orphans
```

### Database Rollback
```bash
ssh user@your-vps-host
cd /opt/dj-platform
docker compose exec backend npx prisma migrate resolve --rolled-back <migration-name>
```

### Emergency Rollback Script
```bash
#!/bin/bash
# rollback.sh - Quick rollback to last known good state
cd /opt/dj-platform
docker compose pull
docker compose up -d --remove-orphans
echo "Rollback complete. Verifying..."
curl -f https://yourdomain.com/health || echo "WARNING: Health check failed"
```

---

## Database Migration

### Run Migrations
```bash
# Production
ssh user@your-vps-host
cd /opt/dj-platform
docker compose exec backend npx prisma migrate deploy

# Staging
docker compose -f docker-compose.staging.yml exec backend npx prisma migrate deploy
```

### Backup Database
```bash
ssh user@your-vps-host
docker exec dj-postgres pg_dump -U postgres dj_platform > backup-$(date +%Y%m%d-%H%M%S).sql

# Or use pg_dumpall for full backup
docker exec dj-postgres pg_dumpall -U postgres > full-backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore Database
```bash
cat backup.sql | docker exec -i dj-postgres psql -U postgres dj_platform
```

---

## Monitoring Setup

### Start Monitoring Stack
```bash
docker compose -f docker-compose.monitoring.yml up -d
```

### Access Monitoring Tools
- Prometheus: http://your-domain:9090
- Grafana: http://your-domain:3001 (admin/changeme-staging)
- Node Exporter: http://your-domain:9100/metrics
- cAdvisor: http://your-domain:8081

### Configure Grafana Dashboards
1. Login to Grafana
2. Import pre-configured dashboards from `monitoring/grafana/dashboards/`
3. Set up alert rules for P1 incidents

### Alert Rules (P1 Incidents)
| Metric | Threshold | Action |
|--------|-----------|--------|
| Backend down | 1 minute | Page on-call |
| High error rate | > 5% for 5 min | Notify team |
| CPU > 90% | 10 minutes | Auto-scale or alert |
| Memory > 85% | 10 minutes | Alert team |
| Disk > 80% | Immediate | Alert team |
| SSL expiring | < 7 days | Alert team |

---

## Incident Response

### P1 - Service Down
1. Check container status: `docker compose ps`
2. Review logs: `docker compose logs -f <service>`
3. If issue persists, rollback (see [Rollback Procedure](#rollback-procedure))
4. Notify team
5. Document incident

### P2 - Performance Degradation
1. Check monitoring dashboard
2. Review error logs
3. Check resource utilization via cAdvisor/Grafana
4. Scale or optimize as needed
5. Document findings

### P3 - Non-Critical Issue
1. Create support ticket
2. Investigate during business hours
3. Fix and deploy with next release

---

## Emergency Procedures

### Restart All Services
```bash
cd /opt/dj-platform
docker compose down
docker compose up -d
```

### Emergency Debug Session
```bash
# Access backend container
docker exec -it dj-backend sh

# Access frontend container
docker exec -it dj-frontend sh

# Check logs
docker compose logs --tail=100 -f
```

### Clear All Cache
```bash
docker compose down
docker system prune -af
docker compose up -d --build
```
