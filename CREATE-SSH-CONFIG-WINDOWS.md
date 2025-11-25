# 🔧 Create SSH Config File on Windows

## 🚨 **Problem: Can't Create Config File**

**Windows might be blocking creation of files without extensions. Here are alternative methods:**

---

## ✅ **Method 1: Using Command Prompt (Easiest)**

### **Step 1: Open Command Prompt**

**Press `Win + R`, type `cmd`, press Enter**

---

### **Step 2: Create .ssh Directory**

```cmd
mkdir C:\Users\%USERNAME%\.ssh
```

---

### **Step 3: Create Config File**

```cmd
cd C:\Users\%USERNAME%\.ssh
type nul > config
```

---

### **Step 4: Edit Config File**

```cmd
notepad config
```

**Paste this content:**

```
Host rabbitpdf-server
    HostName 51.20.135.170
    User ubuntu
    IdentityFile C:\Users\%USERNAME%\Downloads\rabbitpdf-key.pem
    Port 22
```

**Replace `%USERNAME%` with your actual Windows username, or use the full path.**

**Save and close Notepad.**

---

## ✅ **Method 2: Using PowerShell**

### **Step 1: Open PowerShell**

**Press `Win + X`, select "Windows PowerShell" or "Terminal"**

---

### **Step 2: Create Config File**

```powershell
# Create .ssh directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh"

# Create config file
New-Item -ItemType File -Force -Path "$env:USERPROFILE\.ssh\config"

# Edit config file
notepad "$env:USERPROFILE\.ssh\config"
```

**Paste the SSH config content and save.**

---

## ✅ **Method 3: Using File Explorer**

### **Step 1: Enable Show File Extensions**

**1. Open File Explorer**
**2. Click "View" tab**
**3. Check "File name extensions"**

---

### **Step 2: Create File**

**1. Navigate to: `C:\Users\YourUsername`**
**2. Create folder `.ssh` (if it doesn't exist)**
**3. Right-click in `.ssh` folder → New → Text Document**
**4. Name it `config` (remove `.txt` extension)**
**5. Windows will warn about changing extension → Click "Yes"**

---

### **Step 3: Edit File**

**Right-click `config` → Open with → Notepad**

**Paste SSH config:**

```
Host rabbitpdf-server
    HostName 51.20.135.170
    User ubuntu
    IdentityFile C:\Users\YourUsername\Downloads\rabbitpdf-key.pem
    Port 22
```

**Save and close.**

---

## ✅ **Method 4: Direct Path in Cursor**

**If you can't create the config file, you can connect directly:**

### **In Cursor:**

**1. Press `Ctrl+Shift+P`**
**2. Type: `Remote-SSH: Connect to Host`**
**3. Select "Add New SSH Host"**
**4. Enter:**

```
ssh -i C:\Users\YourUsername\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
```

**5. Select config file location (choose any location)**
**6. Click "Connect"**

---

## 🎯 **Quick Command (Copy-Paste):**

**Open Command Prompt and run:**

```cmd
mkdir C:\Users\%USERNAME%\.ssh 2>nul
cd C:\Users\%USERNAME%\.ssh
echo Host rabbitpdf-server > config
echo     HostName 51.20.135.170 >> config
echo     User ubuntu >> config
echo     IdentityFile C:\Users\%USERNAME%\Downloads\rabbitpdf-key.pem >> config
echo     Port 22 >> config
notepad config
```

**Then edit the IdentityFile path if your key is in a different location.**

---

## 💡 **Alternative: Use Cursor's Built-in SSH**

**You might not need the config file at all:**

**1. Press `Ctrl+Shift+P`**
**2. Type: `Remote-SSH: Connect to Host`**
**3. Select "Add New SSH Host"**
**4. Enter: `ubuntu@51.20.135.170`**
**5. Select config file location**
**6. When prompted for key, browse to your `.pem` file**

---

**Try Method 1 (Command Prompt) - it's the easiest!** 🚀



