# Fix: Support __Secure- Cookie Prefix

## 🎯 Problem Found

**Better-auth is setting TWO cookies:**
1. `better-auth.session_token` (old)
2. `__Secure-better-auth.session_token` (new, secure)

**Backend only checks:** `better-auth.session_token`
**Backend doesn't check:** `__Secure-better-auth.session_token` ❌

**The newer cookie has session ID:** `76BpooYLRETSbOG2Hdu4eKog8z0rUpPa`

---

## ✅ Fix Applied Locally

**Updated backend to check for both cookie names.**

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

## 🔍 Step 2: Check If Session Exists

**The newer cookie has session ID:** `76BpooYLRETSbOG2Hdu4eKog8z0rUpPa`

**Check if this session exists:**

```bash
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT token, \"userId\", \"expiresAt\" FROM \"Session\" WHERE token LIKE '76BpooYLRETSbOG2Hdu4eKog8z0rUpPa%';"
```

**Share the output** - Does this session exist?

---

## ✅ Step 3: Test

**After restarting backend:**

1. **Don't clear cookies** (keep the current ones)
2. **Try to update username or load conversations**
3. **Check backend logs:**

```bash
docker-compose -f docker-compose.production.yml logs backend --tail 30 | grep "Session token received\|Session lookup result"
```

**Should show:**
- `Session token received: EXISTS` ✅
- `Session lookup result: FOUND` ✅

---

## 🎯 What Changed

**Added support for `__Secure-better-auth.session_token` cookie in 3 places:**

1. **verifyAuth function** - Checks for `__Secure-` prefix
2. **verifyWebSocketAuth function** - Checks for `__Secure-` prefix  
3. **optionalAuth function** - Checks for `__Secure-` prefix

**Now backend will check:**
- `better-auth.session_token`
- `better-auth.session-token`
- `__Secure-better-auth.session_token` ✅ NEW
- `__Secure-better-auth.session-token` ✅ NEW

---

## 📋 Quick Copy Command

```powershell
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem backend\utils\auth.js ubuntu@51.20.135.170:~/RabbitPDF/backend/utils/auth.js
```

**Then restart backend and test!**

