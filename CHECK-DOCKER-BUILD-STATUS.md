# 🔍 Check Docker Build Status After Restart

## 🎯 **What We Need to Do:**

After restarting the instance, we need to:
1. ✅ Reconnect via SSH
2. ✅ Check if Docker build completed
3. ✅ See what happened (success/failure/stuck)
4. ✅ Take appropriate action

---

## 📋 **Step-by-Step:**

### **Step 1: Get New IP and Reconnect**

**After restart, IP address changes!**

1. **AWS Console** → **EC2** → **Instances**
2. **Get NEW Public IP** (not the old one!)
3. **Connect:**

```powershell
ssh -i rabbitpdf-key.pem ubuntu@NEW_IP_ADDRESS
```

---

### **Step 2: Once Connected, Check Docker Status**

**Run these commands:**

```bash
# Navigate to project
cd ~/RabbitPDF
# or
cd ~/ChatPDF

# Check if Docker images were built
docker images

# Check if containers exist
docker ps -a

# Check Docker Compose status
docker-compose -f docker-compose.production.yml ps

# Check recent logs
docker-compose -f docker-compose.production.yml logs --tail=50
```

---

### **Step 3: Check What Happened**

**Look for:**

#### **A. If Images Exist:**
```bash
docker images
# Should show: backend, frontend images
```

**If images exist:**
- ✅ Build completed!
- ✅ You can start services now

#### **B. If No Images:**
```bash
docker images
# Shows only base images (postgres, redis, node)
```

**If no images:**
- ❌ Build didn't complete
- ❌ Need to rebuild

#### **C. Check Build Process:**
```bash
# Check if build is still running
ps aux | grep docker

# Check Docker processes
docker ps -a
```

---

## 🎯 **Possible Scenarios:**

### **Scenario 1: Build Completed Successfully**

**Signs:**
- ✅ `docker images` shows backend and frontend images
- ✅ Images have recent timestamps

**Action:**
```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

---

### **Scenario 2: Build Failed**

**Signs:**
- ❌ No backend/frontend images
- ❌ Error messages in logs

**Action:**
```bash
# Check logs for errors
docker-compose -f docker-compose.production.yml logs

# Rebuild
docker-compose -f docker-compose.production.yml build
```

---

### **Scenario 3: Build Never Started**

**Signs:**
- ❌ No images
- ❌ No build process running
- ❌ Project directory might be empty

**Action:**
```bash
# Check if project exists
ls -la

# If missing, clone again
git clone YOUR_REPO_URL
cd YOUR_PROJECT_NAME
```

---

### **Scenario 4: Build Stuck Again**

**Signs:**
- ⏳ Build process running but no progress
- ⏳ Stuck at npm ci step

**Action:**
- See solutions below

---

## 🚀 **If Build Completed:**

**Start services:**

```bash
# Make sure you're in project directory
cd ~/RabbitPDF
# or
cd ~/ChatPDF

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Wait 30 seconds
sleep 30

# Check status
docker-compose -f docker-compose.production.yml ps

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

---

## 🔧 **If Build Failed or Stuck:**

### **Option 1: Clean Rebuild**

```bash
# Stop everything
docker-compose -f docker-compose.production.yml down

# Remove old images (optional)
docker system prune -a  # Be careful! Removes all unused images

# Rebuild
docker-compose -f docker-compose.production.yml build

# Start
docker-compose -f docker-compose.production.yml up -d
```

---

### **Option 2: Build with More Verbose Output**

**To see what's happening:**

```bash
# Build with verbose output
docker-compose -f docker-compose.production.yml build --progress=plain

# Or build one service at a time
docker-compose -f docker-compose.production.yml build backend
docker-compose -f docker-compose.production.yml build frontend
```

---

### **Option 3: Check System Resources**

**If build keeps getting stuck:**

```bash
# Check available resources
free -h      # Memory
df -h        # Disk space
nproc        # CPU cores

# If low resources, might need larger instance
```

---

## 📊 **Quick Diagnostic Commands:**

**Run these to see what's happening:**

```bash
# 1. Check Docker images
docker images

# 2. Check running containers
docker ps

# 3. Check all containers
docker ps -a

# 4. Check Docker Compose status
docker-compose -f docker-compose.production.yml ps

# 5. Check logs
docker-compose -f docker-compose.production.yml logs --tail=100

# 6. Check if build process running
ps aux | grep docker
ps aux | grep npm
```

---

## 🎯 **Action Plan:**

**Right now:**

1. **Reconnect via SSH** (with new IP)
2. **Run diagnostic commands** (see above)
3. **Tell me what you see:**
   - Do images exist?
   - Are containers running?
   - Any error messages?
   - What's the status?

**Then I'll guide you through the next steps!** 🚀

---

## 💡 **Pro Tip:**

**If build keeps getting stuck:**

Consider:
1. **Upgrading instance size** (t2.micro → t2.small)
   - More CPU = faster builds
   - Costs ~$15/month vs ~$8/month

2. **Or build locally and push** (if you have Docker locally)
   - Build on your machine
   - Push to Docker Hub
   - Pull on server

**But let's first check what happened!** 🔍

