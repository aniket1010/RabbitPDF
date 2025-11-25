# Fix Missing Cookies Issue

## Problem: Cookies Not Reaching Backend

**Logs show:** `Session token received: MISSING`

This means cookies aren't being sent from browser to backend. Possible causes:
1. Nginx not forwarding cookies
2. Better-auth not setting cookies properly for HTTPS
3. Browser blocking cookies

---

## Fix 1: Ensure Nginx Forwards Cookies

**On server:**
```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**Check ALL location blocks have cookie forwarding:**

### For `/api` location:
```nginx
location /api {
    # ... other headers ...
    proxy_set_header Cookie $http_cookie;  # MUST HAVE THIS
    # ... rest of config ...
}
```

### For `/socket.io` location:
```nginx
location /socket.io {
    # ... other headers ...
    proxy_set_header Cookie $http_cookie;  # MUST HAVE THIS
    # ... rest of config ...
}
```

### For `/` location (frontend):
```nginx
location / {
    # ... other headers ...
    proxy_set_header Cookie $http_cookie;  # MUST HAVE THIS
    # ... rest of config ...
}
```

**Save and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Fix 2: Check Better-Auth Cookie Settings for HTTPS

**Better-auth needs explicit cookie settings for HTTPS.**

**On server:**
```bash
nano frontend/src/lib/auth.ts
```

**Find the `betterAuth` config (around line 43) and add cookie settings:**

**Current:**
```typescript
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    // ... other config ...
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

**Add cookie settings:**
```typescript
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    // ... other config ...
    baseURL: APP_URL,
    advanced: {
        cookiePrefix: "better-auth",
        crossSubDomainCookies: {
            enabled: false,
        },
        generateId: () => randomUUID(),
        cookieOptions: {
            sameSite: 'lax',  // For HTTPS
            secure: true,     // Required for HTTPS
            httpOnly: true,
            path: '/',
        },
    },
});
```

**Save and rebuild frontend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## Fix 3: Verify Cookies Are Set After Sign-In

**In browser (F12 → Application tab):**

1. **Sign in**
2. **Go to Application → Cookies → `https://rabbitpdf.in`**
3. **Look for:** `better-auth.session_token` or `better-auth.session-token`

**If missing → Better-auth isn't setting cookies. Check Fix 2.**

**If exists → Cookies are set but not forwarded. Check Fix 1.**

---

## Fix 4: Test Cookie Forwarding

**On server, test if nginx forwards cookies:**

```bash
# Test with a cookie
curl -v -H "Cookie: test=value" https://rabbitpdf.in/api/user/profile 2>&1 | grep -i "cookie\|set-cookie"
```

**Should see the cookie in the request.**

---

## Quick Fix: Add Cookie Forwarding to All Locations

**On server:**
```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**Add this line to EVERY location block that proxies to backend or frontend:**

```nginx
proxy_set_header Cookie $http_cookie;
```

**Specifically add to:**
- `location /` (frontend)
- `location /api/auth` (frontend)
- `location /api/upload` (backend)
- `location /api` (backend)
- `location /socket.io` (backend)

**Save and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Verify Fix Worked

**1. Clear browser cookies completely**
**2. Sign in again**
**3. Check backend logs:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep -i "session token received"
```

**Should show:** `Session token received: EXISTS`

**4. Check browser cookies:**

**In browser console:**
```javascript
console.log('Cookies:', document.cookie);
```

**Should show:** `better-auth.session_token=...`

---

## Most Likely Fix

**The issue is nginx not forwarding cookies. Add `proxy_set_header Cookie $http_cookie;` to all location blocks.**

**Do this:**
1. ✅ Add cookie forwarding to nginx (Fix 1)
2. ✅ Reload nginx
3. ✅ Clear browser cookies
4. ✅ Sign in again
5. ✅ Check logs - should show `EXISTS` instead of `MISSING`

