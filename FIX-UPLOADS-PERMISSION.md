# 🔧 Fix: Uploads Directory Permission Denied

## 🚨 **The Problem:**

**Error:** `EACCES: permission denied, open '/app/uploads/...'`

**The backend doesn't have write permissions to the `/app/uploads` directory.**

---

## ✅ **Solution: Fix Uploads Directory Permissions**

### **Step 1: Check Current Permissions**

```bash
docker-compose -f docker-compose.production.yml exec backend ls -la /app/uploads
```

---

### **Step 2: Fix Permissions**

**Make uploads directory writable:**

```bash
# Fix permissions on uploads directory
docker-compose -f docker-compose.production.yml exec backend chmod -R 777 /app/uploads

# Or create directory if missing and set permissions
docker-compose -f docker-compose.production.yml exec backend mkdir -p /app/uploads
docker-compose -f docker-compose.production.yml exec backend chmod -R 777 /app/uploads
```

---

### **Step 3: Verify Permissions**

```bash
# Check permissions
docker-compose -f docker-compose.production.yml exec backend ls -la /app/uploads
```

**Should show `drwxrwxrwx` (777 permissions).**

---

### **Step 4: Test Upload Again**

**Try uploading a PDF again - it should work now!**

---

## 🎯 **Quick Fix:**

```bash
# 1. Create directory if missing
docker-compose -f docker-compose.production.yml exec backend mkdir -p /app/uploads

# 2. Fix permissions
docker-compose -f docker-compose.production.yml exec backend chmod -R 777 /app/uploads

# 3. Verify
docker-compose -f docker-compose.production.yml exec backend ls -la /app/uploads

# 4. Test upload again
```

---

## 💡 **Alternative: Fix Host Directory Permissions**

**If the uploads directory is mounted from host, fix permissions on host:**

```bash
# On host machine
sudo chmod -R 777 backend/uploads
```

**Or check docker-compose.production.yml volume mount:**

```bash
# Check volume mount
grep -A 2 "uploads" docker-compose.production.yml
```

---

**Fix uploads directory permissions!** 🚀



