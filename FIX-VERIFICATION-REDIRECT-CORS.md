# 🔧 Fix: Email Verification Redirect CORS Error

## 🚨 **The Problem:**

**Error:** `Cross-Origin Request Blocked` and redirect to internal Docker hostname `http://2b57d7b4b3e3:3000`

**The verification endpoint is redirecting to an internal Docker hostname instead of the public domain.**

---

## ✅ **Solution: Fix Redirect URL**

### **Step 1: Check Verification Endpoint**

**The issue is in `/api/auth/email/verify-and-login` - it's using the wrong URL for redirects.**

---

### **Step 2: Check NEXT_PUBLIC_APP_URL**

**Verify NEXT_PUBLIC_APP_URL is set correctly:**

```bash
# Check frontend environment
docker-compose -f docker-compose.production.yml exec frontend env | grep NEXT_PUBLIC_APP_URL
```

**Should be:** `NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000`

---

### **Step 3: Fix Verification Endpoint**

**The verification endpoint needs to use `NEXT_PUBLIC_APP_URL` for redirects, not internal hostname.**

**Check the code in:** `frontend/src/app/api/auth/email/verify-and-login/route.ts`

**It should use:**
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const redirectUrl = new URL(`/sign-in?email=...`, appUrl);
```

---

### **Step 4: Rebuild Frontend**

**After fixing, rebuild:**

```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## 🎯 **Quick Fix:**

```bash
# 1. Check NEXT_PUBLIC_APP_URL
docker-compose -f docker-compose.production.yml exec frontend env | grep NEXT_PUBLIC_APP_URL

# 2. Check verification endpoint code
# Look at frontend/src/app/api/auth/email/verify-and-login/route.ts
# Make sure it uses NEXT_PUBLIC_APP_URL for redirects

# 3. Rebuild frontend
docker-compose -f docker-compose.production.yml up -d --build frontend

# 4. Test verification link again
```

---

## 💡 **Common Issues:**

**1. Using `request.url` instead of `NEXT_PUBLIC_APP_URL`:**
- `request.url` gives internal Docker hostname
- Use `NEXT_PUBLIC_APP_URL` instead

**2. CORS headers missing:**
- Check if CORS headers are set correctly
- Verify `Access-Control-Allow-Origin` includes your domain

---

**Fix the verification endpoint to use NEXT_PUBLIC_APP_URL for redirects!** 🚀



