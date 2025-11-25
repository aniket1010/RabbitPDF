# 💻 How to Open a New Terminal on Your Server

## 🎯 **Goal:** Open another SSH connection to monitor the build

**Keep your current terminal running the build!** Just open a new one.

---

## 🪟 **Method 1: Open New PowerShell Window (Windows)**

### **Step 1: Open New PowerShell**

**On your Windows machine:**

1. **Press `Windows Key`**
2. **Type:** `PowerShell`
3. **Click:** "Windows PowerShell" or "PowerShell"
4. **New window opens!**

**Or:**
- Right-click on taskbar → "Windows PowerShell"
- Or press `Windows + X` → "Windows PowerShell"

---

### **Step 2: SSH to Your Server Again**

**In the NEW PowerShell window, run:**

```powershell
# Navigate to where your .pem file is
cd C:\path\to\your\key\file

# SSH to your server (same command as before)
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
```

**Example:**
```powershell
cd C:\Users\YourName\Downloads
ssh -i my-key.pem ubuntu@54.123.45.67
```

---

### **Step 3: Now You Have Two Terminals!**

**Terminal 1 (Original):**
- ✅ Running Docker build
- ✅ Don't close this!

**Terminal 2 (New):**
- ✅ Can run monitoring commands
- ✅ Won't interrupt the build

---

## 🔄 **Method 2: Use Screen/Tmux (Advanced)**

**If you want to run commands in the same session:**

### **Using Screen:**

```bash
# In your current terminal (where build is running)
# Press: Ctrl+A, then D (detach)

# Now you can run other commands
# To reattach later: screen -r
```

**But Method 1 is easier!** ✅

---

## 📋 **Quick Steps Summary:**

### **Windows (PowerShell):**

1. **Open new PowerShell:**
   - Press `Windows Key`
   - Type `PowerShell`
   - Click it

2. **SSH to server:**
   ```powershell
   cd C:\path\to\key
   ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
   ```

3. **Monitor build:**
   ```bash
   # Check processes
   ps aux | grep npm
   
   # Check resources
   top
   free -h
   ```

---

## 🎯 **What to Do in New Terminal:**

**Once connected, run these to check if build is working:**

```bash
# Check if npm is running
ps aux | grep npm

# Check CPU usage
top
# Press 'q' to exit

# Check memory
free -h

# Check disk
df -h

# Check Docker processes
docker ps -a
```

---

## ✅ **Important:**

- ✅ **Keep Terminal 1 open** (where build is running)
- ✅ **Use Terminal 2** for monitoring
- ✅ **Don't close Terminal 1** until build completes!

---

## 🆘 **If You Don't Remember Your SSH Command:**

**Check your original terminal or use:**

```powershell
# Find your .pem file
Get-ChildItem -Path C:\Users\YourName\Downloads -Filter *.pem

# Then SSH with:
ssh -i path\to\your-key.pem ubuntu@YOUR_SERVER_IP
```

**Or check AWS Console:**
- EC2 → Instances → Your instance → Connect
- Copy the SSH command shown there

---

## 🚀 **Quick Reference:**

**Terminal 1 (Original):**
- Running: `docker-compose build`
- Action: Leave it running!

**Terminal 2 (New):**
- Use for: Monitoring commands
- Action: Check if build is working

---

**Ready? Open a new PowerShell window and SSH in!** 🎯

