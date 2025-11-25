# 🔧 Troubleshoot SSH Connection Issues

## 🚨 **Can't Connect to Server?**

**Let's troubleshoot and provide alternatives to apply the fix.**

---

## ✅ **Method 1: Test SSH Connection First**

### **Step 1: Test Basic SSH**

**Open Command Prompt or PowerShell:**

```bash
ssh -i C:\Users\YourUsername\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
```

**If this works, SSH is fine. If not, check:**

---

### **Step 2: Check SSH Key Permissions (Windows)**

**Fix key permissions:**

```powershell
# In PowerShell (as Administrator)
icacls "C:\Users\YourUsername\Downloads\rabbitpdf-key.pem" /inheritance:r
icacls "C:\Users\YourUsername\Downloads\rabbitpdf-key.pem" /grant:r "%username%:R"
```

---

### **Step 3: Check Security Group**

**Make sure port 22 (SSH) is open in AWS Security Group:**
- Source: Your IP or `0.0.0.0/0` (for testing)

---

## ✅ **Method 2: Copy File Directly (Easiest)**

**If SSH works from command line but not Cursor, copy the file:**

### **Step 1: Save Fixed Code Locally**

**1. Create the fixed file locally:**
   - Save the corrected code as: `verify-and-login-route.ts` (in your project)

### **Step 2: Copy to Server**

**From Command Prompt:**

```cmd
scp -i C:\Users\YourUsername\Downloads\rabbitpdf-key.pem frontend\src\app\api\auth\email\verify-and-login\route.ts ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/app/api/auth/email/verify-and-login/route.ts
```

**Or if you saved it with a different name:**

```cmd
scp -i C:\Users\YourUsername\Downloads\rabbitpdf-key.pem verify-and-login-route.ts ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/app/api/auth/email/verify-and-login/route.ts
```

---

## ✅ **Method 3: Edit via SSH Command Line**

**If SSH works from command line:**

### **Step 1: SSH into Server**

```bash
ssh -i C:\Users\YourUsername\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
```

### **Step 2: Edit File**

```bash
cd ~/RabbitPDF
nano frontend/src/app/api/auth/email/verify-and-login/route.ts
```

### **Step 3: Make Changes**

**Use arrow keys to navigate, make the changes, then:**
- `Ctrl + X` to exit
- `Y` to save
- `Enter` to confirm

---

## ✅ **Method 4: Use WinSCP (GUI Tool)**

**If SSH command line doesn't work:**

### **Step 1: Download WinSCP**

**Download from:** https://winscp.net/

### **Step 2: Connect**

**Host:** `51.20.135.170`
**Username:** `ubuntu`
**Private key:** Browse to your `.pem` file

### **Step 3: Navigate and Edit**

**Navigate to:** `/home/ubuntu/RabbitPDF/frontend/src/app/api/auth/email/verify-and-login/`
**Right-click `route.ts` → Edit**
**Make changes → Save**

---

## 🎯 **Quick Alternative: Use SCP**

**If SSH connection works but Cursor remote doesn't:**

**1. Save the fixed code in a file locally**
**2. Copy to server:**

```cmd
scp -i C:\path\to\rabbitpdf-key.pem frontend\src\app\api\auth\email\verify-and-login\route.ts ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/app/api/auth/email/verify-and-login/route.ts
```

**3. SSH and rebuild:**

```cmd
ssh -i C:\path\to\rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## 💡 **What Error Are You Getting?**

**Share the error message and I can help troubleshoot:**

- Connection timeout?
- Permission denied?
- Host key verification failed?
- Key format error?

---

**Try Method 2 (SCP) - it's usually the easiest!** 🚀



