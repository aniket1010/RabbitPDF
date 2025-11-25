# 🚨 Connection Timeout - Check Instance Status

## 🚨 **Problem:** Can't connect to server

**This could mean:**
- Instance stopped
- Instance overloaded/unresponsive
- IP address changed
- Security group issue

---

## 🔍 **Step 1: Check AWS Console**

**Go to AWS Console:**

1. **EC2 Dashboard** → **Instances**
2. **Find your instance**
3. **Check:**

### **A. Instance State:**
- ✅ **"Running"** → Continue troubleshooting
- ❌ **"Stopped"** → Start it
- ⚠️ **"Stopping"** → Wait, then start

### **B. Status Checks:**
- ✅ **"2/2 checks passed"** → Instance is healthy
- ❌ **"Failed"** → Instance has issues (needs reboot)

### **C. Public IP Address:**
- **Check CURRENT IP** (might have changed!)

---

## 🚀 **Step 2: Use AWS Session Manager**

**If SSH doesn't work, use browser terminal:**

1. **AWS Console** → **EC2** → **Instances**
2. **Select your instance**
3. **Click "Connect"** (top right)
4. **Choose "Session Manager" tab**
5. **Click "Connect"**

**Opens terminal in browser - no SSH needed!** ✅

---

## 🔧 **Step 3: If Instance is Stopped**

**If instance shows "Stopped":**

1. **Select instance**
2. **Click "Start instance"**
3. **Wait 2-3 minutes**
4. **Get NEW Public IP** (will change!)
5. **Try connecting with new IP**

---

## 🔧 **Step 4: If Instance is Running but Unresponsive**

**If instance is "Running" but can't connect:**

**Try rebooting:**

1. **Select instance**
2. **Right-click** → **"Reboot instance"**
3. **Wait 2-3 minutes**
4. **Try connecting again**

**Or stop/start:**

1. **Select instance**
2. **Right-click** → **"Stop instance"**
3. **Wait until "Stopped"**
4. **Right-click** → **"Start instance"**
5. **Wait 2-3 minutes**
6. **Get NEW Public IP**
7. **Try connecting**

---

## 🔍 **Step 5: Check Security Group**

**Verify SSH is allowed:**

1. **Instance** → **Security tab** → **Security Group**
2. **Inbound rules** → **Check:**

**Must have:**
```
Type: SSH
Protocol: TCP
Port: 22
Source: 0.0.0.0/0
```

**If missing:** Add it!

---

## 🎯 **Step 6: Once Connected, Check Build Status**

**After reconnecting:**

```bash
# Navigate to project
cd ~/RabbitPDF

# Check Docker images
docker images

# Check if build is still running
ps aux | grep docker-compose
ps aux | grep npm

# Check Docker containers
docker ps -a
```

---

## 📋 **Quick Action Plan:**

**Right now:**

1. **Open AWS Console** → **EC2** → **Instances**
2. **Check:**
   - Instance state: Running / Stopped?
   - Status checks: 2/2 passed / Failed?
   - Current Public IP: What is it?
3. **Try AWS Session Manager** (browser terminal)
4. **If instance stopped:** Start it
5. **If instance running but unresponsive:** Reboot it

---

## 💡 **Why This Happens:**

**Possible causes:**
1. **Instance stopped** (most common)
2. **Instance overloaded** (build used all resources)
3. **Network issue** (temporary)
4. **IP changed** (after restart)

---

## 🆘 **If Still Can't Connect:**

**Try these:**

1. **Use AWS Session Manager** (most reliable)
2. **Check AWS Console** for instance status
3. **Reboot instance** if needed
4. **Check security group** allows SSH

---

## 📊 **Tell Me:**

**After checking AWS Console:**

1. **Instance state:** Running / Stopped / Stopping?
2. **Status checks:** 2/2 passed / Failed?
3. **Current Public IP:** What is it?
4. **Did you try AWS Session Manager?** (Yes/No)

**Then I'll guide you through the fix!** 🚀

---

## ✅ **Most Likely Fix:**

**Instance might have stopped or become unresponsive.**

**Solution:**
1. AWS Console → Check instance status
2. If stopped → Start it
3. If running but unresponsive → Reboot it
4. Use AWS Session Manager to connect (more stable)

**Check AWS Console and let me know what you see!** 🎯


