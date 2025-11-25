# Professional Cookie Debugging Guide - Step by Step

## 🎯 Goal
Fix authentication cookies so users can sign in and maintain sessions.

---

## 📋 Phase 1: Current State Assessment

### Step 1.1: Check Current Cookie Status

**In Browser (F12 → Console):**
```javascript
// Check if any cookies exist
document.cookie

// Check in Application tab
// F12 → Application → Cookies → https://rabbitpdf.in
// List all cookies you see
```

**Expected:** Should see `better-auth.session_token` or similar after sign-in
**Actual:** _______________ (write what you see)

---

### Step 1.2: Check Backend Logs

**SSH to server:**
```bash
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep -i "session token received"
```

**Expected:** `Session token received: EXISTS`
**Actual:** _______________ (write what you see)

---

### Step 1.3: Check Frontend Logs

**On server:**
```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 100 | grep -i "auth\|sign-in\|error"
```

**Look for:**
- Sign-in errors
- Cookie-related errors
- Auth configuration issues

**Findings:** _______________

---

## 📋 Phase 2: Verify Better-Auth Configuration

### Step 2.1: Check Auth Config File

**On server:**
```bash
cd ~/RabbitPDF
cat frontend/src/lib/auth.ts | grep -A 15 "cookieOptions"
```

**Expected:** Should see:
```typescript
cookieOptions: {
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
    path: '/',
}
```

**Actual:** _______________

---

### Step 2.2: Check Base URL

**On server:**
```bash
cat frontend/src/lib/auth.ts | grep "baseURL\|APP_URL"
```

**Expected:** `baseURL: APP_URL` where `APP_URL=https://rabbitpdf.in`
**Actual:** _______________

**Also check environment:**
```bash
docker-compose -f docker-compose.production.yml exec frontend env | grep -i "app_url\|next_public_app_url"
```

**Expected:** `NEXT_PUBLIC_APP_URL=https://rabbitpdf.in` (no `:3000`)
**Actual:** _______________

---

## 📋 Phase 3: Verify CORS Wrapper

### Step 3.1: Check Route Handler

**On server:**
```bash
cd ~/RabbitPDF
cat frontend/src/app/api/auth/\[...all\]/route.ts | head -30
```

**Look for:**
- `addCorsHeaders` function
- How it handles `Set-Cookie` headers
- Whether it preserves headers correctly

**Expected:** Should preserve `Set-Cookie` headers
**Actual:** _______________

---

### Step 3.2: Test Sign-In Response Headers

**In Browser (F12 → Network tab):**
1. Clear cookies
2. Go to `https://rabbitpdf.in/sign-in`
3. Sign in with test account
4. Click on the sign-in request in Network tab
5. Check **Response Headers**

**Look for:**
- `Set-Cookie` header
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin: https://rabbitpdf.in`

**Expected:** Should see `Set-Cookie: better-auth.session_token=...`
**Actual:** _______________

**Screenshot or copy headers:** _______________

---

## 📋 Phase 4: Verify Nginx Configuration

### Step 4.1: Check Cookie Forwarding

**On server:**
```bash
sudo cat /etc/nginx/sites-available/rabbitpdf | grep -A 5 "location /api/auth"
```

**Expected:** Should see `proxy_set_header Cookie $http_cookie;`
**Actual:** _______________

**Check all location blocks:**
```bash
sudo cat /etc/nginx/sites-available/rabbitpdf | grep -B 2 -A 10 "location"
```

**Verify cookie forwarding in:**
- `location /`
- `location /api/auth`
- `location /api`
- `location /socket.io`

---

### Step 4.2: Test Nginx Cookie Forwarding

**On server:**
```bash
# Test if Nginx forwards cookies
curl -v -H "Cookie: test=value" https://rabbitpdf.in/api/auth/session 2>&1 | grep -i "cookie"
```

**Expected:** Should see the cookie in the forwarded request
**Actual:** _______________

---

## 📋 Phase 5: Verify Code Changes Are Applied

### Step 5.1: Check Git Status

**On server:**
```bash
cd ~/RabbitPDF
git status
git log --oneline -5
```

**Check if latest commit includes:**
- `Fix: Preserve Set-Cookie headers in CORS wrapper`

**If not, pull latest:**
```bash
git pull
```

---

### Step 5.2: Verify Files Match Expected

**Check CORS wrapper:**
```bash
cd ~/RabbitPDF
grep -A 20 "addCorsHeaders" frontend/src/app/api/auth/\[...all\]/route.ts
```

**Expected:** Should see code that preserves headers
**Actual:** _______________

**Check auth config:**
```bash
grep -A 10 "cookieOptions" frontend/src/lib/auth.ts
```

**Expected:** Should see cookieOptions configuration
**Actual:** _______________

---

### Step 5.3: Rebuild If Needed

**If files don't match expected, rebuild:**
```bash
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**Wait for build (2-5 minutes), then check:**
```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 50 | grep -i "ready\|compiled\|error"
```

---

## 📋 Phase 6: Test Sign-In Flow

### Step 6.1: Clear Everything

**In Browser:**
1. F12 → Application → Clear storage → Clear site data
2. Close browser completely
3. Reopen browser

---

### Step 6.2: Sign In and Monitor

**In Browser:**
1. Open `https://rabbitpdf.in/sign-in`
2. Open F12 → Network tab
3. Sign in with test account
4. Watch for:
   - Sign-in request (POST to `/api/auth/email/sign-in`)
   - Response status (should be 200)
   - Response headers (should have `Set-Cookie`)

**Findings:** _______________

---

### Step 6.3: Check Cookies After Sign-In

**In Browser Console:**
```javascript
// Immediately after sign-in
document.cookie

// Check Application tab
// F12 → Application → Cookies → https://rabbitpdf.in
```

**Expected:** Should see `better-auth.session_token` cookie
**Actual:** _______________

**Note:** If cookie has `httpOnly: true`, it won't show in `document.cookie` but will be in Application tab.

---

### Step 6.4: Check Backend After Sign-In

**On server:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep -i "session token received"
```

**Expected:** `Session token received: EXISTS`
**Actual:** _______________

---

## 📋 Phase 7: Systematic Fix Application

### Step 7.1: Apply Fix 1 - CORS Wrapper

**If CORS wrapper doesn't preserve Set-Cookie:**

**On server:**
```bash
cd ~/RabbitPDF
nano frontend/src/app/api/auth/\[...all\]/route.ts
```

**Find `addCorsHeaders` function and ensure it preserves headers.**

**Then rebuild:**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**Test:** Repeat Phase 6

---

### Step 7.2: Apply Fix 2 - Auth Config

**If cookieOptions missing:**

**On server:**
```bash
cd ~/RabbitPDF
nano frontend/src/lib/auth.ts
```

**Add cookieOptions to advanced section.**

**Then rebuild:**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**Test:** Repeat Phase 6

---

### Step 7.3: Apply Fix 3 - Nginx Cookie Forwarding

**If Nginx not forwarding cookies:**

**On server:**
```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**Add `proxy_set_header Cookie $http_cookie;` to all location blocks.**

**Test config:**
```bash
sudo nginx -t
```

**Reload:**
```bash
sudo systemctl reload nginx
```

**Test:** Repeat Phase 6

---

## 📋 Phase 8: Verification

### Step 8.1: Complete Test

1. Clear browser completely
2. Sign in
3. Check cookies exist
4. Check backend logs show "EXISTS"
5. Try accessing protected route (e.g., `/api/conversation/list`)
6. Should work without 401 error

---

### Step 8.2: Document Success

**If working, document:**
- Which fix resolved the issue
- What the root cause was
- Any additional steps needed

---

## 🎯 Quick Reference: Common Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Cookies not set | No `Set-Cookie` in response | Check CORS wrapper preserves headers |
| Cookies not forwarded | Backend shows MISSING | Add `proxy_set_header Cookie $http_cookie;` to Nginx |
| Wrong domain | Cookies set but not sent | Check `baseURL` matches domain |
| httpOnly cookies | `document.cookie` empty | Normal - check Application tab instead |
| Secure flag missing | Cookies not set on HTTPS | Add `secure: true` to cookieOptions |

---

## 📝 Debugging Checklist

- [ ] Phase 1: Current state assessed
- [ ] Phase 2: Better-auth config verified
- [ ] Phase 3: CORS wrapper checked
- [ ] Phase 4: Nginx config verified
- [ ] Phase 5: Code changes applied
- [ ] Phase 6: Sign-in flow tested
- [ ] Phase 7: Fixes applied systematically
- [ ] Phase 8: Verification complete

---

## 🆘 If Still Not Working

**Collect debug info:**
```bash
# On server - collect all logs
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml logs frontend --tail 200 > frontend-logs.txt
docker-compose -f docker-compose.production.yml logs backend --tail 200 > backend-logs.txt
sudo nginx -T > nginx-config.txt

# Share these files for analysis
```

**In browser:**
- Screenshot of Network tab showing sign-in request/response
- Screenshot of Application → Cookies tab
- Console errors (if any)

---

## ✅ Success Criteria

**Authentication is working when:**
1. ✅ Sign-in succeeds without errors
2. ✅ Cookies appear in Application tab after sign-in
3. ✅ Backend logs show "Session token received: EXISTS"
4. ✅ API calls work without 401 errors
5. ✅ WebSocket connects without auth errors

