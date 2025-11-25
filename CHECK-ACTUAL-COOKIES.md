# Check Actual Cookies - Debug Undefined

## 🎯 Cookie is Undefined

**This means:** Either cookies aren't set, or they have a different name.

---

## 🔍 Step 1: Check All Cookies

**In browser console (F12):**

```javascript
// Check ALL cookies
document.cookie.split(';').forEach(c => console.log(c.trim()))
```

**Or check Application tab:**
- F12 → Application → Cookies → `https://rabbitpdf.in`
- **What cookies do you see?** List all cookie names.

**Share:** What cookies exist?

---

## 🔍 Step 2: Check Sign-In Response

**In browser (F12 → Network tab):**

1. **Clear cookies**
2. **Sign in**
3. **Find the sign-in request** (POST to `/api/auth/email/sign-in` or similar)
4. **Click on it**
5. **Check Response Headers**

**Look for:** `Set-Cookie:` header

**Share:**
- Is there a `Set-Cookie:` header?
- What does it say? (cookie name and value)

---

## 🔍 Step 3: Check if Cookies are httpOnly

**If cookies have `httpOnly: true`, they won't show in `document.cookie`.**

**Check in Application tab:**
- F12 → Application → Cookies → `https://rabbitpdf.in`
- **Click on any cookie**
- **Check if "HttpOnly" is checked**

**If HttpOnly is checked:** Cookies exist but can't be read via JavaScript (this is normal and secure!)

---

## 🔍 Step 4: Check Backend Logs After Sign-In

**After signing in, check backend logs:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep "Session lookup result"
```

**Share the output** - Does backend find the session?

---

## 🎯 Most Likely Issues

### Issue 1: Cookies are httpOnly
**If cookies are httpOnly, `document.cookie` will be empty, but cookies still exist and are sent automatically.**

**Fix:** Check Application tab instead of `document.cookie`.

### Issue 2: Cookie Name Different
**Better-auth might set cookies with a different name.**

**Fix:** Check Application tab to see actual cookie names.

### Issue 3: Cookies Not Set
**If no cookies in Application tab, better-auth isn't setting cookies.**

**Fix:** Check sign-in response headers for `Set-Cookie`.

---

## 🚀 Quick Check

**Do this:**

1. **Sign in**
2. **Check Application tab** (F12 → Application → Cookies → `https://rabbitpdf.in`)
3. **List all cookies you see**
4. **Check if any start with `better-auth`**

**Share:** What cookies do you see in Application tab?

---

## 📋 Also Check Backend

**After signing in, check if backend receives cookies:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 30 | grep "Session token received"
```

**Share:** Does it show EXISTS or MISSING?

