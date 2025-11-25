# 📁 Copy Public Directory to Server

## 🎯 **The Problem:**

The `public` directory doesn't exist on your server, which is why the Docker build is failing.

---

## ✅ **Solution: Copy Public Directory from Local to Server**

### **Step 1: Copy Public Directory**

**On your Windows PowerShell:**

```powershell
# Navigate to your project
cd D:\all_my_code\projects\chatPDF

# Copy the entire public directory to server
scp -i C:\Users\$env:USERNAME\Downloads\chatpdf-key.pem -r frontend/public ubuntu@YOUR_SERVER_IP:~/RabbitPDF/frontend/
```

**Replace `YOUR_SERVER_IP` with your actual server IP address.**

**Example:**
```powershell
scp -i C:\Users\$env:USERNAME\Downloads\chatpdf-key.pem -r frontend/public ubuntu@54.123.45.67:~/RabbitPDF/frontend/
```

---

### **Step 2: Verify It Was Copied**

**On your server (SSH):**

```bash
ls -la frontend/public
```

**You should see:**
```
drwxr-xr-x 4 ubuntu ubuntu 4096 ... avatars/
drwxr-xr-x 4 ubuntu ubuntu 4096 ... logos/
```

---

### **Step 3: Rebuild**

**After copying, rebuild:**

```bash
docker-compose -f docker-compose.production.yml build frontend
```

**Or clean build:**

```bash
docker-compose -f docker-compose.production.yml build --no-cache frontend
```

---

## 🚀 **Alternative: Copy Entire Frontend Directory**

**If you want to ensure everything is synced, copy the entire frontend directory:**

```powershell
# On Windows PowerShell
cd D:\all_my_code\projects\chatPDF

# Copy entire frontend directory (excluding node_modules)
scp -i C:\Users\$env:USERNAME\Downloads\chatpdf-key.pem -r frontend/* ubuntu@YOUR_SERVER_IP:~/RabbitPDF/frontend/
```

**This will copy all files including public directory.**

---

## 💡 **Why This Happened:**

The `public` directory might not have been:
- Committed to git
- Copied when you cloned/pulled the repository
- Included in your deployment

**After copying, the build should work!** ✅

---

## ✅ **Quick Commands:**

**Copy public directory:**
```powershell
scp -i C:\Users\$env:USERNAME\Downloads\chatpdf-key.pem -r frontend/public ubuntu@YOUR_SERVER_IP:~/RabbitPDF/frontend/
```

**Verify on server:**
```bash
ls -la frontend/public
```

**Rebuild:**
```bash
docker-compose -f docker-compose.production.yml build frontend
```

---

**Let me know when you've copied it!** 🚀



