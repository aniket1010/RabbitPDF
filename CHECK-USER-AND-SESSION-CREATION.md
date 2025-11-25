# Check User and Session Creation

## 🔍 Step 1: Check If User Exists

**On server:**
```bash
cd ~/RabbitPDF
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, email, \"emailVerified\", \"createdAt\" FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

**Share the output** - Do users exist? What are their emails?

---

## 🔍 Step 2: Check Sessions for Your User

**Find your user ID first, then check their sessions:**

```bash
# Get your user ID (replace EMAIL with your actual email)
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, email FROM \"User\" WHERE email = 'YOUR_EMAIL_HERE';"
```

**Then check sessions for that user:**

```bash
# Replace USER_ID with actual user ID from above
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT token, \"userId\", \"expiresAt\", \"createdAt\" FROM \"Session\" WHERE \"userId\" = 'USER_ID' ORDER BY \"createdAt\" DESC LIMIT 5;"
```

**Share the output** - What sessions exist for your user?

---

## 🔍 Step 3: Check What Happens When You Sign In

**Clear cookies, sign in, then immediately check:**

**In browser:**
1. Clear ALL cookies
2. Sign in
3. **Within 5 seconds**, check database

**On server (right after signing in):**
```bash
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT token, \"userId\", \"expiresAt\", \"createdAt\" FROM \"Session\" ORDER BY \"createdAt\" DESC LIMIT 1;"
```

**Share the output** - Does a new session appear?

---

## 🎯 Answer: User Existing Shouldn't Matter

**Better-auth should create a NEW session on sign-in regardless of whether user exists.**

**The issue is:**
- Old cookie has expired/deleted session
- Need to sign in fresh to create new session
- New session will match database

**But let's verify sessions are being created correctly!**

---

## 📋 Run Step 1 and Step 2 First

**Check if users exist and what sessions they have!**

