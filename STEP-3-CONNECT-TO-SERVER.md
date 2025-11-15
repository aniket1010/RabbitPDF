# 🔌 Step 3: Connect to Your Server

Let's connect to your EC2 instance via SSH!

---

## 🎯 **Goal:** Connect to your server so we can install Docker and deploy your app

**Time:** 5-10 minutes

**What you need:**
- ✅ EC2 Public IP address (e.g., `54.123.45.67`)
- ✅ `.pem` key file (downloaded when creating EC2)

---

## 📝 **Step-by-Step Instructions:**

### **3.1: Find Your Key File**

**Where is your `.pem` file?**
- Usually in: `Downloads` folder
- File name: `chatpdf-key.pem` (or whatever you named it)

**✅ Do you have the .pem file? Let me know where it is!**

---

### **3.2: Open PowerShell (Windows)**

**On Windows:**

1. Press `Windows Key + X`
2. Click **"Windows PowerShell"** or **"Terminal"**
3. You should see a command prompt

**OR:**

1. Press `Windows Key + R`
2. Type: `powershell`
3. Press Enter

**✅ Is PowerShell open? Let me know!**

---

### **3.3: Navigate to Key File Location**

**In PowerShell, type:**

```powershell
# Navigate to Downloads folder (adjust path if different)
cd C:\Users\YourUsername\Downloads

# Or if you saved it elsewhere, navigate there
# cd C:\path\to\your\key\file
```

**Replace `YourUsername` with your actual Windows username!**

**To check your username:**
```powershell
echo $env:USERNAME
```

**✅ Are you in the folder with your .pem file? Let me know!**

---

### **3.4: Set Key File Permissions (Windows)**

**In PowerShell, type:**

```powershell
# Replace 'chatpdf-key.pem' with your actual key file name
icacls chatpdf-key.pem /inheritance:r
icacls chatpdf-key.pem /grant:r "%username%:R"
```

**This makes the key file secure (only you can read it).**

**✅ Permissions set? Let me know!**

---

### **3.5: Connect to Server**

**In PowerShell, type:**

```powershell
# Replace with YOUR values:
# - chatpdf-key.pem = your key file name
# - YOUR_SERVER_IP = your EC2 Public IP address

ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP
```

**Example:**
```powershell
ssh -i chatpdf-key.pem ubuntu@54.123.45.67
```

**First time connecting:**
- You'll see: `The authenticity of host '...' can't be established.`
- Type: **`yes`** and press Enter

**✅ Are you connected? You should see: `ubuntu@ip-xxx-xxx-xxx-xxx:~$`**

---

## 🎉 **Success!**

If you see something like:
```
ubuntu@ip-172-31-45-123:~$
```

**You're connected!** 🎊

---

## 🆘 **Troubleshooting:**

### **"Permission denied" error:**
- Make sure you set permissions correctly (Step 3.4)
- Try: `icacls chatpdf-key.pem /inheritance:r /grant:r "%username%:F"`

### **"Could not resolve hostname" error:**
- Check your Public IP address is correct
- Make sure instance is running in AWS Console

### **"Connection timed out" error:**
- Check security group allows SSH from your IP
- In AWS Console → EC2 → Security Groups → Edit inbound rules
- Add SSH rule with source: **My IP**

### **Can't find .pem file:**
- Check Downloads folder
- Search for `.pem` files: `Get-ChildItem -Path C:\Users\$env:USERNAME\Downloads -Filter *.pem`

---

## ✅ **Step 3 Complete Checklist:**

- [ ] Found .pem key file
- [ ] Opened PowerShell
- [ ] Navigated to key file folder
- [ ] Set key file permissions
- [ ] Connected via SSH
- [ ] See `ubuntu@ip-xxx:~$` prompt

---

## 🚀 **Next Step:**

Once you're connected, tell me: **"I'm connected"** or **"Step 3 complete"**

Then we'll move to **Step 4: Install Docker** 🐳

---

## 💡 **Quick Reference:**

**Your connection command:**
```powershell
ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP
```

**To disconnect later:**
```bash
exit
```

**Ready to connect? Follow the steps above!** 🔌

