# 🔧 Fix: Backend API Routes 404 Errors

## ✅ **Great News: OAuth Sign-In is Working!** 🎉

**You're successfully signed in!** The 404 errors are for backend API routes, not OAuth.

---

## 🚨 **The Problem:**

**Frontend is calling:**
- `http://rabbitpdf.in:3000/api/conversation/list` ❌ (404 - Next.js API route doesn't exist)
- `http://rabbitpdf.in:3000/api/user/profile` ❌ (404 - Next.js API route doesn't exist)
- `http://rabbitpdf.in:3000/api/user/avatar` ❌ (404 - Next.js API route doesn't exist)

**But backend routes exist at:**
- `http://rabbitpdf.in:5000/conversation/list` ✅
- `http://rabbitpdf.in:5000/user/profile` ✅
- `http://rabbitpdf.in:5000/user/avatar` ✅

**Issue:** `NEXT_PUBLIC_API_BASE` is set to `http://rabbitpdf.in:3000/api` but should be `http://rabbitpdf.in:5000`

---

## ✅ **Solution: Fix NEXT_PUBLIC_API_BASE**

### **Step 1: Check Current Environment Variable**

**On the server, check `.env` file:**

```bash
docker-compose -f docker-compose.production.yml exec frontend env | grep NEXT_PUBLIC_API_BASE
```

**Or check the `.env` file:**

```bash
cat .env | grep NEXT_PUBLIC_API_BASE
```

---

### **Step 2: Update NEXT_PUBLIC_API_BASE**

**Update `.env` file on server:**

```bash
# Edit .env file
nano .env
```

**Change:**
```bash
NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:3000/api
```

**To:**
```bash
NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:5000
```

**Or if backend is on same domain:**
```bash
NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:5000
```

---

### **Step 3: Rebuild Frontend**

**Since `NEXT_PUBLIC_API_BASE` is baked into the build, rebuild:**

```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

### **Step 4: Verify Backend is Running**

**Check if backend is running:**

```bash
docker-compose -f docker-compose.production.yml ps
```

**Check backend logs:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50
```

---

## 🎯 **Quick Fix:**

```bash
# 1. Check current value
docker-compose -f docker-compose.production.yml exec frontend env | grep NEXT_PUBLIC_API_BASE

# 2. Update .env file (on server)
nano .env
# Change NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:5000

# 3. Rebuild frontend
docker-compose -f docker-compose.production.yml up -d --build frontend

# 4. Verify backend is running
docker-compose -f docker-compose.production.yml ps backend
```

---

## 💡 **Alternative: Check Backend Port**

**If backend is on a different port, update accordingly:**

```bash
# Check backend port in docker-compose.production.yml
grep -A 5 "backend:" docker-compose.production.yml
```

---

**Fix NEXT_PUBLIC_API_BASE to point to backend (port 5000)!** 🚀



