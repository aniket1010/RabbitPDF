# Debug Cookie Flow

## Step 1: Check if Cookies Exist in Browser

**In browser (F12 → Console), after signing in:**

```javascript
// Check all cookies
console.log('=== COOKIE CHECK ===');
console.log('All cookies:', document.cookie);

// Check specific cookie names
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const sessionToken1 = getCookie('better-auth.session_token');
const sessionToken2 = getCookie('better-auth.session-token');

console.log('better-auth.session_token:', sessionToken1 ? 'EXISTS' : 'MISSING');
console.log('better-auth.session-token:', sessionToken2 ? 'EXISTS' : 'MISSING');

if (sessionToken1) {
  console.log('Token preview:', sessionToken1.substring(0, 30));
} else if (sessionToken2) {
  console.log('Token preview:', sessionToken2.substring(0, 30));
} else {
  console.log('❌ NO SESSION COOKIE FOUND!');
}
```

**Share the output.**

---

## Step 2: Check if Nginx is Forwarding Cookies

**On server, test if nginx receives cookies:**

```bash
# Test with a fake cookie
curl -v -H "Cookie: test=value123" https://rabbitpdf.in/api/user/profile 2>&1 | grep -i "cookie\|set-cookie"
```

**Then check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 20 | grep -i "cookie\|test"
```

**If backend doesn't see the test cookie → Nginx isn't forwarding cookies.**

---

## Step 3: Verify Nginx Config Was Applied

**On server:**
```bash
sudo grep -A 10 "location /api" /etc/nginx/sites-available/rabbitpdf | grep -i cookie
```

**Should show:** `proxy_set_header Cookie $http_cookie;`

**If not found → Config wasn't saved/reloaded properly.**

---

## Step 4: Check Better-Auth Cookie Settings

**Better-auth might not be setting cookies for HTTPS.**

**On server:**
```bash
grep -A 10 "cookieOptions\|cookiePrefix" frontend/src/lib/auth.ts
```

**If no cookieOptions → Better-auth needs explicit cookie settings for HTTPS.**

---

## Most Likely Issue: Better-Auth Not Setting Cookies

**If browser shows NO cookies → Better-auth isn't setting them.**

**Fix: Add cookie settings to better-auth config:**

**On server:**
```bash
nano frontend/src/lib/auth.ts
```

**Find the `betterAuth` config and add:**

```typescript
export const auth = betterAuth({
    // ... existing config ...
    baseURL: APP_URL,
    advanced: {
        cookiePrefix: "better-auth",
        crossSubDomainCookies: {
            enabled: false,
        },
        generateId: () => randomUUID(),
        cookieOptions: {
            sameSite: 'lax',
            secure: true,
            httpOnly: true,
            path: '/',
        },
    },
});
```

**Rebuild frontend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## Quick Test: Check Network Tab

**In browser DevTools:**

1. **Network tab**
2. **Sign in**
3. **Look for `/api/auth/sign-in` request**
4. **Check Response Headers → `Set-Cookie:`**

**If `Set-Cookie` is missing → Better-auth isn't setting cookies.**

**If `Set-Cookie` exists → Cookies are set but not being sent. Check nginx.**

---

## Share Results

**Run Step 1 (browser cookie check) and share output.**

**This will tell us if:**
- Cookies are being set → Problem is nginx forwarding
- Cookies are NOT being set → Problem is better-auth config

