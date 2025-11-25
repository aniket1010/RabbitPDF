# 🚨 Cannot Connect to Server - Complete Fix Guide

## 🎯 **Problem:** Can't SSH into EC2 instance

**Let's fix this step by step!**

---

## 🔍 **Step 1: Check AWS Console**

### **Go to AWS Console:**

1. **EC2 Dashboard** → **Instances**
2. **Find your instance**
3. **Check these carefully:**

---

### **A. Instance State:**

**What you might see:**
- ✅ **"Running"** → Instance is on
- ⚠️ **"Stopping"** → Wait for it to stop, then start
- ❌ **"Stopped"** → Need to start it
- ❌ **"Pending"** → Wait for it to start
- ❌ **"Terminated"** → Instance is deleted (need to create new)

**Action:**
- If **"Stopped"**: Click "Start instance" → Wait 2-3 minutes
- If **"Stopping"**: Wait until it stops, then start
- If **"Pending"**: Wait 1-2 minutes

---

### **B. Status Checks:**

**Should show:**
- ✅ **"2/2 checks passed"** → Instance is healthy
- ❌ **"Failed"** → Instance has issues

**If failed:**
- Try rebooting instance
- Or stop and start again

---

### **C. Public IP Address:**

**Important:** IP changes every time instance stops/starts!

**Check:**
- What is the **current** Public IPv4 address?
- Is it different from `13.61.180.8`?

**Use the CURRENT IP shown in AWS Console!**

---

### **D. Security Group:**

**Check inbound rules:**

1. **Select instance**
2. **Click "Security" tab** (bottom)
3. **Click Security Group name**
4. **Check "Inbound rules":**

**Must have:**
```
Type: SSH
Protocol: TCP
Port: 22
Source: 0.0.0.0/0 (or your specific IP)
```

**If missing:**
- Click "Edit inbound rules"
- Add SSH rule (port 22)
- Source: `0.0.0.0/0` (or your IP)
- Save

---

## 🔧 **Step 2: Common Issues & Fixes**

### **Issue 1: Instance Stopped**

**Symptoms:**
- Instance state = "Stopped"
- Can't connect

**Fix:**
1. Select instance → Click "Start instance"
2. Wait 2-3 minutes
3. Get NEW Public IP (it changes!)
4. Connect with new IP:

```powershell
ssh -i rabbitpdf-key.pem ubuntu@NEW_IP_ADDRESS
```

---

### **Issue 2: Wrong IP Address**

**Symptoms:**
- Using old IP address
- Connection timeout

**Fix:**
1. AWS Console → Instance
2. Check "Public IPv4 address" (current one!)
3. Use that IP:

```powershell
ssh -i rabbitpdf-key.pem ubuntu@CURRENT_IP_FROM_CONSOLE
```

---

### **Issue 3: Security Group Blocking**

**Symptoms:**
- Instance running but can't connect
- Connection timeout

**Fix:**
1. Instance → Security tab → Security Group
2. Edit inbound rules
3. Add SSH rule:
   - Type: SSH
   - Port: 22
   - Source: `0.0.0.0/0`
4. Save

---

### **Issue 4: Instance Unresponsive**

**Symptoms:**
- Instance shows "Running"
- Status checks failed
- Can't connect

**Fix:**
1. Try rebooting:
   - Select instance → "Reboot instance"
   - Wait 2-3 minutes
   - Try connecting

2. If still fails:
   - Stop instance → Wait → Start instance
   - Wait 2-3 minutes
   - Get new IP
   - Try connecting

---

### **Issue 5: Key File Permissions (Windows)**

**Symptoms:**
- "Permission denied" errors

**Fix:**
```powershell
# In PowerShell, navigate to key file
cd C:\Users\bhusa\Downloads

# Try connecting
ssh -i rabbitpdf-key.pem ubuntu@IP_ADDRESS
```

**If still fails, try:**
```powershell
# Use full path
ssh -i "C:\Users\bhusa\Downloads\rabbitpdf-key.pem" ubuntu@IP_ADDRESS
```

---

## 🎯 **Step 3: Alternative Connection Methods**

### **Method 1: AWS Systems Manager Session Manager**

**If SSH doesn't work, try this:**

1. **AWS Console** → **EC2** → **Instances**
2. **Select instance**
3. **Click "Connect"** (top right)
4. **Choose "Session Manager"** tab
5. **Click "Connect"**

**This opens a browser-based terminal!**

**Note:** Requires SSM agent (usually pre-installed on Ubuntu)

---

### **Method 2: EC2 Instance Connect**

**Another browser-based option:**

1. **AWS Console** → **EC2** → **Instances**
2. **Select instance**
3. **Click "Connect"**
4. **Choose "EC2 Instance Connect"** tab
5. **Click "Connect"**

**Opens terminal in browser!**

---

## 📋 **Step 4: Diagnostic Checklist**

**Before trying to connect, verify:**

- [ ] Instance state = "Running"
- [ ] Status checks = "2/2 checks passed"
- [ ] Security group allows SSH (port 22)
- [ ] Using CURRENT Public IP (not old one)
- [ ] Key file path is correct
- [ ] Key file name matches

---

## 🚀 **Step 5: Step-by-Step Connection**

### **1. Get Current IP:**

**AWS Console:**
- EC2 → Instances → Your instance
- Note "Public IPv4 address"

**Example:** `54.123.45.67` (use YOUR current IP!)

---

### **2. Verify Security Group:**

**Instance → Security tab:**
- Should allow SSH (port 22)
- Source: `0.0.0.0/0` or your IP

---

### **3. Connect:**

```powershell
# Navigate to key file location
cd C:\Users\bhusa\Downloads

# Connect (replace with YOUR current IP)
ssh -i rabbitpdf-key.pem ubuntu@YOUR_CURRENT_IP
```

---

## 🆘 **If Still Can't Connect:**

### **Try These:**

1. **Use AWS Session Manager** (browser-based terminal)
2. **Check your firewall** (Windows Firewall might block)
3. **Try different network** (mobile hotspot)
4. **Verify key file** (make sure it's the right one)

---

## 📊 **What to Check Right Now:**

**Please check AWS Console and tell me:**

1. **Instance State:** Running / Stopped / Stopping?
2. **Status Checks:** 2/2 passed / Failed?
3. **Public IP:** What is the CURRENT IP?
4. **Security Group:** Does it allow SSH (port 22)?
5. **Error Message:** What exact error do you get?

**Based on your answers, I'll give you the exact fix!** 🎯

---

## 💡 **Quick Fix:**

**Most common issue:** Using old IP address

**Solution:**
1. AWS Console → Instance
2. Get CURRENT Public IP
3. Use that IP in SSH command

**Try this:**

```powershell
# Replace with CURRENT IP from AWS Console
ssh -i rabbitpdf-key.pem ubuntu@CURRENT_IP_FROM_CONSOLE
```

---

## 🎯 **Action Plan:**

**Right now:**

1. **Open AWS Console**
2. **EC2 → Instances**
3. **Check:**
   - Instance state?
   - Current Public IP?
   - Security group allows SSH?
4. **Try connecting with CURRENT IP**
5. **If fails, try AWS Session Manager** (browser terminal)

**Let me know what you find!** 🚀

