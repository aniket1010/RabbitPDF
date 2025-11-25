# Apply Cookie Fix - Better-Auth Not Setting Cookies

## Problem: `document.cookie` returns empty - Better-auth isn't setting cookies for HTTPS

---

## Step 1: Update Better-Auth Config

**On server:**
```bash
nano frontend/src/lib/auth.ts
```

**Find (around line 88-95):**
```typescript
    baseURL: APP_URL,
    advanced: {
        cookiePrefix: "better-auth",
        crossSubDomainCookies: {
            enabled: false,
        },
        generateId: () => randomUUID(),
    },
});
```

**Change to:**
```typescript
    baseURL: APP_URL,
    advanced: {
        cookiePrefix: "better-auth",
        crossSubDomainCookies: {
            enabled: false,
        },
        cookieOptions: {
            sameSite: 'lax',
            secure: true,
            httpOnly: true,
            path: '/',
        },
        generateId: () => randomUUID(),
    },
});
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 2: Rebuild Frontend

**On server:**
```bash
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**Wait for rebuild (2-5 minutes).**

---

## Step 3: Clear Browser and Sign In Again

**In browser:**
1. **Clear all cookies** (F12 → Application → Clear storage)
2. **Close browser completely**
3. **Reopen and go to `https://rabbitpdf.in`**
4. **Sign in**

---

## Step 4: Verify Cookies Are Set

**In browser console (F12):**
```javascript
document.cookie
```

**Should show:** `better-auth.session_token=...` or `better-auth.session-token=...`

**If still empty → Check backend logs for sign-in errors.**

---

## Step 5: Check Backend Logs

**On server:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep -i "session token received"
```

**Should show:** `Session token received: EXISTS` (not MISSING)

---

## If Still Not Working

**Check better-auth sign-in logs:**

**On server:**
```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 100 | grep -i "auth\|sign-in\|cookie"
```

**Look for errors during sign-in.**

---

## Quick Copy-Paste Fix

**If you can't edit the file, copy the entire updated file:**

**On your Windows machine:**
```powershell
cd D:\all_my_code\projects\chatPDF
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem frontend\src\lib\auth.ts ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/lib/
```

**Then rebuild frontend on server.**

