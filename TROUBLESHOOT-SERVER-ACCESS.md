# 🔧 Troubleshoot Server Access Issues

## 🚨 **Can't Access Server via SSH or Browser?**

**This suggests the server might be down or ports are blocked.**

---

## ✅ **Step 1: Check if Server is Running**

### **Check EC2 Instance Status**

**1. Go to AWS Console → EC2 → Instances**
**2. Find your instance (`51.20.135.170`)**
**3. Check Status:**
   - **Running** ✅ → Server is up
   - **Stopped** ❌ → Start the instance
   - **Stopping/Starting** ⏳ → Wait for it to finish

**If stopped, click "Start instance"**

---

## ✅ **Step 2: Check Security Group Rules**

### **Check Inbound Rules**

**1. Go to EC2 → Instances → Select your instance**
**2. Click "Security" tab**
**3. Click on Security Group name**
**4. Check "Inbound rules":**

**You should have:**
- **SSH (22)** - Source: Your IP or `0.0.0.0/0`
- **HTTP (80)** - Source: `0.0.0.0/0`
- **Custom TCP (3000)** - Source: `0.0.0.0/0` (for frontend)
- **Custom TCP (5000)** - Source: `0.0.0.0/0` (for backend)

**If missing, add them:**

**1. Click "Edit inbound rules"**
**2. Click "Add rule"**
**3. Add:**
   - Type: SSH, Port: 22, Source: Your IP
   - Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0
   - Type: Custom TCP, Port: 5000, Source: 0.0.0.0/0
**4. Click "Save rules"**

---

## ✅ **Step 3: Check if Services are Running**

### **Use AWS Session Manager (No SSH Needed)**

**1. Go to EC2 → Instances → Select instance**
**2. Click "Connect" → "Session Manager"**
**3. If not available, enable SSM (see below)**

**Once connected, check services:**

```bash
# Check if Docker is running
sudo systemctl status docker

# Check if containers are running
docker ps

# Check if services are up
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs frontend --tail 50
```

---

## ✅ **Step 4: Enable AWS Session Manager**

**If Session Manager isn't available:**

**1. Go to EC2 → Instances → Select instance**
**2. Actions → Security → Modify IAM role**
**3. Create/Attach IAM role with `AmazonSSMManagedInstanceCore` policy:**

**Steps:**
- Go to IAM → Roles → Create role
- Select "EC2" → Next
- Attach policy: `AmazonSSMManagedInstanceCore`
- Name: `EC2-SSM-Role`
- Create role
- Go back to EC2 → Select instance → Actions → Security → Modify IAM role
- Select the role you just created
- Save

**Wait 1-2 minutes, then try Session Manager again**

---

## ✅ **Step 5: Test Server Access**

### **Test Ports**

**From your local machine:**

```cmd
# Test if port 22 (SSH) is open
telnet 51.20.135.170 22

# Test if port 3000 is open
telnet 51.20.135.170 3000

# Test if port 5000 is open
telnet 51.20.135.170 5000
```

**Or use online tool:** https://www.yougetsignal.com/tools/open-ports/

---

## ✅ **Step 6: Check Public IP**

**Make sure you're using the correct IP:**

**1. Go to EC2 → Instances**
**2. Check "Public IPv4 address"**
**3. Make sure it matches `51.20.135.170`**

**If IP changed (after restart), use the new IP**

---

## 🎯 **Quick Diagnostic:**

**1. Check instance status** → Should be "Running"
**2. Check security group** → Ports 22, 3000, 5000 should be open
**3. Use Session Manager** → Connect and check services
**4. Check Docker containers** → Should be running

---

## 💡 **Most Likely Issues:**

**1. Instance is stopped** → Start it
**2. Security group blocking ports** → Add rules
**3. Services not running** → Start Docker containers
**4. Wrong IP address** → Check public IP

---

## 🔧 **Quick Fix:**

**1. Go to AWS Console → EC2**
**2. Check instance status** → Start if stopped
**3. Check security group** → Add missing ports
**4. Use Session Manager** → Connect and check services
**5. Start services if needed:**

```bash
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d
```

---

**Check instance status and security group first!** 🔍



