# Apply Cookie Fix on Server

## Files have been pushed to Git

**Commit:** `Fix: Preserve Set-Cookie headers in CORS wrapper for better-auth`

---

## Step 1: Pull Changes on Server

**SSH to server:**
```bash
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
git pull
```

---

## Step 2: Rebuild Frontend

**On server:**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**Wait 2-5 minutes for rebuild to complete.**

**Check build status:**
```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 50
```

**Look for:** `✓ Ready in ...` or `✓ Compiled successfully`

---

## Step 3: Verify Fix

**1. Clear browser cookies completely:**
   - F12 → Application → Clear storage → Clear site data
   - Or: Settings → Privacy → Clear browsing data → Cookies

**2. Close browser completely**

**3. Reopen and go to:** `https://rabbitpdf.in`

**4. Sign in**

---

## Step 4: Check Cookies Are Set

**In browser (F12 → Application tab):**
- Go to: **Application → Cookies → `https://rabbitpdf.in`**
- Look for: `better-auth.session_token` or `better-auth.session-token`

**Note:** If cookies have `httpOnly: true`, they won't show in `document.cookie` console command, but they'll still be sent automatically by the browser.

---

## Step 5: Check Backend Logs

**On server:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep "session token received"
```

**Should show:** `Session token received: EXISTS` (not MISSING)

---

## If Still Not Working

**Check frontend logs for sign-in:**
```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 100 | grep -i "auth\|sign-in\|cookie\|error"
```

**Check network tab in browser:**
- F12 → Network → Sign in → Check response headers
- Look for `Set-Cookie` header in the sign-in response
- If missing → Better-auth isn't setting cookies (check auth.ts config)
- If exists → Cookies are set but not forwarded (check Nginx config)

---

## Quick Test: Check Response Headers

**In browser console after signing in:**
```javascript
// Check if cookies exist (may be empty if httpOnly)
document.cookie

// Check in Network tab:
// F12 → Network → Click on sign-in request → Headers → Response Headers
// Look for: Set-Cookie: better-auth.session_token=...
```
