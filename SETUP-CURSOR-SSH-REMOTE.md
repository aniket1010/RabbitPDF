# 🔧 Setup Cursor SSH Remote Development

## ✅ **Yes! You Can Edit Server Code Directly in Cursor**

**Cursor supports SSH remote development, so you can edit files on the server directly from Cursor IDE.**

---

## 🎯 **Step 1: Install Remote SSH Extension**

**1. Open Cursor**
**2. Go to Extensions (Ctrl+Shift+X)**
**3. Search for "Remote - SSH"**
**4. Install the extension** (by Microsoft or Cursor team)

---

## 🎯 **Step 2: Configure SSH Connection**

### **Option A: Using SSH Config File (Recommended)**

**1. On Windows, create/edit SSH config file:**

**Path:** `C:\Users\YourUsername\.ssh\config`

**2. Add your server configuration:**

```
Host rabbitpdf-server
    HostName 51.20.135.170
    User ubuntu
    IdentityFile C:\Users\YourUsername\Downloads\rabbitpdf-key.pem
    Port 22
```

**Replace:**
- `YourUsername` with your Windows username
- Path to your `.pem` file if different

---

### **Option B: Using Cursor Command Palette**

**1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)**
**2. Type: `Remote-SSH: Connect to Host`**
**3. Select "Configure SSH Hosts"**
**4. Choose config file location**
**5. Add the same configuration as above**

---

## 🎯 **Step 3: Connect to Server**

**1. Press `Ctrl+Shift+P`**
**2. Type: `Remote-SSH: Connect to Host`**
**3. Select `rabbitpdf-server` (or your configured host)**
**4. Cursor will open a new window connected to the server**

---

## 🎯 **Step 4: Open Project Folder**

**1. Once connected, click "Open Folder"**
**2. Navigate to: `/home/ubuntu/RabbitPDF`**
**3. Click "OK"**

**Now you can edit files directly!**

---

## 🎯 **Step 5: Edit Files and Rebuild**

**1. Edit files directly in Cursor**
**2. Save files (Ctrl+S)**
**3. Open integrated terminal in Cursor (Ctrl+`)**
**4. Run rebuild command:**

```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## 💡 **Benefits:**

✅ **Edit files directly** - No need to copy files back and forth
✅ **Full IDE features** - Syntax highlighting, IntelliSense, etc.
✅ **Integrated terminal** - Run commands directly in Cursor
✅ **Git integration** - Commit and push directly from Cursor
✅ **Debugging** - Can debug code running on server

---

## 🔧 **Troubleshooting:**

### **SSH Key Permissions (Windows)**

**If connection fails, fix key permissions:**

```powershell
# In PowerShell (as Administrator)
icacls "C:\Users\YourUsername\Downloads\rabbitpdf-key.pem" /inheritance:r
icacls "C:\Users\YourUsername\Downloads\rabbitpdf-key.pem" /grant:r "%username%:R"
```

---

### **Alternative: Use WSL**

**If SSH doesn't work on Windows, use WSL:**

**1. Install WSL (Windows Subsystem for Linux)**
**2. Copy key to WSL:**
```bash
cp /mnt/c/Users/YourUsername/Downloads/rabbitpdf-key.pem ~/.ssh/
chmod 600 ~/.ssh/rabbitpdf-key.pem
```

**3. Configure SSH in WSL:**
```bash
nano ~/.ssh/config
```

**Add:**
```
Host rabbitpdf-server
    HostName 51.20.135.170
    User ubuntu
    IdentityFile ~/.ssh/rabbitpdf-key.pem
```

**4. Connect from WSL terminal in Cursor**

---

## 🎯 **Quick Setup:**

**1. Install Remote SSH extension**
**2. Add SSH config:**
```
Host rabbitpdf-server
    HostName 51.20.135.170
    User ubuntu
    IdentityFile C:\Users\YourUsername\Downloads\rabbitpdf-key.pem
```
**3. Connect: `Ctrl+Shift+P` → `Remote-SSH: Connect to Host` → `rabbitpdf-server`**
**4. Open folder: `/home/ubuntu/RabbitPDF`**
**5. Edit files directly!**

---

**Setup SSH remote development and edit server code directly in Cursor!** 🚀



