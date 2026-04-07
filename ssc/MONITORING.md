# Monitoring and Alerting Setup

This guide covers setting up monitoring, logging, and alerting for the SSC Token Platform.

## 1. Health Check Endpoint

The backend provides a built-in health check:

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

### Monitoring Configuration

```bash
# Simple curl check
curl https://api.yourdomain.com/health

# Prometheus endpoint (if configured)
curl https://api.yourdomain.com/metrics
```

## 2. Application Logging

The server logs all requests, errors, and important events to stdout.

### Log Format

```
[timestamp] [level] [module] message
Example:
[2024-01-15T12:00:00Z] [INFO] [auth] User login successful: user@example.com
[2024-01-15T12:00:01Z] [ERROR] [database] Connection timeout after 30s
```

### Docker Logs

```bash
# View live logs
docker logs -f ssc-server

# View recent logs
docker logs --tail=100 ssc-server

# View logs with timestamps
docker logs -f --timestamps ssc-server
```

### Log Rotation

For production, configure log rotation:

```bash
# Create logrotate config
sudo tee /etc/logrotate.d/ssc <<EOF
/var/log/ssc/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    postrotate
        systemctl reload ssc-server
    endscript
}
EOF
```

## 3. Database Monitoring

### PostgreSQL

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, calls, mean_time FROM pg_stat_statements 
WHERE mean_time > 1000 ORDER BY mean_time DESC;

-- Check database size
SELECT pg_size_pretty(pg_database_size('ssc_production'));

-- Check table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) 
FROM pg_class 
WHERE relkind = 'r' 
ORDER BY pg_total_relation_size(oid) DESC 
LIMIT 10;
```

### Connection Pool Monitoring

```bash
# Check active connections
docker exec ssc-postgres psql -U postgres -d ssc -c "SELECT count(*) FROM pg_stat_activity;"
```

## 4. Redis Monitoring

```bash
# Redis info
docker exec ssc-redis redis-cli INFO

# Memory usage
docker exec ssc-redis redis-cli INFO memory

# Connected clients
docker exec ssc-redis redis-cli INFO clients
```

## 5. Nginx Monitoring

### Access Logs

```bash
# View recent requests
tail -f /var/log/nginx/access.log

# View status codes
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# View top IP addresses
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20
```

### Error Logs

```bash
# View errors
tail -f /var/log/nginx/error.log

# View recent errors
tail -100 /var/log/nginx/error.log
```

## 6. Smart Contract Monitoring

### BSC Network Monitoring

```bash
# Monitor new blocks
cast watch --rpc-url https://bsc-dataseed.binance.org/

# Check contract events
cast logs --address $SSC_TOKEN_PROXY_ADDRESS --rpc-url https://bsc-dataseed.binance.org/
```

### Key Events to Monitor

- `Mint` events (new token creation)
- `Burn` events (token destruction)
- `Pause`/`Unpause` events
- `Ownership` transfers
- `Proxy` upgrades

### Block Explorer URLs

- Proxy: `https://bscscan.com/address/$SSC_TOKEN_PROXY_ADDRESS`
- Implementation: `https://bscscan.com/address/$SSC_TOKEN_IMPL_ADDRESS`

## 7. Alert Configuration

### Critical Alerts

Set up alerts for:

| Alert | Threshold | Action |
|---|---|---|
| Server down | Health check fails 3 times | Page on-call |
| Database connection loss | Cannot connect to DB | Page on-call immediately |
| Redis connection loss | Cannot connect to Redis | Page on-call |
| High error rate | >5% of requests erroring | Notify team |
| High latency | p95 > 2s | Notify team |
| Disk space | <10% available | Alert and plan cleanup |
| Memory usage | >90% | Alert and investigate |
| Certificate expiry | <30 days | Renew certificate |

### Alerting Tools

#### Simple Cron-Based Health Checks

```bash
# Add to crontab (runs every 5 minutes)
*/5 * * * * curl -sf https://api.yourdomain.com/health || mail -s "SSC Health Check Failed" admin@yourdomain.com
```

#### Uptime Monitoring Services

Consider setting up free monitoring with:
- **UptimeRobot**: https://uptimerobot.com
- **Healthchecks.io**: https://healthchecks.io
- **Better Stack**: https://betterstack.com

### Database Backup Alerts

```bash
# Check if last backup was successful
# Script: /usr/local/bin/check-db-backup.sh

#!/bin/bash
BACKUP_DIR="/var/backups/ssc"
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql | head -1)
if [ -z "$LATEST_BACKUP" ]; then
    echo "No backup found!" | mail -s "DB Backup Missing" admin@yourdomain.com
    exit 1
fi
BACKUP_AGE=$(( $(date +%s) - $(stat -c %Y "$LATEST_BACKUP") ))
if [ $BACKUP_AGE -gt 86400 ]; then
    echo "Backup is older than 24 hours!" | mail -s "DB Backup Stale" admin@yourdomain.com
    exit 1
fi
```

## 8. Performance Monitoring

### Server Metrics

```bash
# CPU Usage
top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}'

# Memory Usage
free -m | awk '/Mem/{printf "Memory: %.0f%% used\n", $3/$2*100}'

# Disk Usage
df -h | grep -E '^(/dev/|Filesystem)'

# Network I/O
cat /proc/net/dev
```

### Database Query Performance

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- View query statistics
SELECT schemaname, relname, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch
FROM pg_stat_user_tables
ORDER BY seq_tup_read DESC
LIMIT 10;
```

## 9. Setting Up Prometheus + Grafana (Optional)

### Docker Compose

Add to docker-compose.yml:

```yaml
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    profiles:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    profiles:
      - monitoring
```

### Prometheus Config

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ssc-server'
    static_configs:
      - targets: ['server:3001']
```

## 10. Incident Response

### 1. Server Down

```bash
# Restart server
docker restart ssc-server

# Check logs
docker logs --tail=50 ssc-server

# If needed, rebuild
docker compose up -d --build server
```

### 2. Database Issues

```bash
# Restart PostgreSQL
docker restart ssc-postgres

# Check database status
docker exec ssc-postgres pg_isready -U postgres

# Restore from backup if needed
docker exec -i ssc-postgres psql -U postgres -d ssc < backup.sql
```

### 3. Smart Contract Issues

- If contract is paused: Unpause if owner
- If malicious activity detected: Pause immediately, investigate
- If upgrade needed: Deploy new implementation and upgrade proxy

### 4. Contact Information

- **Primary On-Call**: [Name, Phone, Email]
- **Secondary On-Call**: [Name, Phone, Email]
- **Escalation Contact**: [Name, Phone, Email]
- **Support Slack**: #ssc-alerts
