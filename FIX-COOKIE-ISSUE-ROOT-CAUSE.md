# Fix Cookie Issue - Root Cause Found

## Problem: CORS wrapper was destroying Set-Cookie headers

The `addCorsHeaders` function was modifying the Response object in a way that could strip `Set-Cookie` headers from better-auth.

---

## Fix Applied

**File:** `frontend/src/app/api/auth/[...all]/route.ts`

**Changed:** Modified `addCorsHeaders` to properly preserve all headers (including Set-Cookie) when adding CORS headers.

---

## Step 1: Copy Fixed File to Server

**On Windows (PowerShell):**
```powershell
cd D:\all_my_code\projects\chatPDF
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem frontend\src\app\api\auth\[...all]\route.ts ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/app/api/auth/\[...all\]/route.ts
```

**Note:** The brackets need escaping. If that doesn't work, use:

```powershell
# SSH and edit directly
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
nano frontend/src/app/api/auth/\[...all\]/route.ts
```

**Or copy via Git:**
```powershell
git add frontend/src/app/api/auth/\[...all\]/route.ts
git commit -m "Fix: Preserve Set-Cookie headers in CORS wrapper"
git push
# Then on server: git pull && rebuild
```

---

## Step 2: Rebuild Frontend

**On server:**
```bash
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**Wait 2-5 minutes for rebuild.**

---

## Step 3: Clear Browser and Test

1. **Clear ALL cookies** (F12 → Application → Clear storage)
2. **Close browser completely**
3. **Reopen and go to `https://rabbitpdf.in`**
4. **Sign in**

---

## Step 4: Verify Cookies Are Set

**In browser console (F12):**
```javascript
document.cookie
```

**Note:** If cookies have `httpOnly: true`, they won't show in `document.cookie`, but they'll still be sent automatically.

**Check in Application tab:**
- F12 → Application → Cookies → `https://rabbitpdf.in`
- Look for: `better-auth.session_token` or similar

---

## Step 5: Check Backend Logs

**On server:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep "session token received"
```

**Should show:** `Session token received: EXISTS` (not MISSING)

---

## If Still Not Working

**Check frontend logs for sign-in errors:**
```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 100 | grep -i "auth\|sign-in\|cookie\|error"
```

**Check network tab in browser:**
- F12 → Network → Sign in → Check response headers for `Set-Cookie`
- If `Set-Cookie` is missing → Better-auth isn't setting cookies
- If `Set-Cookie` exists → Cookies are set but not being forwarded

---

## Alternative: Direct File Edit on Server

**If copying doesn't work, edit directly:**

**SSH to server:**
```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
nano frontend/src/app/api/auth/\[...all\]/route.ts
```

**Find the `addCorsHeaders` function (around line 8-16) and replace with:**

```typescript
// Add CORS headers to all responses (echo request origin if present)
// CRITICAL: Preserve Set-Cookie headers from better-auth
const addCorsHeaders = async (response: Response, request?: Request) => {
  const origin = request?.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  
  // Clone response to preserve body and status
  const responseBody = await response.clone().text()
  const newHeaders = new Headers(response.headers)
  
  // Add CORS headers (this won't remove Set-Cookie)
  newHeaders.set('Access-Control-Allow-Origin', origin)
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  newHeaders.set('Access-Control-Allow-Credentials', 'true')
  
  return new Response(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}
```

**Then update all calls to use `await`:**
- Line 32: `return await addCorsHeaders(response, request)`
- Line 55: `return await addCorsHeaders(res, request)`
- Line 62: `return await addCorsHeaders(response, request)`
- Line 68: `return await addCorsHeaders(res, request)`
- Line 73: `return await addCorsHeaders(response, request)`

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Rebuild:**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

