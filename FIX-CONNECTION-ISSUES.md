# 🔧 Fix Connection Issues - Step by Step

## 🚨 **What Happened:**

1. ✅ You were connected (`ubuntu@ip-172-31-30-193`)
2. ❌ Connection reset (`client_loop: send disconnect`)
3. ❌ Can't reconnect with IP `13.61.180.8` (timeout)

**This means:** IP address changed OR instance stopped!

---

## 🎯 **Step 1: Check AWS Console RIGHT NOW**

### **Go to AWS Console:**

1. **EC2 Dashboard** → **Instances**
2. **Find your instance**
3. **Check these:**

---

### **A. Instance State:**

**What does it show?**
- ✅ **"Running"** → Good, continue
- ❌ **"Stopped"** → Start it, wait 2-3 minutes
- ⚠️ **"Stopping"** → Wait, then start
- ⚠️ **"Pending"** → Wait 1-2 minutes

---

### **B. Public IP Address:**

**CRITICAL:** IP changes every restart!

**Check:**
- What is the **CURRENT** "Public IPv4 address"?
- Is it still `13.61.180.8` or different?

**The IP you see NOW is the one to use!**

---

### **C. Security Group:**

**Instance → Security tab → Security Group → Inbound rules:**

**Must have:**
```
Type: SSH
Protocol: TCP  
Port: 22
Source: 0.0.0.0/0
```

**If missing:** Add it!

---

## 🔧 **Step 2: Use CURRENT IP Address**

**After checking AWS Console:**

**If IP changed (most likely):**

```powershell
# Use the CURRENT IP from AWS Console (not 13.61.180.8)
ssh -i rabbitpdf-key.pem ubuntu@NEW_IP_FROM_CONSOLE
```

**Example:**
- AWS Console shows: `54.123.45.67`
- Use: `ssh -i rabbitpdf-key.pem ubuntu@54.123.45.67`

---

## 🚀 **Step 3: Alternative - Use AWS Session Manager**

**If SSH still doesn't work, use browser terminal:**

### **Method 1: AWS Systems Manager Session Manager**

1. **AWS Console** → **EC2** → **Instances**
2. **Select your instance**
3. **Click "Connect"** (top right button)
4. **Choose "Session Manager" tab**
5. **Click "Connect"**

**Opens terminal in browser - no SSH needed!** ✅

---

### **Method 2: EC2 Instance Connect**

1. **AWS Console** → **EC2** → **Instances**
2. **Select instance**
3. **Click "Connect"**
4. **Choose "EC2 Instance Connect" tab**
5. **Click "Connect"**

**Also opens browser terminal!** ✅

---

## 📋 **Step 4: What to Do Right Now**

### **Option A: Check IP and Reconnect**

1. **AWS Console** → **EC2** → **Instances**
2. **Get CURRENT Public IP**
3. **Try connecting:**

```powershell
ssh -i rabbitpdf-key.pem ubuntu@CURRENT_IP_FROM_CONSOLE
```

---

### **Option B: Use Browser Terminal (Easier!)**

1. **AWS Console** → **EC2** → **Instances**
2. **Select instance** → **Click "Connect"**
3. **Choose "Session Manager"**
4. **Click "Connect"**

**No SSH needed!** ✅

---

## 🔍 **Step 5: If Instance is Stopped**

**If AWS Console shows "Stopped":**

1. **Select instance**
2. **Click "Start instance"**
3. **Wait 2-3 minutes**
4. **Get NEW Public IP** (will be different!)
5. **Connect with new IP**

---

## 🎯 **Quick Action Plan:**

**Right now, do this:**

1. **Open AWS Console** → **EC2** → **Instances**
2. **Check:**
   - Instance state: Running / Stopped?
   - **CURRENT Public IP:** What is it? (probably NOT 13.61.180.8)
   - Security group: Allows SSH?

3. **Try ONE of these:**

   **Option 1:** Connect with CURRENT IP:
   ```powershell
   ssh -i rabbitpdf-key.pem ubuntu@CURRENT_IP_FROM_CONSOLE
   ```

   **Option 2:** Use AWS Session Manager (browser terminal):
   - Click "Connect" → "Session Manager" → "Connect"

---

## 💡 **Why This Happens:**

**Connection reset** usually means:
- Instance restarted
- IP address changed
- Network issue

**Solution:** Use CURRENT IP from AWS Console!

---

## 🆘 **If Still Can't Connect:**

**Try these:**

1. **Use AWS Session Manager** (browser terminal - easiest!)
2. **Check your firewall** (Windows Firewall)
3. **Try different network** (mobile hotspot)
4. **Verify key file** (make sure it's correct)

---

## 📊 **Tell Me:**

**After checking AWS Console, tell me:**

1. **Instance state:** Running / Stopped?
2. **Current Public IP:** What is it? (probably different from 13.61.180.8)
3. **Did you try AWS Session Manager?** (browser terminal)

**Then I'll guide you through the exact fix!** 🚀

---

## ✅ **Most Likely Fix:**

**You're using old IP `13.61.180.8`**

**Solution:**
1. AWS Console → Instance
2. Get CURRENT Public IP
3. Use that IP instead

**Or use AWS Session Manager (easier - no IP needed!)** 🎯

