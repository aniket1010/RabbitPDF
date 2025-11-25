# Fix Session Recognition Issue

## Problem: Sessions exist but backend can't find them

You have 3 sessions and 2 users, but backend returns 401. This means:
- Sessions ARE being created ✅
- Backend can't find/match the session cookie ❌

---

## Step 1: Check What Session Token Format Better-Auth Uses

**On server, check actual session tokens:**

```bash
cd ~/RabbitPDF

POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

# Check session token format
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT LEFT(token, 20) as token_preview, \"userId\", \"expiresAt\" FROM \"Session\" ORDER BY \"expiresAt\" DESC LIMIT 3;"
```

**This shows the token format stored in database.**

---

## Step 2: Check What Cookie Browser Has

**In browser console (F12), after signing in:**

```javascript
// Get the session cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const sessionToken = getCookie('better-auth.session_token') || getCookie('better-auth.session-token');
console.log('Session token from cookie:', sessionToken);
console.log('Token length:', sessionToken?.length);
console.log('Token preview:', sessionToken?.substring(0, 30));

// Extract session ID (part before dot)
const sessionId = sessionToken?.split('.')[0];
console.log('Session ID (before dot):', sessionId);
console.log('Session ID length:', sessionId?.length);
```

**Share the output.**

---

## Step 3: Add Debug Logging to Backend Auth

**On server:**
```bash
nano backend/utils/auth.js
```

**Find the `verifyAuth` function (around line 5) and add logging:**

```javascript
async function verifyAuth(req, res, next) {
  try {
    // Parse cookies if they're not already parsed by cookie-parser
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
    
    // DEBUG: Log what we received
    console.log('🔍 [Auth] Session token received:', sessionToken ? 'EXISTS' : 'MISSING');
    if (sessionToken) {
      console.log('🔍 [Auth] Token preview:', sessionToken.substring(0, 30));
      console.log('🔍 [Auth] Token length:', sessionToken.length);
    }
    
    if (!sessionToken) {
      console.warn('⚠️ [Auth] No session token found in cookies');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    // Better Auth uses signed tokens - extract the session ID (part before the dot)
    const sessionId = sessionToken.split('.')[0];
    console.log('🔍 [Auth] Extracted session ID:', sessionId);
    console.log('🔍 [Auth] Session ID length:', sessionId.length);
    
    // Try to find the session using the session ID
    const userSession = await prisma.session.findUnique({
      where: { token: sessionId },
      include: { user: true }
    });

    console.log('🔍 [Auth] Session lookup result:', userSession ? 'FOUND' : 'NOT FOUND');
    if (userSession) {
      console.log('🔍 [Auth] Session userId:', userSession.userId);
      console.log('🔍 [Auth] Session expiresAt:', userSession.expiresAt);
    } else {
      // DEBUG: Check what tokens exist in database
      const allSessions = await prisma.session.findMany({
        select: { token: true, userId: true },
        take: 3
      });
      console.log('🔍 [Auth] Available session tokens in DB:', allSessions.map(s => s.token.substring(0, 20)));
    }

    if (!userSession || userSession.expiresAt < new Date()) {
      console.warn('⚠️ [Auth] Session not found or expired');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    // Extract user information from the verified session
    req.userId = userSession.userId;
    req.userEmail = userSession.user.email;
    req.userName = userSession.user.name;

    // Log for debugging
    console.log('✅ [Auth] Authenticated user:', {
      userId: req.userId,
      email: req.userEmail,
      name: req.userName
    });

    next();
  } catch (error) {
    console.error('❌ [Auth] Authentication error:', error);
    console.error('❌ [Auth] Error stack:', error.stack);
    
    if (process.env.NODE_ENV !== 'production') {
      console.warn('✅ [Auth] DEV BYPASS ACTIVATED - Auth error, allowing request');
      req.userId = 'dev-user';
      req.userEmail = 'dev@example.com';
      req.userName = 'Developer';
      return next();
    }
    
    res.status(401).json({ error: 'Authentication failed' });
  }
}
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Rebuild backend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build backend
```

---

## Step 4: Test and Check Logs

**1. Try to access the app (should trigger auth check)**
**2. Check backend logs:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep -i "🔍\|⚠️\|✅\|❌" | tail -30
```

**Look for:**
- `🔍 [Auth] Session token received:` - Should be EXISTS
- `🔍 [Auth] Extracted session ID:` - The ID being looked up
- `🔍 [Auth] Session lookup result:` - FOUND or NOT FOUND
- `🔍 [Auth] Available session tokens in DB:` - What tokens exist

**This will show us why the lookup is failing.**

---

## Common Issues:

1. **Token format mismatch** - Cookie token doesn't match DB token format
2. **Session ID extraction wrong** - The `split('.')[0]` might be wrong
3. **Token encoding** - Token might be URL encoded/decoded incorrectly

**Share the debug logs and we'll fix the exact issue!**

