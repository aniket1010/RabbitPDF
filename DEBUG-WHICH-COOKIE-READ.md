# Debug Which Cookie is Being Read

## 🎯 Problem: Backend Reading Old Cookie

**Backend is reading:** `FVlbndWbMEGrQK97NnX37j3MdGXPb9Eo` (old cookie)
**Should be reading:** `FolbqW8gTkDaonRynopLYqgRLLZgLu3S` (new cookie)

**Browser has BOTH cookies, and backend is picking the wrong one!**

---

## ✅ Fix Applied: Added Debug Logging

**Added logging to show which cookie is being used.**

---

## 🚀 Step 1: Copy Updated File

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

## 🔍 Step 2: Delete Old Cookie

**The browser has BOTH cookies. Delete the old one:**

**In browser (F12 → Application → Cookies):**

1. Find `better-auth.session_token` (the old one)
2. **Delete it** (right-click → Delete)
3. Keep `__Secure-better-auth.session_token` (the new one)

**Or clear ALL cookies and sign in fresh** (recommended).

---

## 🔍 Step 3: Test and Check Logs

**After restarting backend and deleting old cookie:**

1. **Make an API call** (update username or load conversations)
2. **Check backend logs:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 30 | grep "Using cookie\|Extracted session ID\|Session lookup result"
```

**Should show:**
- `Using cookie: __Secure-better-auth.session_token` ✅
- `Extracted session ID: FolbqW8gTkDaonRynopLYqgRLLZgLu3S` ✅
- `Session lookup result: FOUND` ✅

---

## 🎯 Root Cause

**Browser has BOTH cookies:**
- `better-auth.session_token` = `FVlbndWbMEGrQK97NnX37j3MdGXPb9Eo` (old, expired)
- `__Secure-better-auth.session_token` = `FolbqW8gTkDaonRynopLYqgRLLZgLu3S` (new, valid)

**Even though we prioritize `__Secure-`, cookie-parser might be parsing them in a different order.**

**Solution:** Delete the old cookie or clear all cookies and sign in fresh.

---

## 📋 Quick Fix

**Do this:**

1. **Copy updated file** (with debug logging)
2. **Restart backend**
3. **Delete old cookie** (`better-auth.session_token`) from browser
4. **Test** - Should work now!

