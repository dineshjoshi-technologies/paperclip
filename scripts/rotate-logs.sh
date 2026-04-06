#!/bin/bash
# Nginx log rotation script
# Usage: ./rotate-logs.sh [log_dir] [retention_days]

set -euo pipefail

LOG_DIR="${1:-/var/log/nginx}"
RETENTION_DAYS="${2:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$LOG_DIR/archive"

echo "[$(date -Iseconds)] Rotating Nginx logs..."

for log_file in "$LOG_DIR"/*.log; do
    if [ -f "$log_file" ]; then
        BASENAME=$(basename "$log_file" .log)
        ARCHIVE="$LOG_DIR/archive/${BASENAME}_${TIMESTAMP}.gz"

        # Rotate and compress
        if [ -s "$log_file" ]; then
            gzip -c "$log_file" > "$ARCHIVE"
            truncate -s 0 "$log_file"
            echo "[$(date -Iseconds)] Rotated: $log_file -> $ARCHIVE"
        fi
    fi
done

# Clean old archives
find "$LOG_DIR/archive" -name "*.gz" -mtime +"$RETENTION_DAYS" -delete

echo "[$(date -Iseconds)] Log rotation complete"
