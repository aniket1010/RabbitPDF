# Add Debug Logging - See What Backend Receives

## ✅ Backend Has Cookie-Parser

**Good news:** Backend already has `cookie-parser` installed and configured.

---

## 🔍 Add Debug Logging

**On server:**
```bash
nano backend/utils/auth.js
```

**Find line 22 (around where it says `console.log('🔍 [Auth] Session token received:...')`)**

**ADD these lines RIGHT BEFORE line 22:**

```javascript
    // DEBUG: Log raw cookie header
    console.log('🔍 [Auth] Raw cookie header:', req.headers.cookie);
    console.log('🔍 [Auth] Parsed cookies object:', req.cookies);
    console.log('🔍 [Auth] Request headers keys:', Object.keys(req.headers));
    
    // DEBUG: Log what we received
```

**So it should look like:**

```javascript
    }
    
    // DEBUG: Log raw cookie header
    console.log('🔍 [Auth] Raw cookie header:', req.headers.cookie);
    console.log('🔍 [Auth] Parsed cookies object:', req.cookies);
    console.log('🔍 [Auth] Request headers keys:', Object.keys(req.headers));
    
    // DEBUG: Log what we received
    console.log('🔍 [Auth] Session token received:', sessionToken ? 'EXISTS' : 'MISSING');
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🔄 Restart Backend

**Restart backend to apply changes:**
```bash
docker-compose -f docker-compose.production.yml restart backend
```

**Wait 10 seconds, then check it's running:**
```bash
docker-compose -f docker-compose.production.yml ps backend
```

**Should show:** `Up` status

---

## 🧪 Test

**In browser:**
1. **Clear cookies** (F12 → Application → Clear storage)
2. **Sign in** at `https://rabbitpdf.in/sign-in`
3. **Try to load conversations** (or make any API call)

**On server, immediately check logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep -A 5 "🔍 \[Auth\]"
```

**Share the output!** This will show:
- What cookie header backend receives (if any)
- What parsed cookies look like
- Whether session token is found

---

## 🎯 What We're Looking For

**Good scenario:**
```
🔍 [Auth] Raw cookie header: better-auth.session_token=vd7VFUftSfPdHVZKiLzgTlN2kWvt5tro...
🔍 [Auth] Parsed cookies object: { 'better-auth.session_token': 'vd7VFUftSfPdHVZKiLzgTlN2kWvt5tro...' }
🔍 [Auth] Session token received: EXISTS
```

**Bad scenario (cookies not forwarded):**
```
🔍 [Auth] Raw cookie header: undefined
🔍 [Auth] Parsed cookies object: {}
🔍 [Auth] Session token received: MISSING
```

**This will tell us exactly what's wrong!**

