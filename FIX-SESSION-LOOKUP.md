# Fix Session Lookup - Session Not Found

## 🎯 Problem Found

**Cookies reach backend ✅**
**Session token extracted ✅**
**But session NOT FOUND in database ❌**

**Cookie session ID:** `FVlbndWbMEGrQK97NnX37j3MdGXPb9Eo`
**Database has:** `lq5Dw7WT5Smzm2701ZWQ`, `l3sIJ7IUXfeQIen2rkFP`, `vd7VFUftSfPdHVZKiLzg`

**These don't match!**

---

## 🔍 Step 1: Check What's Actually in Database

**On server, check full session tokens:**

```bash
cd ~/RabbitPDF
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT token, \"userId\", \"expiresAt\" FROM \"Session\" ORDER BY \"expiresAt\" DESC LIMIT 5;"
```

**Share the output** - This shows what tokens are actually stored.

---

## 🔍 Step 2: Check If Better-Auth Stores Full Token or Just ID

**Better-auth might store:**
- Option A: Just the session ID (32 chars) - what we're looking for
- Option B: Full signed token (with dot and signature) - need to use `startsWith`

**Let's check by looking at token lengths:**

```bash
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT LENGTH(token) as token_length, LEFT(token, 20) as token_preview FROM \"Session\" LIMIT 5;"
```

**Share the output** - This shows token lengths.

---

## 🔍 Step 3: Fix Session Lookup

**If tokens in DB are longer than 32 chars, we need to use `startsWith`:**

**On server:**
```bash
nano backend/utils/auth.js
```

**Find line 50 (around `prisma.session.findUnique`):**

**Current:**
```javascript
const userSession = await prisma.session.findUnique({
  where: { token: sessionId },
  include: { user: true }
});
```

**Change to:**
```javascript
// Better-auth stores full signed token, so use startsWith
const userSession = await prisma.session.findFirst({
  where: { 
    token: { startsWith: sessionId }
  },
  include: { user: true }
});
```

**Also update WebSocket auth (around line 147):**

**Find:**
```javascript
const session = await prisma.session.findUnique({
  where: { 
    token: sessionId 
  },
```

**Change to:**
```javascript
const session = await prisma.session.findFirst({
  where: { 
    token: { startsWith: sessionId }
  },
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Restart backend:**
```bash
docker-compose -f docker-compose.production.yml restart backend
```

---

## 🔍 Step 4: Alternative - Check Token Format

**If better-auth stores just the ID (32 chars), then the issue is:**
- Session was created but with different ID
- Session expired and was deleted
- Better-auth isn't creating sessions correctly

**Check if new sessions are being created:**

**Sign in again, then check:**
```bash
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT token, \"userId\", \"expiresAt\" FROM \"Session\" ORDER BY \"createdAt\" DESC LIMIT 3;"
```

**Does a new session appear with the cookie's session ID?**

---

## 🚀 Quick Fix to Try First

**Try using `startsWith` lookup:**

**On server:**
```bash
nano backend/utils/auth.js
```

**Find line 50 and change `findUnique` to `findFirst` with `startsWith`:**

```javascript
const userSession = await prisma.session.findFirst({
  where: { 
    token: { startsWith: sessionId }
  },
  include: { user: true }
});
```

**Do the same for WebSocket auth (around line 147).**

**Restart and test!**

---

## 📋 Run Step 1 First

**Check what tokens are actually in the database - this will tell us if we need `startsWith` or if sessions aren't being created correctly!**

