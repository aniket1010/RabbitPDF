# Clear Cookies and Sign In Fresh - Final Step

## ✅ File is Updated Correctly

**The file shows `__Secure-better-auth.session_token` comes first - good!**

**But backend is still reading old cookie because browser still has it.**

---

## 🚀 Step 1: Clear ALL Cookies

**In browser:**

1. **F12** → **Application** tab
2. **Cookies** → `https://rabbitpdf.in`
3. **Delete ALL cookies** (or right-click → Clear)
4. **Also clear:** F12 → Application → Clear storage → Clear site data
5. **Close browser completely**
6. **Reopen browser**

---

## 🚀 Step 2: Sign In Fresh

**After clearing cookies:**

1. Go to `https://rabbitpdf.in/sign-in`
2. Sign in with your account
3. This creates a NEW session that matches the database

---

## 🚀 Step 3: Check Backend Logs

**After signing in, check:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 30 | grep "Extracted session ID\|Session lookup result"
```

**Should show:**
- `Extracted session ID: [new session ID]` ✅ (should match database)
- `Session lookup result: FOUND` ✅

---

## 🚀 Step 4: Test

**After signing in:**

1. Try to update username
2. Try to load conversations
3. Should work now! ✅

---

## 🎯 Why This Works

**Old cookies have expired sessions.**
**New sign-in creates fresh session that exists in database.**
**Backend will find it and authentication will work!**

---

## 📋 Quick Steps

1. ✅ Clear ALL cookies
2. ✅ Sign in fresh
3. ✅ Test - should work!

**Do this now!**

