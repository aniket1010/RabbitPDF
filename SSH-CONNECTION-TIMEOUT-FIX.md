# 🔧 SSH Connection Timeout - How to Fix

## 🚨 **Error: Connection Timed Out**

**This means:** Your server isn't responding to SSH connections.

---

## 🔍 **Possible Causes:**

1. ❌ Instance is stopped
2. ❌ Security group doesn't allow SSH (port 22)
3. ❌ Instance is overloaded/unresponsive
4. ❌ IP address changed
5. ❌ Network/firewall issues

---

## 🎯 **Step-by-Step Fix:**

### **Step 1: Check AWS Console**

**Go to AWS Console:**

1. **EC2 Dashboard** → **Instances**
2. **Find your instance**
3. **Check these:**

#### **A. Instance State:**
- ✅ Should be: **"Running"**
- ❌ If **"Stopped"**: Click "Start instance" → Wait 1-2 minutes

#### **B. Status Checks:**
- ✅ Should be: **"2/2 checks passed"**
- ❌ If **"Failed"**: Instance might need restart

#### **C. Public IP Address:**
- ✅ Check if IP matches: `13.61.180.8`
- ⚠️ **IP changes when instance stops/starts!**

---

### **Step 2: Check Security Group**

**In AWS Console:**

1. **Select your instance**
2. **Click "Security" tab** (bottom panel)
3. **Click Security Group name** (e.g., `sg-xxxxx`)
4. **Check "Inbound rules":**

**Should have:**
```
Type: SSH
Protocol: TCP
Port: 22
Source: 0.0.0.0/0 (or your IP)
```

**If missing:**
- Click "Edit inbound rules"
- Add rule:
  - Type: SSH
  - Port: 22
  - Source: `0.0.0.0/0` (or your IP for security)
- Save

---

### **Step 3: Verify IP Address**

**IP addresses change when instance stops/starts!**

**In AWS Console:**
1. **Select instance**
2. **Check "Public IPv4 address"**
3. **Use that IP** (might be different from `13.61.180.8`)

**Try connecting with the NEW IP:**

```powershell
ssh -i rabbitpdf-key.pem ubuntu@NEW_IP_ADDRESS
```

---

### **Step 4: If Instance is Stopped**

**If instance shows "Stopped":**

1. **Select instance**
2. **Click "Start instance"** (or right-click → Start)
3. **Wait 1-2 minutes** for it to start
4. **Check new Public IP** (it will change!)
5. **Try connecting with new IP**

---

### **Step 5: If Instance is Running but Unresponsive**

**If instance is "Running" but can't connect:**

1. **Try restarting instance:**
   - Select instance
   - Click "Reboot instance" (or right-click → Reboot)
   - Wait 2-3 minutes
   - Try connecting again

2. **Check if IP changed** after reboot

---

## 🔄 **Quick Fix Checklist:**

- [ ] Check AWS Console → Instance state is "Running"
- [ ] Check Security Group → Allows SSH (port 22)
- [ ] Verify Public IP address (might have changed!)
- [ ] If stopped → Start instance → Wait → Get new IP
- [ ] If running but unresponsive → Reboot instance → Wait → Try again

---

## 🎯 **Most Common Issues:**

### **Issue 1: Instance Stopped**

**Fix:**
1. AWS Console → Select instance → Start instance
2. Wait 1-2 minutes
3. Get NEW Public IP
4. Connect with new IP

---

### **Issue 2: Security Group Missing SSH Rule**

**Fix:**
1. AWS Console → Instance → Security tab
2. Click Security Group name
3. Edit inbound rules
4. Add SSH rule (port 22)
5. Save

---

### **Issue 3: IP Address Changed**

**Fix:**
1. AWS Console → Instance
2. Check "Public IPv4 address"
3. Use that IP (not old one)

---

## 🚀 **Action Plan:**

### **Right Now:**

1. **Open AWS Console**
2. **Go to EC2 → Instances**
3. **Check your instance:**
   - State: Running?
   - Status Checks: 2/2 passed?
   - Public IP: What is it?

4. **Tell me what you see:**
   - Instance state?
   - Public IP address?
   - Security group allows SSH?

**Then I'll guide you through the exact fix!** 🎯

---

## 💡 **Pro Tip:**

**To prevent IP changes:**
- Use **Elastic IP** (free if instance is running)
- Or use **domain name** (DNS points to IP)

**But for now, just get the current IP and connect!**

---

## 🆘 **If Still Can't Connect:**

**After checking AWS Console, tell me:**
1. Instance state (Running/Stopped/Stopping)
2. Status checks (2/2 passed / Failed)
3. Public IP address
4. Security group rules (does it allow SSH?)

**I'll help you fix it step by step!** 🚀

