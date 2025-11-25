# 🔍 Check EC2 Instance Status - Connection Failed

## 🚨 **AWS Session Manager Failed Too**

**"Failed to connect to your instance"** means:
- Instance is stopped
- Instance is unresponsive
- SSM agent not running

---

## 🎯 **Step 1: Go to EC2 Instances Page**

**In AWS Console:**

1. **Search bar** (top) → Type: **EC2**
2. **Click "EC2"**
3. **Left sidebar** → Click **"Instances"**
4. **Find your instance** (should be only one)

---

## 🔍 **Step 2: Check Instance Status**

**Look at these columns:**

### **A. Instance State:**

**What do you see?**
- ✅ **"Running"** → Continue to Step 3
- ❌ **"Stopped"** → **START IT!** (see Step 4)
- ⚠️ **"Stopping"** → Wait until stopped, then start
- ⚠️ **"Shutting down"** → Wait
- ⚠️ **"Pending"** → Wait for it to start

---

### **B. Status Checks:**

**What do you see?**
- ✅ **"2/2 checks passed"** → Instance healthy
- ❌ **"0/2 checks passed"** or **"Initializing"** → Wait
- ❌ **"1/2 checks passed"** or **"Failed"** → Instance has issues

---

### **C. Public IPv4 Address:**

**What's the IP shown?**
- Note this IP (might be different from before!)

---

## 🚀 **Step 3: If Instance is Stopped**

**If "Instance State" = "Stopped":**

1. **Select the instance** (checkbox)
2. **Click "Instance state"** button (top right)
3. **Click "Start instance"**
4. **Wait 2-3 minutes**
5. **Refresh page**
6. **Check:**
   - Instance State = "Running"
   - Status Checks = "2/2 checks passed"
   - Note the NEW Public IP

---

## 🔧 **Step 4: If Instance is Running but Unresponsive**

**If "Instance State" = "Running" but can't connect:**

### **Option A: Reboot Instance**

1. **Select instance**
2. **Click "Instance state"** → **"Reboot instance"**
3. **Click "Reboot"** to confirm
4. **Wait 2-3 minutes**
5. **Try connecting again**

---

### **Option B: Stop and Start**

1. **Select instance**
2. **Click "Instance state"** → **"Stop instance"**
3. **Wait until "Stopped"** (1-2 minutes)
4. **Click "Instance state"** → **"Start instance"**
5. **Wait until "Running"** (1-2 minutes)
6. **Get NEW Public IP** (will change!)
7. **Try connecting**

---

## 📋 **Step 5: After Starting/Rebooting**

**Once instance is "Running" with "2/2 checks passed":**

### **Try SSH:**

```powershell
# Use CURRENT Public IP from AWS Console
ssh -i rabbitpdf-key.pem ubuntu@CURRENT_IP_FROM_CONSOLE
```

---

### **Or Try Session Manager Again:**

1. **EC2 Instances page**
2. **Select instance**
3. **Click "Connect"** button
4. **Session Manager tab**
5. **Click "Connect"**

---

## 🎯 **Step 6: Once Connected, Check Build**

**After reconnecting:**

```bash
# Navigate to project
cd ~/RabbitPDF

# Check Docker images
docker images

# Check if build completed
docker ps -a

# Check logs
docker-compose -f docker-compose.production.yml logs --tail=50
```

---

## 📊 **What to Check in AWS Console:**

**Go to EC2 → Instances and tell me:**

1. **Instance State:** Running / Stopped / Stopping / Pending?
2. **Status Checks:** 2/2 passed / Failed / Initializing?
3. **Public IPv4 Address:** What is it?

**Take a screenshot if easier!**

---

## 💡 **Most Likely Scenario:**

**Instance probably stopped or became unresponsive during the build.**

**Docker builds can use a lot of resources on t2.micro, which might cause:**
- Out of memory
- Instance becomes unresponsive
- Automatic shutdown

---

## 🚀 **Quick Fix:**

1. **Go to EC2 → Instances**
2. **Check instance state**
3. **If stopped:** Start it
4. **If running but unresponsive:** Reboot it
5. **Wait 2-3 minutes**
6. **Try connecting**
7. **Check if Docker build completed**

---

## 🆘 **Tell Me:**

**After checking EC2 Instances page:**

1. **Instance state?**
2. **Status checks?**
3. **Public IP?**

**Or share a screenshot of the Instances page!**

**Then I'll guide you on exact next steps!** 🎯


