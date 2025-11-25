# 🔧 Fix: Uploads Directory Host Permissions

## 🚨 **The Problem:**

**Error:** `chmod: /app/uploads: Operation not permitted`

**Why:** The `/app/uploads` directory is mounted from the host (`./backend/uploads`), so permissions must be fixed on the host, not inside the container.

---

## ✅ **Solution: Fix Permissions on Host**

### **Step 1: Check Volume Mount**

**The uploads directory is mounted from:**
```yaml
volumes:
  - ./backend/uploads:/app/uploads
```

**So we need to fix permissions on `./backend/uploads` on the host.**

---

### **Step 2: Fix Permissions on Host**

**On the server (host machine):**

```bash
# Navigate to project directory
cd ~/RabbitPDF

# Create directory if missing
mkdir -p backend/uploads

# Fix permissions
chmod -R 777 backend/uploads

# Verify
ls -la backend/uploads
```

---

### **Step 3: Check Current Permissions**

```bash
# Check current permissions
ls -la backend/uploads

# Check who owns the directory
ls -ld backend/uploads
```

---

### **Step 4: Fix Ownership (If Needed)**

**If ownership is wrong:**

```bash
# Change ownership to current user
sudo chown -R $USER:$USER backend/uploads

# Then fix permissions
chmod -R 777 backend/uploads
```

---

### **Step 5: Restart Backend**

**After fixing permissions, restart backend:**

```bash
docker-compose -f docker-compose.production.yml restart backend
```

---

## 🎯 **Quick Fix:**

```bash
# 1. Navigate to project directory
cd ~/RabbitPDF

# 2. Create directory if missing
mkdir -p backend/uploads

# 3. Fix permissions on host
chmod -R 777 backend/uploads

# 4. Verify
ls -la backend/uploads

# 5. Restart backend
docker-compose -f docker-compose.production.yml restart backend

# 6. Test upload again
```

---

## 💡 **If Still Failing:**

**Try with sudo:**

```bash
sudo chmod -R 777 backend/uploads
sudo chown -R $USER:$USER backend/uploads
```

**Or check if directory exists:**

```bash
# Check if directory exists
ls -la backend/

# Create if missing
mkdir -p backend/uploads
chmod -R 777 backend/uploads
```

---

**Fix permissions on the host directory (`backend/uploads`)!** 🚀



