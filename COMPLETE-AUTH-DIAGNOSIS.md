# Complete Authentication Diagnosis & Fix Plan

## 🔍 Understanding the Problem

### What the Logs Show

```
Extracted session ID: FVlbndWbMEGrQK97NnX37j3MdGXPb9Eo
Session lookup result: NOT FOUND
Available session tokens in DB (first 20 chars): [
  'ijyoqnFPiF1qGZZlyVH0',
  'VCvfVusK57nEzxPStN1D',
  'YblLUffKkztwFoP4blyI'
]
```

**Key Insight:** The session ID in the browser cookie (`FVlbndWbMEGrQK97NnX37j3MdGXPb9Eo`) does NOT match ANY session in the database (`ijyoqnFPiF1qGZZlyVH0`, etc.).

---

## 🎯 Root Cause

This is a **stale cookie problem**, NOT a cookie parsing problem.

### What Happened:

1. ✅ You deleted all users/sessions from the database
2. ✅ You signed in again  
3. ✅ Better-auth created a NEW session in the database (tokens like `ijyoqnFPiF1qGZZlyVH0`)
4. ❌ **BUT the browser is STILL sending the OLD cookie** (`FVlbndWbMEGrQK97NnX37j3MdGXPb9Eo`)

### Why the Browser Has the Wrong Cookie:

When you set up HTTPS, better-auth started using `__Secure-` prefixed cookies:
- **OLD cookie (HTTP era):** `better-auth.session_token` = `FVlbndWbMEGrQK97NnX37j3MdGXPb9Eo`
- **NEW cookie (HTTPS era):** `__Secure-better-auth.session_token` = (new token)

**The browser has BOTH cookies, but:**
1. The old `better-auth.session_token` wasn't deleted
2. The new `__Secure-better-auth.session_token` either:
   - Wasn't created (Set-Cookie header dropped)
   - Or exists but backend is reading the old one first

---

## 🛠️ Fix Plan

### Phase 1: Immediate Fix - Clear Stale Cookies

**On the browser (do this NOW):**

1. Open `https://rabbitpdf.in` 
2. Press `F12` → Go to **Application** tab → **Cookies** → `https://rabbitpdf.in`
3. **Delete ALL cookies** - right-click each and delete, or "Clear All"
4. **Close ALL browser tabs** for rabbitpdf.in
5. **Open a fresh tab** and go to `https://rabbitpdf.in`
6. **Sign in again**

This will ensure:
- All old cookies are gone
- New session is created
- New cookie is set with the correct token

---

### Phase 2: Verify the Fix

**After signing in fresh, check:**

1. **In browser (F12 → Application → Cookies):**
   - Should see: `__Secure-better-auth.session_token` ✅
   - Should NOT see: `better-auth.session_token` (the non-secure one)

2. **Test by loading conversations or updating username**

3. **Check backend logs:**
   ```bash
   docker-compose -f docker-compose.production.yml logs backend --tail 20 | grep "Session lookup result"
   ```
   - Should show: `Session lookup result: FOUND` ✅

---

### Phase 3: Prevent This From Happening Again

The root issue is that the `Set-Cookie` header might be getting dropped by the CORS wrapper in the auth route. Let me fix that.

---

## 🔧 Code Fix for Set-Cookie Headers

The issue might be in `frontend/src/app/api/auth/[...all]/route.ts`. The `new Headers()` constructor doesn't properly copy `Set-Cookie` headers because they can have multiple values.

**Fix:** Copy `Set-Cookie` headers explicitly.

---

## 📋 Step-by-Step Instructions

### Step 1: Clear Browser Cookies (DO THIS FIRST)

1. Go to `https://rabbitpdf.in`
2. Press `F12` → **Application** tab
3. Click **Cookies** → `https://rabbitpdf.in`
4. **Right-click** → **Clear all** (or delete each cookie)
5. Close the browser tab
6. Open a NEW tab and go to `https://rabbitpdf.in`
7. Sign in with your credentials

### Step 2: Verify It Works

After signing in:
1. Try to load conversations
2. Try to update username
3. Check if WebSocket connects

If it works → **You're done!**

If it still fails → Continue to Step 3.

### Step 3: Check What Cookies Exist

In browser console (F12 → Console):
```javascript
document.cookie
```

Or in Application tab → Cookies, look for:
- `__Secure-better-auth.session_token` (should exist)
- `better-auth.session_token` (should NOT exist)

### Step 4: Apply Code Fix (if needed)

If clearing cookies didn't help, we need to fix the Set-Cookie header handling.

---

## 🚨 Important Notes

1. **Always clear ALL cookies** when testing auth issues
2. **Close ALL tabs** for the domain before testing
3. **Use incognito/private mode** to test with a clean slate
4. The `__Secure-` prefix only works on HTTPS - if you ever access via HTTP, it won't work

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Session not found | Browser has stale cookie | Clear cookies, sign in fresh |
| Cookie mismatch | Old HTTP cookie vs new HTTPS cookie | Delete old `better-auth.session_token` |
| Set-Cookie dropped | CORS wrapper issue | Fix auth route to preserve headers |

