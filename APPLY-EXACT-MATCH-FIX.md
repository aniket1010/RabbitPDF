# Apply Exact Match Fix - Session Lookup

## ✅ Fix Applied Locally

**Changed session lookup to try exact match first, then startsWith.**

**Why:** Database stores exactly 32-character tokens (session IDs), so exact match should work!

---

## 🚀 Step 1: Copy Updated File to Server

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

---

## ✅ Step 2: Test

**After restarting backend:**

1. **Don't clear cookies** (keep current ones)
2. **Try to update username or load conversations**
3. **Check backend logs:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 30 | grep "Session lookup result\|Extracted session ID"
```

**Should show:**
- `Extracted session ID: 76BpooYLRETSbOG2Hdu4eKog8z0rUpPa`
- `Session lookup result: FOUND` ✅

---

## 🎯 What Changed

**Before:** Only used `findFirst` with `startsWith`
**After:** Try `findUnique` with exact match first, then fallback to `startsWith`

**This should work because database tokens are exactly 32 characters (session IDs)!**

---

## 📋 Quick Copy Command

```powershell
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem backend\utils\auth.js ubuntu@51.20.135.170:~/RabbitPDF/backend/utils/auth.js
```

**Then restart backend and test!**

