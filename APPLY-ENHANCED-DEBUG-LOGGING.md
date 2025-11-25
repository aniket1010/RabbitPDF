# Apply Enhanced Debug Logging

## ✅ Enhanced Logging Added

**I've added more detailed debug logging to see exactly what backend receives.**

---

## 🔄 Step 1: Copy Updated File to Server

**Option A: Use Git (if file is committed)**

**On server:**
```bash
cd ~/RabbitPDF
git pull
```

**Option B: Edit Directly on Server**

**On server:**
```bash
nano backend/utils/auth.js
```

**Find the `verifyAuth` function (around line 5) and replace the beginning with:**

```javascript
// Better Auth session verification
async function verifyAuth(req, res, next) {
  try {
    // DEBUG: Log raw cookie header FIRST
    console.log('🔍 [Auth] Raw cookie header:', req.headers.cookie || 'UNDEFINED');
    console.log('🔍 [Auth] Parsed cookies object:', JSON.stringify(req.cookies || {}));
    console.log('🔍 [Auth] Request method:', req.method);
    console.log('🔍 [Auth] Request path:', req.path);
    console.log('🔍 [Auth] Request URL:', req.url);
    
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
      console.log('🔍 [Auth] Manually parsed cookies:', JSON.stringify(cookies));
      sessionToken = cookies['better-auth.session_token'] || cookies['better-auth.session-token'];
    }
    
    // DEBUG: Log what we received
    console.log('🔍 [Auth] Session token received:', sessionToken ? 'EXISTS' : 'MISSING');
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🔄 Step 2: Restart Backend

**Restart backend:**
```bash
docker-compose -f docker-compose.production.yml restart backend
```

**Wait 10 seconds, verify it's running:**
```bash
docker-compose -f docker-compose.production.yml ps backend
```

---

## 🧪 Step 3: Test and Check Logs

**In browser:**
1. Clear cookies
2. Sign in
3. Try to load conversations

**On server, check logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep "🔍 \[Auth\]"
```

**Now you should see:**
- Raw cookie header (or UNDEFINED)
- Parsed cookies object
- Request details
- Whether session token is found

**Share the full output!**

---

## 🎯 What This Will Tell Us

**If cookies are reaching backend:**
```
🔍 [Auth] Raw cookie header: better-auth.session_token=value...
🔍 [Auth] Parsed cookies object: {"better-auth.session_token":"value..."}
🔍 [Auth] Session token received: EXISTS
```

**If cookies are NOT reaching backend:**
```
🔍 [Auth] Raw cookie header: UNDEFINED
🔍 [Auth] Parsed cookies object: {}
🔍 [Auth] Session token received: MISSING
```

**This will definitively show us if Nginx is forwarding cookies or not!**

