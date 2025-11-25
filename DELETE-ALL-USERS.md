# Delete All Users from Database

## Quick Command

**On your server:**

```bash
cd ~/RabbitPDF

# Make script executable
chmod +x delete-all-users.sh

# Run the script
./delete-all-users.sh
```

**Or run directly:**

```bash
cd ~/RabbitPDF

# Get database credentials
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

# Delete all data
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<EOF
DELETE FROM "Message";
DELETE FROM "Conversation";
DELETE FROM "Account";
DELETE FROM "Session";
DELETE FROM "Verification";
DELETE FROM "PendingUser";
DELETE FROM "User";
EOF

# Verify deletion
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 'Users' as table_name, COUNT(*) FROM \"User\" UNION ALL SELECT 'Conversations', COUNT(*) FROM \"Conversation\" UNION ALL SELECT 'Sessions', COUNT(*) FROM \"Session\";"
```

---

## What Gets Deleted

- ✅ All users
- ✅ All conversations
- ✅ All messages
- ✅ All sessions
- ✅ All accounts
- ✅ All verification records
- ✅ All pending users

---

## After Deletion

1. **Sign up with Account A:**
   - Create a conversation
   - Update username
   - Rename conversation

2. **Sign out and Sign up with Account B:**
   - Should NOT see Account A's conversations
   - Should NOT see Account A's username
   - Create own conversation

3. **Sign back in as Account A:**
   - Should see only Account A's conversations
   - Should see Account A's username

4. **Test WebSocket events:**
   - Update username in Account A → Should only update in Account A
   - Rename conversation in Account A → Should only update in Account A
   - Account B should NOT see these changes

---

## Verify Data Isolation

**Check database directly:**

```bash
# List all users
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, email, name FROM \"User\";"

# List all conversations with their users
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, title, \"userId\" FROM \"Conversation\";"
```

**Each conversation should have a different userId matching the user who created it.**

