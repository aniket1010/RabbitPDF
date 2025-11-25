# Copy Files from Windows to Server

## Method 1: SCP via PowerShell (Easiest - Built into Windows)

### Step 1: Open PowerShell
- Press `Win + X` and select "Windows PowerShell" or "Terminal"
- Or search for "PowerShell" in Start menu

### Step 2: Navigate to Your Project Folder
```powershell
cd D:\all_my_code\projects\chatPDF
```

### Step 3: Copy Files to Server

**Copy useWebSocket.ts:**
```powershell
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem frontend\src\hooks\useWebSocket.ts ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/hooks/
```

**Copy ChatPanel.tsx:**
```powershell
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem frontend\src\components\ChatPanel.tsx ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/components/
```

**Note:** Replace `C:\Users\bhusa\Downloads\rabbitpdf-key.pem` with the actual path to your key file.

### Step 4: SSH to Server and Rebuild
```powershell
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
```

Then on the server:
```bash
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## Method 2: WinSCP (Visual File Manager - Recommended for Beginners)

### Step 1: Download WinSCP
1. Go to: https://winscp.net/eng/download.php
2. Download and install WinSCP

### Step 2: Connect to Server
1. Open WinSCP
2. Click "New Site"
3. Fill in:
   - **File protocol:** SFTP
   - **Host name:** `51.20.135.170`
   - **Port number:** `22`
   - **User name:** `ubuntu`
   - **Password:** Leave empty
   - **Private key file:** Click "..." and browse to your `rabbitpdf-key.pem` file
4. Click "Save" (optional - saves connection for future)
5. Click "Login"

### Step 3: Copy Files
1. **Left side:** Your local files (Windows)
   - Navigate to: `D:\all_my_code\projects\chatPDF\frontend\src\hooks\`
   - Find `useWebSocket.ts`

2. **Right side:** Server files (Linux)
   - Navigate to: `/home/ubuntu/RabbitPDF/frontend/src/hooks/`

3. **Drag and drop** `useWebSocket.ts` from left to right
   - Or right-click → Copy

4. **Repeat for ChatPanel.tsx:**
   - Left: `D:\all_my_code\projects\chatPDF\frontend\src\components\ChatPanel.tsx`
   - Right: `/home/ubuntu/RabbitPDF/frontend/src/components/`
   - Drag and drop

### Step 4: Rebuild via WinSCP Terminal
1. In WinSCP, click "Terminal" button (or press `Ctrl+P`)
2. Run:
```bash
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## Method 3: VS Code Remote SSH (Best for Editing)

### Step 1: Install VS Code Extension
1. Open VS Code
2. Press `Ctrl+Shift+X` (Extensions)
3. Search: "Remote - SSH"
4. Install "Remote - SSH" by Microsoft

### Step 2: Configure SSH
1. Press `F1` or `Ctrl+Shift+P`
2. Type: "Remote-SSH: Open SSH Configuration File"
3. Select: `C:\Users\bhusa\.ssh\config` (or create new)
4. Add this:
```
Host rabbitpdf-server
    HostName 51.20.135.170
    User ubuntu
    IdentityFile C:\Users\bhusa\Downloads\rabbitpdf-key.pem
```

### Step 3: Connect
1. Press `F1` → "Remote-SSH: Connect to Host"
2. Select: `rabbitpdf-server`
3. Wait for connection (first time may take a minute)

### Step 4: Open Project
1. Click "Open Folder"
2. Navigate to: `/home/ubuntu/RabbitPDF`
3. Click OK

### Step 5: Edit Files
- Files are now editable directly in VS Code!
- Open `frontend/src/hooks/useWebSocket.ts`
- Open `frontend/src/components/ChatPanel.tsx`
- Make your changes
- Save (`Ctrl+S`)

### Step 6: Rebuild
1. Open terminal in VS Code (`Ctrl+` `)
2. Run:
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## Method 4: Copy Entire Folder (If You Want to Copy Everything)

### Using PowerShell:
```powershell
cd D:\all_my_code\projects\chatPDF

# Copy entire frontend folder (takes longer)
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem -r frontend ubuntu@51.20.135.170:~/RabbitPDF/
```

### Using WinSCP:
1. Navigate to `D:\all_my_code\projects\chatPDF\frontend`
2. Drag entire `frontend` folder to server's `/home/ubuntu/RabbitPDF/`
3. Choose "Overwrite" when prompted

---

## Quick Reference: File Paths

### Local (Windows):
- `D:\all_my_code\projects\chatPDF\frontend\src\hooks\useWebSocket.ts`
- `D:\all_my_code\projects\chatPDF\frontend\src\components\ChatPanel.tsx`

### Server (Linux):
- `/home/ubuntu/RabbitPDF/frontend/src/hooks/useWebSocket.ts`
- `/home/ubuntu/RabbitPDF/frontend/src/components/ChatPanel.tsx`

---

## After Copying Files - Rebuild Frontend

**SSH to server:**
```bash
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
```

**On server:**
```bash
cd ~/RabbitPDF

# Verify files were copied
ls -la frontend/src/hooks/useWebSocket.ts
ls -la frontend/src/components/ChatPanel.tsx

# Verify environment variables
grep -E "NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_API_BASE" .env

# Should show:
# NEXT_PUBLIC_APP_URL=https://rabbitpdf.in
# NEXT_PUBLIC_API_BASE=https://rabbitpdf.in/api

# If not correct, update:
sed -i 's|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in|NEXT_PUBLIC_APP_URL=https://rabbitpdf.in|g' .env
sed -i 's|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:5000|NEXT_PUBLIC_API_BASE=https://rabbitpdf.in/api|g' .env

# Rebuild frontend
docker-compose -f docker-compose.production.yml up -d --build frontend

# Watch logs (optional)
docker-compose -f docker-compose.production.yml logs -f frontend
```

---

## Troubleshooting

### SCP Permission Denied
```powershell
# Fix key permissions (if needed)
icacls C:\Users\bhusa\Downloads\rabbitpdf-key.pem /inheritance:r
icacls C:\Users\bhusa\Downloads\rabbitpdf-key.pem /grant:r "%username%:R"
```

### WinSCP Connection Failed
- Make sure port 22 is open
- Check that key file path is correct
- Try converting `.pem` to `.ppk` using PuTTYgen (if WinSCP asks)

### VS Code Remote SSH Issues
- Make sure SSH extension is installed
- Check that key file path in config is correct
- Try connecting via terminal first to verify SSH works

---

## Recommended: Use WinSCP or VS Code Remote SSH

**For beginners:** WinSCP (visual, drag-and-drop)
**For developers:** VS Code Remote SSH (edit directly, best experience)

