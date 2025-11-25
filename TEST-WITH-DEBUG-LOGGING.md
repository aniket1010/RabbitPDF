# Test With Debug Logging - Final Check

## ✅ Debug Logging Confirmed

**The enhanced debug logging is already in place on the server!**

---

## 🔄 Step 1: Restart Backend (If Not Already Done)

**On server:**
```bash
docker-compose -f docker-compose.production.yml restart backend
```

**Wait 10 seconds, verify it's running:**
```bash
docker-compose -f docker-compose.production.yml ps backend
```

---

## 🧪 Step 2: Test in Browser

**In your browser:**

1. **Clear ALL cookies:**
   - F12 → Application → Cookies → `https://rabbitpdf.in` → Delete all cookies
   - Or: F12 → Application → Clear storage → Clear site data

2. **Sign in:**
   - Go to `https://rabbitpdf.in/sign-in`
   - Sign in with your account

3. **Make an API call:**
   - Try to load conversations (or any protected route)
   - Or open browser console and run:
   ```javascript
   fetch('/api/conversation/list').then(r => r.json()).then(console.log).catch(console.error)
   ```

---

## 📋 Step 3: Check Backend Logs

**On server, immediately run:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep "🔍 \[Auth\]"
```

**Or see all recent logs:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50
```

---

## 🎯 What to Look For

**The logs should now show:**

```
🔍 [Auth] Raw cookie header: ...
🔍 [Auth] Parsed cookies object: ...
🔍 [Auth] Request headers keys: ...
🔍 [Auth] Session token received: EXISTS or MISSING
```

**Share the FULL output** - especially:
- What does "Raw cookie header" show? (UNDEFINED or actual cookies?)
- What does "Parsed cookies object" show? (empty {} or cookies?)
- What headers are present?

---

## 🔍 Step 4: Also Check Browser Network Tab

**In browser (F12 → Network tab):**

1. **Click on the API request** (e.g., `/api/conversation/list`)
2. **Check Request Headers**

**Look for:** `Cookie:` header

**What do you see?**
- ✅ `Cookie: better-auth.session_token=...` → Browser is sending cookies
- ❌ No `Cookie:` header → Browser isn't sending cookies

**Share:** What do you see in Request Headers?

---

## 📊 Expected Scenarios

### Scenario A: Cookies Not Sent by Browser
**Browser Network tab:** No `Cookie:` header
**Backend logs:** `Raw cookie header: UNDEFINED`
**Fix:** Check cookie domain/path settings in better-auth

### Scenario B: Cookies Sent But Not Forwarded by Nginx
**Browser Network tab:** `Cookie:` header exists
**Backend logs:** `Raw cookie header: UNDEFINED`
**Fix:** Nginx not forwarding despite config - need to check Nginx logs

### Scenario C: Cookies Forwarded But Wrong Name
**Browser Network tab:** `Cookie: some-name=value`
**Backend logs:** `Raw cookie header: some-name=value`
**Fix:** Cookie name mismatch - need to check what better-auth sets

---

## 🚀 Run the Test Now

**After signing in and making an API call, run:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep "🔍"
```

**Share the complete output!**

