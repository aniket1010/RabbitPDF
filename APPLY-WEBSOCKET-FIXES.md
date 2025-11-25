# How to Apply WebSocket Fixes to Server

## Files Changed:
1. `frontend/src/hooks/useWebSocket.ts` - Fixed Socket.IO connection URL
2. `frontend/src/components/ChatPanel.tsx` - Fixed PDF processing loader and loadMessages return value

---

## Option 1: VS Code Remote SSH Extension (Easiest - Recommended!)

### Step 1: Install VS Code Remote SSH Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Remote - SSH"
4. Install it

### Step 2: Connect to Server
1. Press `F1` or `Ctrl+Shift+P`
2. Type "Remote-SSH: Connect to Host"
3. Enter: `ubuntu@51.20.135.170`
4. Select SSH config file location
5. Enter password or select your key file

### Step 3: Open Project Folder
1. After connecting, click "Open Folder"
2. Navigate to `/home/ubuntu/RabbitPDF`
3. Edit files directly in VS Code!

### Step 4: Make Changes
- Open `frontend/src/hooks/useWebSocket.ts`
- Open `frontend/src/components/ChatPanel.tsx`
- Make the changes (see detailed changes below)
- Save files (Ctrl+S)

### Step 5: Rebuild
Open integrated terminal in VS Code (Ctrl+`) and run:
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**Advantages:**
- ✅ Edit files directly like local files
- ✅ Syntax highlighting and IntelliSense
- ✅ Easy to navigate and search
- ✅ No file copying needed

---

## Option 2: WinSCP (Windows File Manager)

### Step 1: Download WinSCP
Download from: https://winscp.net/

### Step 2: Connect to Server
1. Open WinSCP
2. New Session:
   - **File protocol:** SFTP
   - **Host name:** 51.20.135.170
   - **User name:** ubuntu
   - **Private key file:** Browse to your `rabbitpdf-key.pem`
3. Click Login

### Step 3: Navigate and Edit
1. Navigate to: `/home/ubuntu/RabbitPDF/frontend/src/hooks/`
2. Right-click `useWebSocket.ts` → Edit
3. Make changes, save
4. Repeat for `ChatPanel.tsx` in `/home/ubuntu/RabbitPDF/frontend/src/components/`

### Step 4: Rebuild via SSH
Use WinSCP's built-in terminal or connect via SSH separately:
```bash
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**Advantages:**
- ✅ Visual file browser
- ✅ Built-in text editor
- ✅ Easy file navigation

---

## Option 3: Docker Exec (Edit Inside Container)

### Step 1: Find Container ID
```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
docker ps | grep frontend
```

### Step 2: Copy Files into Container
```bash
# Copy local file to container
docker cp frontend/src/hooks/useWebSocket.ts <container-id>:/app/src/hooks/useWebSocket.ts
docker cp frontend/src/components/ChatPanel.tsx <container-id>:/app/src/components/ChatPanel.tsx
```

**Note:** This is temporary - files will be lost on container restart. You still need to update source files and rebuild.

---

## Option 4: Create Patch Files and Apply

### Step 1: Create Patch Files Locally
Create `websocket-fix.patch`:
```patch
--- a/frontend/src/hooks/useWebSocket.ts
+++ b/frontend/src/hooks/useWebSocket.ts
@@ -42,7 +42,12 @@ export function useWebSocket(): UseWebSocketReturn {
   useEffect(() => {
     // Initialize WebSocket connection
-    const serverUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
+    // Socket.IO connects directly to the domain (not /api) because nginx routes /socket.io directly
+    const serverUrl = process.env.NEXT_PUBLIC_APP_URL || 
+                      (process.env.NEXT_PUBLIC_API_BASE ? 
+                        process.env.NEXT_PUBLIC_API_BASE.replace('/api', '') : 
+                        'http://localhost:5000');
```

### Step 2: Copy Patch to Server
```bash
scp -i rabbitpdf-key.pem websocket-fix.patch ubuntu@51.20.135.170:~/RabbitPDF/
```

### Step 3: Apply Patch
```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
patch -p1 < websocket-fix.patch
```

---

## Option 5: Use GitHub Gist + Curl

### Step 1: Create Gist with File Contents
1. Go to https://gist.github.com
2. Create a new gist with the fixed file contents
3. Get the raw URL (e.g., `https://gist.githubusercontent.com/username/gist-id/raw/useWebSocket.ts`)

### Step 2: Download on Server
```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF/frontend/src/hooks
curl -o useWebSocket.ts https://gist.githubusercontent.com/username/gist-id/raw/useWebSocket.ts
```

---

## Option 6: Direct SSH with Cat/Here Document

### Step 1: Create File via SSH
```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170 << 'EOF'
cd ~/RabbitPDF/frontend/src/hooks
cat > useWebSocket.ts << 'INNER_EOF'
[paste entire file content here]
INNER_EOF
EOF
```

---

## Option 7: Use FileZilla (FTP Client)

### Step 1: Download FileZilla
Download from: https://filezilla-project.org/

### Step 2: Connect
- **Protocol:** SFTP
- **Host:** sftp://51.20.135.170
- **Username:** ubuntu
- **Key file:** Your `.pem` file

### Step 3: Edit Files
1. Navigate to project folder
2. Right-click file → View/Edit
3. Edit in your preferred editor
4. Save - FileZilla will ask to upload changes

---

## Detailed Changes Needed

### Change 1: `frontend/src/hooks/useWebSocket.ts`

**Find (around line 45):**
```typescript
  useEffect(() => {
    // Initialize WebSocket connection
    const serverUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    console.log('🔌 [WebSocket] Connecting to:', serverUrl);
    console.log('🔌 [WebSocket] Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      API_BASE: process.env.NEXT_PUBLIC_API_BASE
    });
```

**Replace with:**
```typescript
  useEffect(() => {
    // Initialize WebSocket connection
    // Socket.IO connects directly to the domain (not /api) because nginx routes /socket.io directly
    const serverUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      (process.env.NEXT_PUBLIC_API_BASE ? 
                        process.env.NEXT_PUBLIC_API_BASE.replace('/api', '') : 
                        'http://localhost:5000');
    console.log('🔌 [WebSocket] Connecting to:', serverUrl);
    console.log('🔌 [WebSocket] Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      API_BASE: process.env.NEXT_PUBLIC_API_BASE
    });
```

### Change 2: `frontend/src/components/ChatPanel.tsx`

**A. Fix loadMessages return value (around line 334):**
```typescript
// Change this:
if (!conversationId) return

// To this:
if (!conversationId) return []
```

**B. Add return statements (around line 349):**
```typescript
// After setMessages(fetchedMessages), add:
return fetchedMessages

// In the else block, add:
return []

// In the catch block, add:
return []
```

**C. Fix handlePDFProcessingComplete (around line 229):**

**Find:**
```typescript
    const handlePDFProcessingComplete = (data: any) => {
      console.log('✅ [WebSocket] PDF processing complete')
      
      setIsPdfProcessing(false)
      setHasUserSentDuringProcessing(false)
      
      // Refresh messages to get any newly processed pending messages
      loadMessages()

      // Do not trigger server-side processing from client; server will handle it.
    }
```

**Replace with:**
```typescript
    const handlePDFProcessingComplete = (data: any) => {
      console.log('✅ [WebSocket] PDF processing complete')
      
      setIsPdfProcessing(false)
      setHasUserSentDuringProcessing(false)
      
      // Refresh messages to get any newly processed pending messages
      loadMessages().then((loadedMessages) => {
        // Check if we still have pending messages after loading
        const stillPending = loadedMessages?.filter((m: any) => m.status === 'pending').length || 0
        if (stillPending === 0) {
          console.log('✅ [WebSocket] No pending messages after PDF complete, clearing loader')
          setIsAnalyzing(false)
        } else {
          console.log(`🔄 [WebSocket] PDF processing complete, ${stillPending} pending messages will be processed`)
          setIsAnalyzing(true) // Keep the loader going for pending message processing
        }
      }).catch((err) => {
        console.error('❌ [WebSocket] Error loading messages after PDF complete:', err)
        // Still clear the loader on error
        setIsAnalyzing(false)
      })

      // Do not trigger server-side processing from client; server will handle it.
    }
```

---

## After Making Changes - Rebuild Frontend

```bash
cd ~/RabbitPDF

# Verify environment variables
grep -E "NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_API_BASE" .env

# Should show:
# NEXT_PUBLIC_APP_URL=https://rabbitpdf.in
# NEXT_PUBLIC_API_BASE=https://rabbitpdf.in/api

# If not, update:
sed -i 's|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in|NEXT_PUBLIC_APP_URL=https://rabbitpdf.in|g' .env
sed -i 's|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:5000|NEXT_PUBLIC_API_BASE=https://rabbitpdf.in/api|g' .env

# Rebuild frontend
docker-compose -f docker-compose.production.yml up -d --build frontend

# Check logs
docker-compose -f docker-compose.production.yml logs frontend --tail 50 | grep -i "websocket\|socket\|app_url"
```

---

## Verify Changes Worked

### Check WebSocket connection in browser console:
1. Open `https://rabbitpdf.in`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for: `🔌 [WebSocket] Connecting to: https://rabbitpdf.in`
5. Should see: `🔌 [WebSocket] Connected to server successfully!`

### Test functionality:
- ✅ Change username → Should update in real-time
- ✅ Change avatar → Should update in real-time  
- ✅ Rename conversation → Should update in real-time
- ✅ Send message while PDF processing → Loader should clear when processing completes

---

## Troubleshooting

### If WebSocket still shows 403 errors:
```bash
# Check backend CORS config
cat backend/config/cors.js | grep rabbitpdf

# Should show:
# 'https://rabbitpdf.in',
# 'https://www.rabbitpdf.in'

# If not, update it:
nano backend/config/cors.js
# Replace 'yourdomain.com' with 'rabbitpdf.in'

# Rebuild backend
docker-compose -f docker-compose.production.yml up -d --build backend
```

### If frontend shows old URL:
```bash
# Check environment variables are correct
docker-compose -f docker-compose.production.yml exec frontend env | grep NEXT_PUBLIC

# Rebuild frontend (env vars are baked into build)
docker-compose -f docker-compose.production.yml up -d --build frontend
```
