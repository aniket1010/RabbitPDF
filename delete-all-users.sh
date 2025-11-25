#!/bin/bash
# Script to delete all users and related data from the chatPDF database

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
else
  echo "Error: .env file not found!"
  exit 1
fi

# Get PostgreSQL credentials
POSTGRES_USER=${POSTGRES_USER:-chatpdf_user}
POSTGRES_DB=${POSTGRES_DB:-chatpdf_production}

echo "⚠️  WARNING: This will delete ALL users and related data!"
echo "Database: $POSTGRES_DB"
echo "User: $POSTGRES_USER"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

echo "Connecting to PostgreSQL database: $POSTGRES_DB with user: $POSTGRES_USER"

# Execute SQL commands to delete records in correct order to respect foreign key constraints
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<EOF
-- Delete in order to respect foreign key constraints

-- First, delete all messages (references conversations)
DELETE FROM "Message";

-- Delete all conversations (references users)
DELETE FROM "Conversation";

-- Delete all accounts (references users)
DELETE FROM "Account";

-- Delete all sessions (references users)
DELETE FROM "Session";

-- Delete all verification records (references users)
DELETE FROM "Verification";

-- Delete all pending users
DELETE FROM "PendingUser";

-- Finally, delete all users
DELETE FROM "User";

-- Verify deletion
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
SELECT 'Verification', COUNT(*) FROM "Verification"
UNION ALL
SELECT 'PendingUser', COUNT(*) FROM "PendingUser";
EOF

echo ""
echo "✅ All users and related data deleted!"
echo ""
echo "You can now test with fresh accounts."

