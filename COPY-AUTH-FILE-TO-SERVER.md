# Copy Auth File Directly to Server

## ✅ Safe Approach - Copy Only This File

**Instead of git pull, copy just the auth.js file directly.**

---

## 📋 Step 1: Copy File Content

**The file is already updated locally. Here's what changed:**

**Changed lines 50-53:**
- **From:** `findUnique({ where: { token: sessionId } })`
- **To:** `findFirst({ where: { token: { startsWith: sessionId } } })`

**Changed lines 147-150 (WebSocket auth):**
- **From:** `findUnique({ where: { token: sessionId } })`
- **To:** `findFirst({ where: { token: { startsWith: sessionId } } })`

---

## 🚀 Step 2: Copy File to Server

**Option A: Use SCP (from Windows)**

**In PowerShell:**
```powershell
cd D:\all_my_code\projects\chatPDF
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem backend\utils\auth.js ubuntu@51.20.135.170:~/RabbitPDF/backend/utils/auth.js
```

**Option B: Edit Directly on Server**

**SSH to server:**
```bash
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
nano backend/utils/auth.js
```

**Then make these 2 changes:**

### Change 1: Around line 50

**Find:**
```javascript
    // Try to find the session using the session ID
    const userSession = await prisma.session.findUnique({
      where: { token: sessionId },
      include: { user: true }
    });
```

**Replace with:**
```javascript
    // Better-auth stores full signed token in DB, so use startsWith to match
    const userSession = await prisma.session.findFirst({
      where: { 
        token: { startsWith: sessionId }
      },
      include: { user: true }
    });
```

### Change 2: Around line 147 (WebSocket auth)

**Find:**
```javascript
    // Verify the session token against the database
    const session = await prisma.session.findUnique({
      where: { 
        token: sessionId 
      },
```

**Replace with:**
```javascript
    // Better-auth stores full signed token in DB, so use startsWith to match
    const session = await prisma.session.findFirst({
      where: { 
        token: { startsWith: sessionId }
      },
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## ✅ Step 3: Restart Backend

**After copying/editing:**
```bash
docker-compose -f docker-compose.production.yml restart backend
```

**Wait 10 seconds, verify it's running:**
```bash
docker-compose -f docker-compose.production.yml ps backend
```

---

## 🧪 Step 4: Test

**In browser:**
1. Clear cookies
2. Sign in
3. Try to update username or load conversations

**Check logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 30 | grep "Session lookup result"
```

**Should show:** `Session lookup result: FOUND` ✅

---

## 📋 Quick Copy-Paste Commands

**If using SCP:**
```powershell
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem backend\utils\auth.js ubuntu@51.20.135.170:~/RabbitPDF/backend/utils/auth.js
```

**Then on server:**
```bash
docker-compose -f docker-compose.production.yml restart backend
```

**Done!**

