# Fix 401 Errors After Deleting Users

## Problem: 401 Unauthorized after deleting all users

When you delete all users, all sessions are also deleted, but your browser still has the old session cookie. This causes 401 errors.

---

## Quick Fix: Clear Browser Session

**Option 1: Sign Out and Sign Back In**

1. Click "Sign Out" button (if available)
2. Or manually clear cookies:
   - Open DevTools (F12)
   - Go to Application tab → Cookies → `https://rabbitpdf.in`
   - Delete all cookies (especially `better-auth.session_token`)
3. Refresh the page
4. Sign in again

**Option 2: Clear All Site Data**

1. Open DevTools (F12)
2. Application tab → Clear storage
3. Click "Clear site data"
4. Refresh page
5. Sign in again

---

## Verify Session is Cleared

**In browser console (F12), run:**
```javascript
console.log('Cookies:', document.cookie);
```

**Should be empty or not contain `better-auth.session_token`**

---

## After Clearing Session

1. **Sign up with Account A:**
   - Create a conversation
   - Update username
   - Rename conversation

2. **Sign out → Sign up with Account B:**
   - Should NOT see Account A's data
   - Create own conversation

3. **Sign back in as Account A:**
   - Should see only Account A's data

---

## If Still Getting 401 After Sign In

**Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep -i "auth\|session\|401"
```

**Common issues:**
1. Session not being created properly
2. Cookie not being set (check SameSite/Secure flags)
3. Backend auth middleware failing

**Check if session was created:**
```bash
# On server
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, \"userId\", \"expiresAt\" FROM \"Session\" ORDER BY \"expiresAt\" DESC LIMIT 5;"
```

**Should show your new session after signing in.**

