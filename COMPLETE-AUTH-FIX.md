# Complete Authentication Fix Guide

## Problem: 401 Unauthorized - Sessions exist but backend can't find them

---

## Step 1: Copy Updated Auth File to Server

### Option A: Using SCP (From Windows PowerShell)

```powershell
cd D:\all_my_code\projects\chatPDF
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem backend\utils\auth.js ubuntu@51.20.135.170:~/RabbitPDF/backend/utils/
```

### Option B: Edit Directly on Server

```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
nano backend/utils/auth.js
```

**Find the `verifyAuth` function (around line 5) and add this logging:**

**After line 18 (after `sessionToken = cookies[...]`), add:**
```javascript
    // DEBUG: Log what we received
    console.log('🔍 [Auth] Session token received:', sessionToken ? 'EXISTS' : 'MISSING');
    if (sessionToken) {
      console.log('🔍 [Auth] Token preview:', sessionToken.substring(0, 30) + '...');
      console.log('🔍 [Auth] Token length:', sessionToken.length);
    }
```

**After line 29 (after `const sessionId = sessionToken.split('.')[0];`), add:**
```javascript
    console.log('🔍 [Auth] Extracted session ID:', sessionId);
    console.log('🔍 [Auth] Session ID length:', sessionId.length);
```

**After line 34 (after `include: { user: true }`), add:**
```javascript
    console.log('🔍 [Auth] Session lookup result:', userSession ? 'FOUND' : 'NOT FOUND');
    if (userSession) {
      console.log('🔍 [Auth] Session userId:', userSession.userId);
      console.log('🔍 [Auth] Session expiresAt:', userSession.expiresAt);
    } else {
      // DEBUG: Check what tokens exist in database
      const allSessions = await prisma.session.findMany({
        select: { token: true, userId: true },
        take: 3,
        orderBy: { expiresAt: 'desc' }
      });
      console.log('🔍 [Auth] Available session tokens in DB (first 20 chars):', allSessions.map(s => s.token.substring(0, 20)));
    }
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 2: Rebuild Backend

**On server:**
```bash
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d --build backend
```

**Wait for rebuild (1-2 minutes), then verify:**
```bash
docker-compose -f docker-compose.production.yml ps backend
```

**Should show:** `Up` status

---

## Step 3: Check Database Session Tokens

**On server:**
```bash
cd ~/RabbitPDF

POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

# Check what session tokens exist
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT LEFT(token, 30) as token_preview, \"userId\", \"expiresAt\" FROM \"Session\" ORDER BY \"expiresAt\" DESC LIMIT 3;"
```

**Copy the output - we'll compare this with what the cookie has.**

---

## Step 4: Check Browser Cookie

**In browser (F12 → Console), after signing in:**

```javascript
// Get session cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const sessionToken = getCookie('better-auth.session_token') || getCookie('better-auth.session-token');
console.log('=== COOKIE DEBUG ===');
console.log('Session token exists:', !!sessionToken);
if (sessionToken) {
  console.log('Token preview:', sessionToken.substring(0, 30));
  console.log('Token length:', sessionToken.length);
  const sessionId = sessionToken.split('.')[0];
  console.log('Session ID (before dot):', sessionId);
  console.log('Session ID length:', sessionId.length);
} else {
  console.log('No session token found!');
  console.log('All cookies:', document.cookie);
}
```

**Copy the output.**

---

## Step 5: Watch Backend Logs While Testing

**On server, run this command (keep it running):**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 0 -f
```

**Then in browser:**
1. Go to `https://rabbitpdf.in`
2. Try to load conversations (should trigger `/api/conversation/list`)

**In the logs, you should see:**
- `🔍 [Auth] Session token received: EXISTS` or `MISSING`
- `🔍 [Auth] Token preview: ...`
- `🔍 [Auth] Extracted session ID: ...`
- `🔍 [Auth] Session lookup result: FOUND` or `NOT FOUND`
- `🔍 [Auth] Available session tokens in DB: ...`

**Copy the log output.**

---

## Step 6: Compare and Fix

**After getting outputs from Steps 3, 4, and 5:**

### Issue 1: Cookie Token Doesn't Match DB Token

**If the session ID from cookie doesn't match any token in DB:**

**Check if Better-Auth is using a different token format. The token might be:**
- Signed/encrypted differently
- Using full token instead of just session ID
- Using a different field

**Fix: Try matching the full token instead of just session ID:**

**On server:**
```bash
nano backend/utils/auth.js
```

**Find (around line 31):**
```javascript
    const userSession = await prisma.session.findUnique({
      where: { token: sessionId },
      include: { user: true }
    });
```

**Try this instead (match full token):**
```javascript
    // Try matching full token first
    let userSession = await prisma.session.findFirst({
      where: { 
        token: { startsWith: sessionId }
      },
      include: { user: true }
    });
    
    // If not found, try exact match
    if (!userSession) {
      userSession = await prisma.session.findUnique({
        where: { token: sessionId },
        include: { user: true }
      });
    }
```

### Issue 2: Cookie Not Being Sent

**If logs show `Session token received: MISSING`:**

**Check nginx is forwarding cookies:**

**On server:**
```bash
sudo grep -A 5 "location /api" /etc/nginx/sites-available/rabbitpdf | grep -i cookie
```

**Should show:** `proxy_set_header Cookie $http_cookie;`

**If missing, add it to nginx config.**

### Issue 3: Session Token Format Wrong

**If token preview doesn't match DB tokens:**

**Better-Auth might be using signed tokens. Check if we need to verify the signature:**

**The token format might be:** `sessionId.signature`

**We're only using `sessionId`, which should be correct, but verify.**

---

## Step 7: Quick Test - Temporarily Allow All (For Testing Only)

**If you need to test data isolation without auth blocking:**

**On server:**
```bash
nano backend/utils/auth.js
```

**Find `verifyAuth` function and temporarily change to:**

```javascript
async function verifyAuth(req, res, next) {
  // TEMPORARY: Allow all for testing data isolation
  console.warn('⚠️ [Auth] TEMPORARY: Allowing all requests');
  
  // Try to get real userId from session if possible
  try {
    let sessionToken = req.cookies && (req.cookies['better-auth.session_token'] || req.cookies['better-auth.session-token']);
    
    if (!sessionToken && req.headers.cookie) {
      const cookies = {};
      req.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.trim().split('=');
        if (parts.length === 2) {
          cookies[parts[0]] = decodeURIComponent(parts[1]);
        }
      });
      sessionToken = cookies['better-auth.session_token'] || cookies['better-auth.session-token'];
    }
    
    if (sessionToken) {
      const sessionId = sessionToken.split('.')[0];
      const userSession = await prisma.session.findFirst({
        where: { token: { startsWith: sessionId } },
        include: { user: true }
      });
      
      if (userSession) {
        req.userId = userSession.userId;
        req.userEmail = userSession.user.email;
        req.userName = userSession.user.name;
        console.log('✅ [Auth] Found session:', req.userId);
        return next();
      }
    }
  } catch (e) {
    console.error('Error in temp auth:', e);
  }
  
  // Fallback: use temp user
  req.userId = 'temp-user-' + Date.now();
  req.userEmail = 'temp@example.com';
  req.userName = 'Temp User';
  next();
}
```

**Rebuild:**
```bash
docker-compose -f docker-compose.production.yml up -d --build backend
```

**This will allow requests and try to extract real userId. Good for testing data isolation.**

---

## Step 8: Share Results

**After running Steps 1-5, share:**

1. **Database session tokens** (from Step 3)
2. **Browser cookie output** (from Step 4)
3. **Backend logs** (from Step 5)

**Then I'll give you the exact fix based on what we find.**

---

## Quick Summary - Do These Steps:

1. ✅ Copy `backend/utils/auth.js` to server (with debug logging)
2. ✅ Rebuild backend
3. ✅ Check database session tokens
4. ✅ Check browser cookie
5. ✅ Watch backend logs while accessing app
6. ✅ Share results → I'll give exact fix

**The debug logs will show us exactly why the session lookup is failing!**

