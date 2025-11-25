#!/bin/bash

# Fix all Account table constraints for Better Auth compatibility

echo "🔧 Fixing Account table constraints..."

# Make provider nullable (Better Auth uses providerId)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "provider" DROP NOT NULL;'

# Make providerAccountId nullable (Better Auth uses accountId)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "providerAccountId" DROP NOT NULL;'

echo "✅ All constraints fixed!"

# Verify changes
echo "📋 Verifying Account table structure..."
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

echo "🔄 Restarting frontend..."
docker-compose -f docker-compose.production.yml restart frontend

echo "✅ Done! Test OAuth sign-in now."



