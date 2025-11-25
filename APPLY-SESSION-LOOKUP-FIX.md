# Apply Session Lookup Fix

## ✅ Fix Applied Locally

**Changed session lookup from `findUnique` to `findFirst` with `startsWith`.**

**Why:** Better-auth stores the full signed token in the database, not just the session ID. We need to match the beginning of the token.

---

## 🚀 Step 1: Apply Fix to Server

**Option A: Use Git (Recommended)**

**On Windows:**
```powershell
cd D:\all_my_code\projects\chatPDF
git add backend/utils/auth.js
git commit -m "Fix: Use startsWith for session lookup - better-auth stores full token"
git push
```

**On server:**
```bash
cd ~/RabbitPDF
git pull
docker-compose -f docker-compose.production.yml restart backend
```

**Option B: Edit Directly on Server**

**SSH to server:**
```bash
nano backend/utils/auth.js
```

**Find line 50 (around `prisma.session.findUnique`):**

**Change from:**
```javascript
const userSession = await prisma.session.findUnique({
  where: { token: sessionId },
  include: { user: true }
});
```

**To:**
```javascript
const userSession = await prisma.session.findFirst({
  where: { 
    token: { startsWith: sessionId }
  },
  include: { user: true }
});
```

**Also find line 147 (WebSocket auth) and change:**

**From:**
```javascript
const session = await prisma.session.findUnique({
  where: { 
    token: sessionId 
  },
```

**To:**
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

## ✅ Step 2: Test

**In browser:**
1. Clear cookies
2. Sign in
3. Try to update username or load conversations

**Should work now!**

**Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 30 | grep "🔍 \[Auth\]"
```

**Should show:** `Session lookup result: FOUND` ✅

---

## 🎯 What This Fixes

**Before:** Looking for exact match of session ID (32 chars)
**After:** Looking for token that STARTS WITH session ID (matches full signed token)

**This matches how better-auth stores sessions in the database!**

