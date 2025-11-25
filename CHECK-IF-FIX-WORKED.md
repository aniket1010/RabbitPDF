# Check If Fix Worked - Debug 401 Error

## 🔍 Step 1: Check Backend Logs

**On server, check if session is being found:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep "🔍 \[Auth\]"
```

**Look for:**
- `Session lookup result: FOUND` ✅ (means fix worked)
- `Session lookup result: NOT FOUND` ❌ (means still not working)

**Share the output!**

---

## 🔍 Step 2: Verify File Was Updated

**Check if the file has the fix:**

```bash
cat backend/utils/auth.js | grep -A 3 "findFirst"
```

**Should show:**
```javascript
const userSession = await prisma.session.findFirst({
  where: { 
    token: { startsWith: sessionId }
```

**If it shows `findUnique` instead, the file wasn't updated correctly.**

---

## 🔍 Step 3: Check What Tokens Are in Database

**The cookie has:** `FVlbndWbMEGrQK97NnX37j3MdGXPb9Eo`

**Let's check if any token in DB starts with this:**

```bash
cd ~/RabbitPDF
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT token, \"userId\", \"expiresAt\" FROM \"Session\" WHERE token LIKE 'FVlbndWbMEGrQK97NnX37j3MdGXPb9Eo%';"
```

**Share the output** - This shows if any session token starts with the cookie's session ID.

---

## 🔍 Step 4: Check If Session Expired

**Check all sessions and their expiry:**

```bash
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT LEFT(token, 20) as token_preview, \"userId\", \"expiresAt\", CASE WHEN \"expiresAt\" < NOW() THEN 'EXPIRED' ELSE 'VALID' END as status FROM \"Session\" ORDER BY \"expiresAt\" DESC LIMIT 5;"
```

**Share the output** - This shows if sessions are expired.

---

## 🎯 Possible Issues

### Issue 1: File Not Updated
**If `grep findFirst` shows nothing, file wasn't copied correctly.**

**Fix:** Copy file again or edit manually.

### Issue 2: Session Not in Database
**If database query returns no rows, session doesn't exist.**

**Fix:** Sign in again to create a new session.

### Issue 3: Session Expired
**If all sessions are expired, need to sign in again.**

**Fix:** Clear cookies and sign in fresh.

### Issue 4: Backend Not Restarted
**If backend wasn't restarted, old code is still running.**

**Fix:** Restart backend.

---

## 🚀 Quick Checks

**Run these commands and share outputs:**

1. **Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 30 | grep "Session lookup result"
```

2. **Verify file has fix:**
```bash
cat backend/utils/auth.js | grep "findFirst" | head -2
```

3. **Check if backend restarted:**
```bash
docker-compose -f docker-compose.production.yml ps backend
```

**Share all 3 outputs!**

