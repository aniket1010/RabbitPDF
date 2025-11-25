# Fix Authentication Issues

## Problem: WebSocket and API returning 401 after deleting users

The authentication is failing because:
1. Browser has invalid session cookie (from deleted user)
2. Or new session isn't being created properly after sign in
3. Or cookies aren't being sent due to HTTPS/SameSite issues

---

## Step 1: Clear Browser Session Completely

**In browser:**

1. **Open DevTools (F12) → Application tab**
2. **Clear Storage:**
   - Click "Clear site data" button
   - Or manually delete:
     - Cookies → `https://rabbitpdf.in` → Delete all
     - Local Storage → Clear all
     - Session Storage → Clear all
3. **Close browser completely** (not just tab)
4. **Reopen browser and go to `https://rabbitpdf.in`**
5. **Sign in again**

---

## Step 2: Check if Session is Created After Sign In

**On server, after signing in:**

```bash
cd ~/RabbitPDF

POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

# Check if session was created
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT s.id, s.\"userId\", u.email, s.\"expiresAt\" FROM \"Session\" s JOIN \"User\" u ON s.\"userId\" = u.id ORDER BY s.\"expiresAt\" DESC LIMIT 5;"
```

**Should show your new session. If empty, session creation is failing.**

---

## Step 3: Check Backend Auth Logs

**On server:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep -i "auth\|session\|401\|websocket"
```

**Look for:**
- `✅ [Auth] Authenticated user:` - Should see this after sign in
- `❌ [Auth] Authentication error:` - If you see this, auth is failing
- `🔌 [WebSocket] Connection attempt` - Should see connection attempts
- `❌ [WebSocket] Auth error:` - If you see this, WebSocket auth is failing

---

## Step 4: Temporarily Allow WebSocket Without Auth (For Testing)

**If you need to test data isolation without WebSocket auth blocking:**

**On server:**
```bash
nano backend/websocket.js
```

**Find (around line 25-33):**
```javascript
      } else {
        if (process.env.NODE_ENV !== 'production') {
          socket.userId = 'dev-user';
          socket.userEmail = 'dev@example.com';
          socket.userName = 'Developer';
          next();
        } else {
          next(new Error('Authentication failed'));
        }
      }
```

**Temporarily change to:**
```javascript
      } else {
        // TEMPORARY: Allow connection for testing data isolation
        console.warn('⚠️ [WebSocket] Allowing connection without auth for testing');
        // Use a temporary user ID based on socket ID
        socket.userId = `temp-${socket.id}`;
        socket.userEmail = 'temp@example.com';
        socket.userName = 'Temp User';
        next();
      }
```

**Rebuild backend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build backend
```

**Note:** This is ONLY for testing. WebSocket events won't work properly without real userId. Fix auth first.

---

## Step 5: Verify Better-Auth Cookie Settings

**The issue might be cookie SameSite/Secure settings for HTTPS.**

**Check frontend better-auth config:**

**On server:**
```bash
grep -r "cookie\|Cookie\|sameSite\|SameSite" frontend/src/lib/auth.ts
```

**For HTTPS, cookies need:**
- `sameSite: 'lax'` or `'none'`
- `secure: true` (if sameSite is 'none')

---

## Step 6: Test Authentication Flow

**1. Clear browser completely**
**2. Sign in**
**3. Check browser console for cookies:**
```javascript
console.log('Cookies:', document.cookie);
```

**Should see:** `better-auth.session_token=...` or `better-auth.session-token=...`

**4. Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep -i "auth\|authenticated"
```

**Should see:** `✅ [Auth] Authenticated user: { userId: '...', email: '...' }`

---

## Most Likely Fix

**The issue is likely invalid session cookie. Do this:**

1. **Clear browser completely** (Step 1)
2. **Sign in fresh**
3. **Check if session was created** (Step 2)
4. **If session exists but still 401, check backend logs** (Step 3)

**If session isn't being created, the issue is in better-auth sign-in flow.**

---

## Quick Test: Check Current Session

**In browser console (F12), after signing in:**

```javascript
// Check cookies
console.log('Cookies:', document.cookie);

// Try to get profile (should work if authenticated)
fetch('/api/user/profile', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log('Profile:', d))
  .catch(e => console.error('Error:', e));
```

**If this fails, authentication isn't working. Check backend logs for why.**

