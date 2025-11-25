# 🔧 Fix: Upload PDF 500 Error

## 🚨 **The Problem:**

**Error:** `500 Internal Server Error` on `/upload` endpoint

**The backend is returning a 500 error when trying to upload a PDF.**

---

## ✅ **Solution: Check Backend Logs**

### **Step 1: Check Backend Logs**

**See what error is happening:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100
```

**Look for error messages related to upload.**

---

### **Step 2: Check Upload Route**

**The upload route might be failing due to:**
- Missing authentication
- File size limits
- Missing uploads directory
- Permission issues
- Missing dependencies

---

### **Step 3: Common Issues**

**1. Missing uploads directory:**

```bash
# Check if uploads directory exists
docker-compose -f docker-compose.production.yml exec backend ls -la /app/uploads

# Create if missing
docker-compose -f docker-compose.production.yml exec backend mkdir -p /app/uploads
docker-compose -f docker-compose.production.yml exec backend chmod 777 /app/uploads
```

**2. Permission issues:**

```bash
# Fix permissions
docker-compose -f docker-compose.production.yml exec backend chmod -R 777 /app/uploads
```

**3. Check backend health:**

```bash
# Check if backend is healthy
docker-compose -f docker-compose.production.yml ps backend

# Test backend endpoint
curl http://rabbitpdf.in:5000/health
```

---

## 🎯 **Quick Diagnostic:**

```bash
# 1. Check backend logs (most important!)
docker-compose -f docker-compose.production.yml logs backend --tail 100

# 2. Check uploads directory
docker-compose -f docker-compose.production.yml exec backend ls -la /app/uploads

# 3. Check backend health
docker-compose -f docker-compose.production.yml ps backend

# 4. Test backend endpoint
curl http://rabbitpdf.in:5000/health
```

---

**Check backend logs first to see the exact error!** 🔍



