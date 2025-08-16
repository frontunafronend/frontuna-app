#!/bin/bash

# Database backup script for Neon PostgreSQL
# Usage: ./scripts/backup.sh [destination_path]

set -e  # Exit on any error

# Load environment variables
source .env 2>/dev/null || echo "Warning: .env file not found"

# Configuration
BACKUP_DIR=${1:-"./backups"}
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="neon_backup_${DATE}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "🗄️  Starting Neon database backup..."
echo "📅 Date: $(date)"
echo "🎯 Target: $BACKUP_PATH"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Create the backup
echo "📦 Creating backup..."
pg_dump "$DATABASE_URL" > "$BACKUP_PATH"

# Check if backup was successful
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    echo "✅ Backup completed successfully!"
    echo "📁 File: $BACKUP_PATH"
    echo "📏 Size: $BACKUP_SIZE"
    
    # Compress the backup
    echo "🗜️  Compressing backup..."
    gzip "$BACKUP_PATH"
    COMPRESSED_PATH="${BACKUP_PATH}.gz"
    COMPRESSED_SIZE=$(du -h "$COMPRESSED_PATH" | cut -f1)
    echo "✅ Compression completed!"
    echo "📁 Compressed file: $COMPRESSED_PATH"
    echo "📏 Compressed size: $COMPRESSED_SIZE"
    
    # Clean up old backups (keep last 7 days)
    echo "🧹 Cleaning up old backups..."
    find "$BACKUP_DIR" -name "neon_backup_*.sql.gz" -type f -mtime +7 -delete
    
    # Optional: Upload to cloud storage (uncomment and configure as needed)
    # echo "☁️  Uploading to cloud storage..."
    # aws s3 cp "$COMPRESSED_PATH" "s3://your-backup-bucket/database-backups/"
    # echo "✅ Upload completed!"
    
    echo "🎉 Backup process completed successfully!"
else
    echo "❌ Backup failed!"
    exit 1
fi
