# Cookies Not Reaching Backend - Diagnosis

## 🎯 Problem Confirmed

**Backend logs show:** `Session token received: MISSING`

**This means:** Cookies are NOT reaching the backend, even though:
- ✅ Cookies exist in browser
- ✅ Nginx config has cookie forwarding
- ✅ Backend has cookie-parser

---

## 🔍 Step 1: Verify Debug Logging Was Added

**The logs should show more details. Let's check if debug logging was added:**

**On server:**
```bash
cat backend/utils/auth.js | grep -A 5 "Raw cookie header"
```

**If you see the line, good. If not, we need to add it.**

**Also check:**
```bash
cat backend/utils/auth.js | head -30
```

**Share the output** - I need to see if debug logging is there.

---

## 🔍 Step 2: Check What Browser Actually Sends

**In browser (F12 → Network tab):**

1. **Clear cookies**
2. **Sign in**
3. **Click on any API request** (e.g., `/api/conversation/list`)
4. **Check Request Headers**

**Look for:** `Cookie:` header

**What do you see?**
- ✅ Cookie header exists → Browser is sending cookies
- ❌ Cookie header missing → Browser isn't sending cookies

---

## 🔍 Step 3: Test Nginx Cookie Forwarding Directly

**On server, test if Nginx forwards cookies:**

**First, get your cookie value from browser:**
- F12 → Application → Cookies → Copy the cookie value

**Then test:**
```bash
# Replace YOUR_COOKIE_VALUE with actual cookie from browser
curl -v -H "Cookie: better-auth.session_token=YOUR_COOKIE_VALUE" https://rabbitpdf.in/api/conversation/list 2>&1 | head -50
```

**Check backend logs immediately:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 20
```

**Does backend see the cookie?**

---

## 🔍 Step 4: Check Nginx Access Logs

**Check if Nginx receives cookies:**

**On server:**
```bash
sudo tail -20 /var/log/nginx/access.log | grep -i cookie
```

**Or check recent requests:**
```bash
sudo tail -50 /var/log/nginx/access.log
```

**Look for:** Cookie headers in the log entries.

---

## 🎯 Most Likely Issues

### Issue 1: Cookies Not Sent by Browser
**If browser isn't sending cookies:**
- Cookie might have wrong domain/path
- Cookie might be httpOnly and not accessible
- Cookie might be blocked by browser

**Fix:** Check cookie settings in better-auth config.

### Issue 2: Nginx Not Forwarding Despite Config
**If Nginx config looks correct but cookies don't forward:**
- Nginx might not be reloaded
- Config might be in wrong file
- There might be another config overriding it

**Fix:** Verify Nginx is using the correct config file.

### Issue 3: Cookie Name Mismatch
**If cookie name doesn't match:**
- Better-auth might set different name
- Backend expects different name

**Fix:** Check actual cookie name vs expected name.

---

## 📋 Quick Diagnostic Commands

**Run these and share outputs:**

1. **Check if debug logging exists:**
```bash
cat backend/utils/auth.js | grep -A 3 "Raw cookie header"
```

2. **Check Nginx config is active:**
```bash
sudo nginx -T | grep -A 10 "location /api"
```

3. **Test cookie forwarding:**
```bash
curl -v -H "Cookie: test=value" https://rabbitpdf.in/api/conversation/list 2>&1 | grep -i "cookie\|401"
```

4. **Check Nginx error logs:**
```bash
sudo tail -20 /var/log/nginx/error.log
```

---

## 🚀 Next Steps

**Start with Step 1** - verify debug logging was added correctly, then we'll add more detailed logging to see exactly what's happening.

