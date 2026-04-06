#!/bin/bash
# Database backup script - runs via cron for automated scheduled backups
# Usage: ./backup-db.sh [output_dir]

set -euo pipefail

BACKUP_DIR="${1:-/var/backups/dj-platform/postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dj_platform_$TIMESTAMP.sql.gz"
CONTAINER_NAME="dj-postgres"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "[$(date -Iseconds)] Starting database backup..."

# Run pg_dump inside the container and compress
docker exec "$CONTAINER_NAME" pg_dump -U postgres dj_platform | gzip > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date -Iseconds)] Backup completed successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
    echo "[$(date -Iseconds)] ERROR: Backup file not created!" >&2
    exit 1
fi

# Clean up old backups
echo "[$(date -Iseconds)] Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "dj_platform_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

# Count remaining backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/dj_platform_*.sql.gz 2>/dev/null | wc -l)
echo "[$(date -Iseconds)] Retaining $BACKUP_COUNT backups"

echo "[$(date -Iseconds)] Backup completed"
