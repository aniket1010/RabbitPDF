# Verify Cookie Forwarding - Step by Step

## ✅ What We Know

1. ✅ Cookies exist in browser
2. ✅ Nginx config has `proxy_set_header Cookie $http_cookie;`
3. ✅ Backend code looks for `better-auth.session_token` or `better-auth.session-token`

---

## 🔍 Step 1: Check Actual Cookie Name in Browser

**In browser console (F12):**
```javascript
// Check what cookies exist
document.cookie.split(';').forEach(c => console.log(c.trim()))
```

**Or check Application tab:**
- F12 → Application → Cookies → `https://rabbitpdf.in`
- **What's the exact cookie name?** (e.g., `better-auth.session_token` or something else?)

**Share:** What cookie name do you see?

---

## 🔍 Step 2: Add Debug Logging to See What Backend Receives

**On server:**
```bash
nano backend/utils/auth.js
```

**Find line 22 (the debug log) and ADD this BEFORE it:**

```javascript
    // DEBUG: Log raw cookie header
    console.log('🔍 [Auth] Raw cookie header:', req.headers.cookie);
    console.log('🔍 [Auth] All cookies object:', req.cookies);
    
    // DEBUG: Log what we received
    console.log('🔍 [Auth] Session token received:', sessionToken ? 'EXISTS' : 'MISSING');
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Restart backend:**
```bash
docker-compose -f docker-compose.production.yml restart backend
```

---

## 🔍 Step 3: Test and Check Logs

**In browser:**
1. Clear cookies
2. Sign in
3. Try to load conversations (or any API call)

**On server, check logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50
```

**Look for:**
- `🔍 [Auth] Raw cookie header:` - What does it show?
- `🔍 [Auth] Session token received:` - EXISTS or MISSING?

**Share the output!**

---

## 🔍 Step 4: Test Direct Cookie Forwarding

**Test if Nginx actually forwards cookies:**

**On server:**
```bash
# Get your actual cookie value from browser first
# Then test:
curl -v -H "Cookie: better-auth.session_token=YOUR_COOKIE_VALUE_HERE" https://rabbitpdf.in/api/conversation/list 2>&1 | head -50
```

**Check backend logs immediately:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 20
```

**Does backend see the cookie?**

---

## 🔍 Step 5: Check if Cookie-Parser is Installed

**Backend might need cookie-parser middleware:**

**On server:**
```bash
cat backend/index.js | grep -i "cookie"
```

**Look for:** `cookieParser` or `cookie-parser`

**If missing, we need to add it!**

---

## 🎯 Most Likely Issues

### Issue 1: Cookie Name Mismatch
**Backend expects:** `better-auth.session_token`
**Better-auth might set:** `better-auth.session-token` (with dash instead of underscore)

**Fix:** Backend already checks both, so this should be OK.

### Issue 2: Cookie-Parser Not Installed
**If backend doesn't use cookie-parser middleware, `req.cookies` will be undefined.**

**Fix:** Need to add cookie-parser middleware.

### Issue 3: Nginx Not Reloaded
**Config changed but Nginx not reloaded.**

**Fix:** `sudo systemctl reload nginx`

---

## 📋 Quick Checklist

Run these in order:

1. **Check cookie name in browser** → Share what you see
2. **Add debug logging** → Restart backend
3. **Test sign-in** → Check backend logs
4. **Share logs** → We'll see what backend receives

**Start with Step 1** - check the cookie name in browser!

