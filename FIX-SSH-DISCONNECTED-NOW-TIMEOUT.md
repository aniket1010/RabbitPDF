# 🔧 Fix: SSH Disconnected, Now Can't Reconnect

## 🚨 **What Happened:**

1. ✅ You were connected: `ubuntu@ip-172-31-30-193:~/RabbitPDF$`
2. ❌ Connection reset: `client_loop: send disconnect: Connection reset`
3. ❌ Now can't reconnect: `Connection timed out`

**This suggests:** Instance might have stopped, restarted, or IP changed.

---

## 🔍 **Quick Diagnosis:**

### **1. Check Instance Status in AWS Console**

**Go to:** https://console.aws.amazon.com/ec2/

1. Click **"Instances"**
2. Find instance with IP: **51.20.135.170**
3. Check **"Instance state"**

**Possible states:**
- ✅ **"Running"** → Good, check IP address
- ⏸️ **"Stopped"** → Instance stopped, need to start
- 🔄 **"Stopping"** → Instance is stopping
- 🔄 **"Starting"** → Instance is starting (wait 1-2 min)
- ⚠️ **"Stopped"** → Instance stopped unexpectedly

---

### **2. Check IP Address**

**If instance was stopped/started, IP might have changed!**

1. In EC2 → Instances
2. Check **"Public IPv4 address"**
3. **It might be different from 51.20.135.170!**

**Use the NEW IP address if it changed.**

---

### **3. Check Security Group**

**Make sure SSH is still allowed:**

1. Select instance → **Security** tab
2. Click Security Group name
3. **Edit inbound rules**
4. Verify SSH (port 22) rule exists
5. Source should be: **My IP** or **0.0.0.0/0**

---

## ✅ **Solution Steps:**

### **Step 1: Verify Instance is Running**

**In AWS Console:**
- EC2 → Instances
- Check instance state = **"Running"**

**If stopped:**
- Select instance
- **Instance state** → **Start instance**
- Wait 1-2 minutes
- **Note the NEW IP address!**

---

### **Step 2: Get Current IP Address**

**After instance is running:**
- Check **"Public IPv4 address"**
- **Use this IP** (might be different!)

---

### **Step 3: Try SSH with New IP**

**If IP changed, use new IP:**

```powershell
ssh -i rabbitpdf-key.pem ubuntu@NEW_IP_ADDRESS
```

**Example:**
```powershell
ssh -i rabbitpdf-key.pem ubuntu@54.123.45.67
```

---

### **Step 4: If Still Can't Connect**

**Check Security Group:**

1. Instance → Security tab → Security Group
2. Edit inbound rules
3. Add SSH rule if missing:
   - Type: **SSH**
   - Port: **22**
   - Source: **My IP** or **0.0.0.0/0**
4. Save rules

---

## 🧪 **Test Connection:**

### **Test if Port 22 is Open:**

```powershell
Test-NetConnection -ComputerName 51.20.135.170 -Port 22
```

**Or test with new IP:**
```powershell
Test-NetConnection -ComputerName NEW_IP -Port 22
```

**Results:**
- ✅ **TcpTestSucceeded: True** → Port is open, try SSH
- ❌ **TcpTestSucceeded: False** → Security group issue

---

## 🚀 **Alternative: Access via Browser**

**While troubleshooting SSH, check if application is still running:**

**Try accessing:**
```
http://51.20.135.170:3000
```

**Or with new IP:**
```
http://NEW_IP:3000
```

**If it works:**
- ✅ Instance is running
- ✅ Application is up
- ❌ SSH issue (security group or IP changed)

**If it doesn't work:**
- ❌ Instance might be stopped
- ❌ Need to restart services

---

## 💡 **Common Scenarios:**

### **Scenario 1: Instance Stopped**

**Symptoms:**
- Connection reset
- Can't reconnect
- Browser can't access app

**Fix:**
1. AWS Console → Start instance
2. Wait 1-2 minutes
3. Get new IP address
4. Try SSH with new IP

---

### **Scenario 2: IP Address Changed**

**Symptoms:**
- Connection reset
- Old IP doesn't work
- Instance is running

**Fix:**
1. Get new IP from AWS Console
2. Use new IP in SSH command
3. Update security group if needed

---

### **Scenario 3: Security Group Modified**

**Symptoms:**
- Was working before
- Now connection timeout
- Instance is running

**Fix:**
1. Check Security Group rules
2. Add SSH rule if missing
3. Verify source IP is correct

---

## ✅ **Quick Fix Checklist:**

- [ ] Check instance is "Running" in AWS Console
- [ ] Get current Public IP address
- [ ] Verify Security Group allows SSH (port 22)
- [ ] Try SSH with current IP
- [ ] Test port 22: `Test-NetConnection -ComputerName IP -Port 22`
- [ ] Try accessing app in browser: `http://IP:3000`

---

## 🆘 **If Instance is Stopped:**

**Start it:**

1. AWS Console → EC2 → Instances
2. Select instance
3. **Instance state** → **Start instance**
4. Wait 1-2 minutes
5. **Get new IP address**
6. Try SSH with new IP

**Note:** IP address will likely change when you stop/start!

---

## 🎯 **Most Likely Issue:**

**Instance stopped or IP changed!**

**Check AWS Console first:**
1. Is instance running?
2. What's the current IP?
3. Use that IP for SSH

---

**Go to AWS Console and check:**
1. ✅ Instance state (Running/Stopped?)
2. ✅ Current Public IP address
3. ✅ Security Group rules

**Let me know what you find!** 🔍



