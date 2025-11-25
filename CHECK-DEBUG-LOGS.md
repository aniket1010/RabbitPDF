# Check Debug Logs - Next Steps

## ✅ Backend Restarted

**Now let's test and see what backend receives!**

---

## 🧪 Step 1: Test in Browser

**In your browser:**

1. **Clear all cookies:**
   - F12 → Application → Clear storage → Clear site data
   - Or: Settings → Privacy → Clear browsing data → Cookies

2. **Sign in:**
   - Go to `https://rabbitpdf.in/sign-in`
   - Sign in with your account

3. **Make an API call:**
   - Try to load conversations (or any protected route)
   - Or open browser console and run:
   ```javascript
   fetch('/api/conversation/list').then(r => r.json()).then(console.log)
   ```

---

## 📋 Step 2: Check Backend Logs

**On server, run:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep "🔍 \[Auth\]"
```

**Or see all recent logs:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50
```

---

## 🎯 What to Look For

**Look for these debug messages:**

```
🔍 [Auth] Raw cookie header: ...
🔍 [Auth] Parsed cookies object: ...
🔍 [Auth] Request headers keys: ...
🔍 [Auth] Session token received: EXISTS or MISSING
```

**Share the output!** This will tell us:
- ✅ If cookies are reaching backend
- ✅ What cookie name is being used
- ✅ Why session token isn't found (if it's MISSING)

---

## 📊 Expected Scenarios

### Scenario A: Cookies Not Reaching Backend
```
🔍 [Auth] Raw cookie header: undefined
🔍 [Auth] Parsed cookies object: {}
🔍 [Auth] Session token received: MISSING
```
**Fix:** Nginx not forwarding cookies (even though config looks correct)

### Scenario B: Wrong Cookie Name
```
🔍 [Auth] Raw cookie header: some-other-name=value
🔍 [Auth] Parsed cookies object: { 'some-other-name': 'value' }
🔍 [Auth] Session token received: MISSING
```
**Fix:** Cookie name mismatch - need to check what better-auth actually sets

### Scenario C: Cookies Reaching But Token Not Found
```
🔍 [Auth] Raw cookie header: better-auth.session_token=value
🔍 [Auth] Parsed cookies object: { 'better-auth.session_token': 'value' }
🔍 [Auth] Session token received: EXISTS
🔍 [Auth] Session lookup result: NOT FOUND
```
**Fix:** Session not in database or token format mismatch

---

## 🚀 Run the Test Now

**After signing in in browser, run:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep "🔍"
```

**Share the output!**

