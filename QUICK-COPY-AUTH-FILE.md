# Quick Copy Auth File to Server

## 🚀 Easiest Method: Use SCP

**From Windows PowerShell:**

```powershell
cd D:\all_my_code\projects\chatPDF
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem backend\utils\auth.js ubuntu@51.20.135.170:~/RabbitPDF/backend/utils/auth.js
```

**Then SSH and restart:**

```powershell
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml restart backend
```

**Done!**

---

## 📋 What Changed (Just 2 Lines)

**Only 2 changes were made:**

1. **Line 50-56:** Changed `findUnique` to `findFirst` with `startsWith`
2. **Line 150-158:** Same change for WebSocket auth

**Everything else stays the same - safe to copy!**

---

## ✅ Verify After Copying

**Check the file was copied correctly:**

```bash
cat backend/utils/auth.js | grep -A 3 "findFirst"
```

**Should show:**
```javascript
const userSession = await prisma.session.findFirst({
  where: { 
    token: { startsWith: sessionId }
```

**If you see that, it's correct!**

---

## 🧪 Test

**After restarting backend:**
1. Clear browser cookies
2. Sign in
3. Try to update username

**Should work!**

