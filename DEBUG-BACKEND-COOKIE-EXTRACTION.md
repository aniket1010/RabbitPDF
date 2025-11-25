# Debug Backend Cookie Extraction - Phase 3

## ✅ Nginx Config is Correct

**If `/api` block already has `proxy_set_header Cookie $http_cookie;`, then the issue is elsewhere.**

---

## 🔍 Step 1: Verify Nginx is Actually Forwarding

**Test if Nginx forwards cookies to backend:**

**On server:**
```bash
# Test with a real cookie from browser
curl -v -H "Cookie: better-auth.session_token=test123" https://rabbitpdf.in/api/conversation/list 2>&1 | head -50
```

**Check backend logs immediately after:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 30
```

**Look for:** Does backend see the cookie in the request?

---

## 🔍 Step 2: Check Backend Cookie Extraction Code

**On server:**
```bash
cat backend/utils/auth.js | head -80
```

**Share the output** - I need to see how backend extracts cookies from the request.

**Look for:**
- How it reads `req.headers.cookie`
- How it parses the session token
- What cookie name it's looking for

---

## 🔍 Step 3: Add Debug Logging to Backend

**Let's add logging to see what backend receives:**

**On server:**
```bash
nano backend/utils/auth.js
```

**Find the `verifyAuth` function and add logging at the start:**

**Add this right at the beginning of `verifyAuth`:**
```javascript
async function verifyAuth(req, res, next) {
  // DEBUG: Log all headers
  console.log('🔍 [Auth Debug] Request headers:', {
    cookie: req.headers.cookie,
    'x-forwarded-for': req.headers['x-forwarded-for'],
    host: req.headers.host,
    'user-agent': req.headers['user-agent']
  });
  
  // ... rest of existing code ...
```

**Save and restart backend:**
```bash
docker-compose -f docker-compose.production.yml restart backend
```

**Then test:**
```bash
# Make a request from browser (sign in, try to load conversations)
# Then check logs:
docker-compose -f docker-compose.production.yml logs backend --tail 50
```

**Share the output** - This will show what cookies backend actually receives.

---

## 🔍 Step 4: Check Cookie Name Mismatch

**Better-auth might be setting cookies with a different name than backend expects.**

**Check what cookie name better-auth uses:**

**On server:**
```bash
cat frontend/src/lib/auth.ts | grep -i "cookie\|session"
```

**Check what cookie name backend expects:**

**On server:**
```bash
cat backend/utils/auth.js | grep -i "cookie\|session.*token\|better-auth"
```

**Compare:** Do the names match?

---

## 🔍 Step 5: Test Cookie Format

**The cookie you found was:**
```
vd7VFUftSfPdHVZKiLzgTlN2kWvt5tro.ioi%2FXUqZOnNJL1fusC4c05%2FaHI1kSlz0mTaFy3pf8dM%3D
```

**This looks URL-encoded. Check if backend is decoding it correctly.**

**In browser console, check the actual cookie:**
```javascript
// Check cookie name
document.cookie.split(';').forEach(c => console.log(c.trim()))
```

**What's the full cookie name?** (e.g., `better-auth.session_token=...`)

---

## 🎯 Quick Test: Direct Backend Request

**Test if backend can read cookies when sent directly:**

**On server:**
```bash
# Test backend directly (bypassing Nginx)
docker-compose -f docker-compose.production.yml exec backend curl -v -H "Cookie: better-auth.session_token=test123" http://localhost:5000/conversation/list 2>&1 | head -30
```

**Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 20
```

**Does backend see the cookie when sent directly?**

---

## 📋 Next Steps Based on Findings

**After running these checks, we'll know:**

1. **If Nginx forwards cookies** → Check backend extraction
2. **If backend receives cookies** → Check parsing logic
3. **If cookie names don't match** → Fix name mismatch
4. **If format is wrong** → Fix encoding/decoding

**Run Step 2 first** (check backend code) and share the output!

