# 🔧 Fix: Instance Reachability Check Failed

## 🚨 **Problem:** Instance reachability check failed

**This means:** Instance is running but unresponsive (can't reach it)

**Common causes:**
- Out of memory (Docker build used all resources)
- System overloaded
- Network issues
- System crash

---

## 🔧 **Solution: Reboot Instance**

**This will restart the instance and should fix the issue.**

---

## 🚀 **Step 1: Reboot Instance**

**In AWS Console:**

1. **EC2 Dashboard** → **Instances**
2. **Select your instance** (checkbox)
3. **Click "Instance state"** button (top right)
4. **Click "Reboot instance"**
5. **Click "Reboot"** to confirm
6. **Wait 2-3 minutes**

---

## ⏱️ **Step 2: Wait for Instance to Reboot**

**After clicking reboot:**

1. **Refresh the page** (F5)
2. **Watch Status Checks:**
   - Will show "Initializing" → Wait
   - Then "1/2 checks passed" → Wait
   - Finally "2/2 checks passed" → Ready!

**Wait until Status Checks = "2/2 checks passed"** (2-3 minutes)

---

## 🔍 **Step 3: Try Connecting Again**

**Once Status Checks = "2/2 checks passed":**

### **Option A: SSH**

```powershell
# Use the Public IP from AWS Console
ssh -i rabbitpdf-key.pem ubuntu@13.61.180.8
```

### **Option B: AWS Session Manager**

1. **EC2 Instances page**
2. **Select instance**
3. **Click "Connect"**
4. **Session Manager tab**
5. **Click "Connect"**

---

## 🔍 **Step 4: Check Docker Build Status**

**Once connected:**

```bash
# Navigate to project
cd ~/RabbitPDF

# Check Docker images (see if build completed)
docker images

# Should show backend and frontend images if build completed

# Check containers
docker ps -a

# Check if build process is still running
ps aux | grep docker-compose
ps aux | grep npm
```

---

## 📊 **What to Expect:**

### **Scenario 1: Build Completed**

**If you see Docker images:**

```bash
# Images exist - build completed!
docker images

# Start services
docker-compose -f docker-compose.production.yml up -d

# Wait 30 seconds
sleep 30

# Check status
docker-compose -f docker-compose.production.yml ps

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

---

### **Scenario 2: Build Didn't Complete**

**If no images or build failed:**

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs

# Restart build
docker-compose -f docker-compose.production.yml build
```

---

### **Scenario 3: Build Still Running**

**If processes are still running:**

```bash
# Monitor progress
docker-compose -f docker-compose.production.yml logs -f

# Or check images periodically
watch -n 30 'docker images'
```

---

## 💡 **Why This Happened:**

**Docker builds on t2.micro can:**
- Use all available memory
- Overload the CPU
- Cause system to become unresponsive
- Trigger automatic shutdown/restart

**After reboot, instance should be responsive again.**

---

## 🎯 **Action Plan:**

**Right now:**

1. **Reboot instance** (AWS Console → Instance state → Reboot)
2. **Wait 2-3 minutes** for Status Checks to pass
3. **Connect** (SSH or Session Manager)
4. **Check Docker build status** (`docker images`)
5. **Based on results:**
   - ✅ Images exist → Start services
   - ❌ No images → Restart build
   - ⏳ Still building → Wait

---

## 🆘 **If Reboot Doesn't Work:**

**If instance still shows "reachability check failed" after reboot:**

1. **Stop instance** (Instance state → Stop)
2. **Wait until "Stopped"**
3. **Start instance** (Instance state → Start)
4. **Wait 2-3 minutes**
5. **Try connecting**

---

## 📋 **Quick Steps:**

1. ✅ **Reboot instance** in AWS Console
2. ⏱️ **Wait 2-3 minutes**
3. 🔍 **Check Status Checks = "2/2 checks passed"**
4. 🔌 **Connect** (SSH or Session Manager)
5. 📊 **Check:** `docker images`
6. 🚀 **Proceed** based on results

**Reboot the instance and let me know when you can connect!** 🎯


