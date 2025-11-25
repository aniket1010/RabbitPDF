# Debug Authentication Failure

## Step 1: Check if Session is Created After Sign-In

**On server, after you sign in:**

```bash
cd ~/RabbitPDF

POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

# Check if session was created
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT s.id, u.email, u.name, s.\"expiresAt\", s.token FROM \"Session\" s JOIN \"User\" u ON s.\"userId\" = u.id ORDER BY s.\"expiresAt\" DESC LIMIT 5;"
```

**If empty → Session creation is failing. Check better-auth sign-in flow.**

**If sessions exist → Check if cookie is being sent correctly.**

---

## Step 2: Check Backend Auth Logs

**On server:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep -i "auth\|session\|401\|authenticated"
```

**Look for:**
- `✅ [Auth] Authenticated user:` - Good, auth is working
- `❌ [Auth] Authentication error:` - Bad, auth is failing
- `Session not found` - Cookie doesn't match any session
- `Session expired` - Session expired

---

## Step 3: Check Browser Cookies

**In browser console (F12), after signing in:**

```javascript
// Check all cookies
console.log('All cookies:', document.cookie);

// Check specific cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

console.log('Session token:', getCookie('better-auth.session_token') || getCookie('better-auth.session-token'));
```

**If cookie is missing → Better-auth isn't setting cookies properly.**

---

## Step 4: Test API Call with Cookie

**In browser console:**

```javascript
// Test if cookie is sent with request
fetch('/api/user/profile', { 
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', [...r.headers.entries()]);
    return r.json();
  })
  .then(d => console.log('✅ Response:', d))
  .catch(e => console.error('❌ Error:', e));
```

**If 401 → Cookie isn't being sent or session doesn't exist.**

---

## Step 5: Check Better-Auth Cookie Settings

**For HTTPS, cookies need proper SameSite/Secure settings.**

**On server, check better-auth config:**

```bash
grep -r "cookie\|Cookie\|sameSite\|SameSite\|secure" frontend/src/lib/auth.ts
```

**Should have:**
- `sameSite: 'lax'` or `'none'` (for HTTPS)
- `secure: true` (if sameSite is 'none')

---

## Step 6: Check Network Tab

**In browser DevTools:**

1. Go to **Network** tab
2. Filter by **Fetch/XHR**
3. Click on `/api/conversation/list` request
4. Check **Headers** tab:
   - **Request Headers** → Look for `Cookie:` header
   - **Response Headers** → Look for `Set-Cookie:` header

**If Cookie header is missing → Cookies aren't being sent.**
**If Set-Cookie is missing → Server isn't setting cookies.**

---

## Step 7: Temporarily Disable Auth (For Testing)

**If you need to test data isolation without auth blocking:**

**On server:**
```bash
nano backend/utils/auth.js
```

**Find `verifyAuth` function and temporarily allow all:**

```javascript
async function verifyAuth(req, res, next) {
  // TEMPORARY: Allow all for testing
  console.warn('⚠️ [Auth] TEMPORARY: Allowing all requests');
  req.userId = 'test-user-' + Date.now();
  req.userEmail = 'test@example.com';
  req.userName = 'Test User';
  return next();
}
```

**Also update WebSocket auth:**

```bash
nano backend/websocket.js
```

**Change to:**
```javascript
      } else {
        // TEMPORARY: Allow all for testing
        console.warn('⚠️ [WebSocket] TEMPORARY: Allowing connection');
        socket.userId = 'test-user-' + Date.now();
        socket.userEmail = 'test@example.com';
        socket.userName = 'Test User';
        next();
      }
```

**Rebuild backend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build backend
```

**Note:** This is ONLY for testing. Real auth must work for production.

---

## Most Likely Issues:

1. **Session not created** → Check better-auth sign-in flow
2. **Cookie not set** → Check better-auth cookie settings for HTTPS
3. **Cookie not sent** → Check browser SameSite/Secure settings
4. **Session expired** → Check session expiration time

---

## Quick Diagnostic:

**Run this on server to check everything:**

```bash
#!/bin/bash
echo "=== Auth Diagnostic ==="

echo "1. Checking sessions in database..."
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) as session_count FROM \"Session\"; SELECT COUNT(*) as user_count FROM \"User\";"

echo ""
echo "2. Checking backend logs..."
docker-compose -f docker-compose.production.yml logs backend --tail 20 | grep -i "auth\|session" | tail -5

echo ""
echo "3. Testing API endpoint..."
curl -I https://rabbitpdf.in/api/user/profile 2>&1 | head -5

echo ""
echo "=== Done ==="
```

**Share the output and I'll help fix the specific issue.**

