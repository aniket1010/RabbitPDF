# 🔧 Fix SSH Connection Issues

## 🚨 **Can't Connect via SSH?**

**Let's troubleshoot and find alternative ways to apply the fix.**

---

## ✅ **Step 1: Check What Error You're Getting**

**Run this command and share the error:**

```cmd
ssh -i C:\Users\YourUsername\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
```

**Common errors:**
- `Connection timed out` → Security group issue
- `Permission denied` → Key permissions or wrong key
- `Host key verification failed` → SSH config issue
- `Could not resolve hostname` → Network/DNS issue

---

## ✅ **Step 2: Fix Common Issues**

### **Issue 1: Connection Timeout**

**Problem:** Security group doesn't allow SSH (port 22)

**Fix:**
1. Go to AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Add inbound rule:
   - Type: SSH
   - Port: 22
   - Source: Your IP or `0.0.0.0/0` (for testing)

---

### **Issue 2: Permission Denied**

**Fix key permissions:**

```powershell
# In PowerShell (as Administrator)
icacls "C:\Users\YourUsername\Downloads\rabbitpdf-key.pem" /inheritance:r
icacls "C:\Users\YourUsername\Downloads\rabbitpdf-key.pem" /grant:r "%username%:R"
```

---

### **Issue 3: Wrong Key Format**

**Convert .pem to .ppk (if using PuTTY):**

**Or use OpenSSH format directly.**

---

## ✅ **Alternative Method: Use AWS Systems Manager (SSM)**

**If SSH doesn't work, use AWS Session Manager:**

### **Step 1: Enable SSM on Instance**

**1. Go to AWS Console → EC2 → Instances**
**2. Select your instance**
**3. Actions → Security → Modify IAM role**
**4. Attach IAM role with `AmazonSSMManagedInstanceCore` policy**

### **Step 2: Connect via AWS Console**

**1. Select instance**
**2. Click "Connect"**
**3. Choose "Session Manager"**
**4. Click "Connect"**

**Now you have a terminal!**

---

## ✅ **Alternative Method: Use AWS EC2 Instance Connect**

**1. Go to AWS Console → EC2 → Instances**
**2. Select your instance**
**3. Click "Connect"**
**4. Choose "EC2 Instance Connect"**
**5. Click "Connect"**

**Browser-based terminal!**

---

## ✅ **Alternative Method: Use WinSCP (GUI)**

**If SSH works but you prefer GUI:**

**1. Download WinSCP:** https://winscp.net/
**2. Connect:**
   - Host: `51.20.135.170`
   - Username: `ubuntu`
   - Private key: Browse to `.pem` file
**3. Navigate to file and edit**

---

## ✅ **Alternative Method: Use AWS CloudShell**

**1. Go to AWS Console**
**2. Click CloudShell icon (top right)**
**3. Run:**

```bash
# Copy file content (you'll paste the fixed code)
nano /tmp/route.ts
# Paste code, save

# Copy to instance (if you can access it)
# Or use other method
```

---

## 🎯 **Quick Test: Check if Server is Running**

**Test if server is accessible:**

```cmd
ping 51.20.135.170
```

**If ping works but SSH doesn't, it's a security group issue.**

---

## 💡 **Best Alternative: Use AWS Console Terminal**

**If SSH isn't working, use AWS Session Manager:**

**1. Go to EC2 → Instances → Select instance**
**2. Click "Connect" → "Session Manager"**
**3. If not available, enable SSM (see above)**
**4. Edit file directly in browser terminal**

---

## 🔧 **What Error Do You See?**

**Share the exact error message:**

```cmd
ssh -i C:\path\to\key.pem ubuntu@51.20.135.170
```

**Common errors:**
- `ssh: connect to host 51.20.135.170 port 22: Connection timed out`
- `Permission denied (publickey)`
- `Host key verification failed`

**Share the error and I'll provide specific fix!**

---

**Try AWS Session Manager - it's the easiest if SSH isn't working!** 🚀



