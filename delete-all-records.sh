#!/bin/bash

# Script to delete all records from the database
# Run this on your server where Docker containers are running

echo "🗑️  Deleting all records from database..."

# Get database credentials from .env file (if exists)
if [ -f .env ]; then
    POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
    POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')
else
    # Use defaults from docker-compose
    POSTGRES_USER="chatpdf_user"
    POSTGRES_DB="chatpdf_production"
fi

echo "Using database user: $POSTGRES_USER"
echo "Using database: $POSTGRES_DB"

# Connect to postgres container and delete all records
# Order matters due to foreign key constraints
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<EOF

-- Delete in order to respect foreign key constraints
DELETE FROM "Message";
DELETE FROM "Conversation";
DELETE FROM "Account";
DELETE FROM "Session";
DELETE FROM "User";
DELETE FROM "Verification";

-- Show counts to verify
SELECT 'Message' as table_name, COUNT(*) as count FROM "Message"
UNION ALL
SELECT 'Conversation', COUNT(*) FROM "Conversation"
UNION ALL
SELECT 'Account', COUNT(*) FROM "Account"
UNION ALL
SELECT 'Session', COUNT(*) FROM "Session"
UNION ALL
SELECT 'User', COUNT(*) FROM "User"
UNION ALL
SELECT 'Verification', COUNT(*) FROM "Verification";

EOF

echo ""
echo "✅ All records deleted!"


