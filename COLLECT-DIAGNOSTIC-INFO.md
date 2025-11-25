# Collect Diagnostic Info - Final Check

## 🎯 401 Error Confirmed

**The request to `/api/user/profile` is getting 401, which means cookies aren't reaching backend.**

---

## 📋 Step 1: Check Backend Logs

**On server, run:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep "🔍 \[Auth\]"
```

**Share the COMPLETE output** - especially look for:
- `🔍 [Auth] Raw cookie header:` - What does it show?
- `🔍 [Auth] Parsed cookies object:` - What does it show?
- `🔍 [Auth] Request headers keys:` - What headers are present?

---

## 📋 Step 2: Check Browser Network Tab

**In browser (F12 → Network tab):**

1. **Find the request to `/api/user/profile`** (the one that failed with 401)
2. **Click on it**
3. **Go to "Headers" tab**
4. **Look at "Request Headers" section**

**Check for:**
- `Cookie:` header - Does it exist? What does it say?

**Share:**
- Screenshot OR copy the Request Headers section
- Specifically: Is there a `Cookie:` header? What's its value?

---

## 📋 Step 3: Check Cookies in Browser

**In browser console (F12 → Console):**

```javascript
// Check all cookies
document.cookie.split(';').forEach(c => console.log(c.trim()))
```

**Or check Application tab:**
- F12 → Application → Cookies → `https://rabbitpdf.in`
- **What cookies do you see?**
- **What are their names?**
- **What are their values?** (first 20 characters)

**Share:** What cookies exist?

---

## 📋 Step 4: Check Sign-In Response

**In browser (F12 → Network tab):**

1. **Clear cookies**
2. **Sign in again**
3. **Find the sign-in request** (POST to `/api/auth/email/sign-in` or similar)
4. **Click on it**
5. **Check "Response Headers"**

**Look for:** `Set-Cookie:` header

**Share:**
- Is there a `Set-Cookie:` header in the sign-in response?
- What does it say?

---

## 🎯 What We're Looking For

**This will tell us:**

1. **Backend logs** → Are cookies reaching backend? (Raw cookie header)
2. **Browser Request Headers** → Is browser sending cookies?
3. **Browser Cookies** → Are cookies set correctly?
4. **Sign-in Response** → Is better-auth setting cookies?

---

## 🚀 Run These Checks Now

**Please share:**

1. ✅ Backend logs output (from Step 1)
2. ✅ Browser Network tab Request Headers (from Step 2)
3. ✅ Browser cookies list (from Step 3)
4. ✅ Sign-in response headers (from Step 4)

**This will pinpoint exactly where cookies are getting lost!**

