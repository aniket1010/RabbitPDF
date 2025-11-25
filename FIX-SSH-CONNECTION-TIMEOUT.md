# 🔧 Fix: SSH Connection Timeout

## 🚨 **Problem:**

```
ssh: connect to host 51.20.135.170 port 22: Connection timed out
```

**This means:** Your server's SSH port (22) is not accessible from your current location.

---

## 🔍 **Possible Causes:**

1. **Security Group not allowing SSH from your IP**
2. **Instance stopped or terminated**
3. **IP address changed** (if using dynamic IP)
4. **Firewall blocking connection**

---

## ✅ **Solution 1: Check Security Group (Most Common)**

### **Step 1: Go to AWS Console**

1. Go to: https://console.aws.amazon.com/ec2/
2. Click **"Instances"** (left sidebar)
3. Find your instance (IP: 51.20.135.170)
4. Check if it's **"Running"** ✅

### **Step 2: Check Security Group**

1. Click on your instance
2. Click **"Security"** tab (bottom)
3. Click on the **Security Group** name (e.g., `sg-xxxxx`)
4. Click **"Edit inbound rules"**

### **Step 3: Add SSH Rule**

**Check if you have:**
- Type: SSH
- Port: 22
- Source: Your IP or 0.0.0.0/0

**If missing, add:**
- Click **"Add rule"**
- Type: **SSH**
- Port: **22**
- Source: **My IP** (recommended) or **0.0.0.0/0** (less secure)
- Click **"Save rules"**

---

## ✅ **Solution 2: Check Instance Status**

### **In AWS Console:**

1. Go to EC2 → Instances
2. Find instance with IP: 51.20.135.170
3. Check **"Instance state"**

**If it says:**
- ✅ **"Running"** → Good, check security group
- ⏸️ **"Stopped"** → Start it!
- ❌ **"Terminated"** → Instance is gone, need new one

### **Start Stopped Instance:**

1. Select instance
2. Click **"Instance state"** → **"Start instance"**
3. Wait 1-2 minutes
4. **Note:** IP address might change!

---

## ✅ **Solution 3: Check IP Address**

**If instance was stopped/started, IP might have changed!**

### **Get New IP:**

1. Go to EC2 → Instances
2. Find your instance
3. Check **"Public IPv4 address"**
4. **Use this new IP** if it changed!

---

## ✅ **Solution 4: Test from Different Network**

**Try:**
- Different WiFi network
- Mobile hotspot
- Different location

**If it works elsewhere:** Your current network might be blocking port 22.

---

## 🔍 **Quick Diagnostic:**

### **Check if Instance is Running:**

**In AWS Console:**
- EC2 → Instances → Check status

### **Check Security Group:**

**In AWS Console:**
- EC2 → Instances → Select instance → Security tab → Security Group → Inbound rules

**Should have:**
```
Type: SSH
Protocol: TCP
Port: 22
Source: Your IP or 0.0.0.0/0
```

---

## 🚀 **Step-by-Step Fix:**

### **1. Verify Instance is Running:**

```
AWS Console → EC2 → Instances
→ Check "Instance state" = "Running"
```

### **2. Check Security Group:**

```
AWS Console → EC2 → Instances
→ Select instance → Security tab
→ Click Security Group name
→ Edit inbound rules
```

### **3. Add SSH Rule (if missing):**

```
Add rule:
- Type: SSH
- Port: 22
- Source: My IP (or 0.0.0.0/0)
- Save rules
```

### **4. Get Current IP:**

```
AWS Console → EC2 → Instances
→ Check "Public IPv4 address"
→ Use this IP in SSH command
```

### **5. Try SSH Again:**

```powershell
ssh -i rabbitpdf-key.pem ubuntu@NEW_IP_ADDRESS
```

---

## 💡 **Alternative: Use AWS Systems Manager (No SSH Needed)**

**If SSH still doesn't work, you can use AWS Session Manager:**

1. Install AWS CLI
2. Install Session Manager plugin
3. Connect via AWS Console → EC2 → Connect → Session Manager

**But SSH is easier once fixed!**

---

## 🆘 **If Still Not Working:**

### **Check:**

1. ✅ Instance is running?
2. ✅ Security group allows SSH?
3. ✅ Using correct IP address?
4. ✅ Key file permissions correct?
5. ✅ Not behind corporate firewall?

### **Try:**

```powershell
# Test if port is open
Test-NetConnection -ComputerName 51.20.135.170 -Port 22

# Or use telnet
telnet 51.20.135.170 22
```

**If connection refused:** Security group issue
**If timeout:** Firewall/network issue

---

## ✅ **Most Likely Fix:**

**Security Group needs SSH rule!**

1. Go to AWS Console
2. EC2 → Instances → Your instance
3. Security tab → Security Group → Edit inbound rules
4. Add SSH rule (port 22)
5. Save
6. Try SSH again

---

**Let me know what you find in AWS Console!** 🔍



