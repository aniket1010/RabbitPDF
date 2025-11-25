# 🔧 Fix: 500 Internal Server Error on OAuth Sign-In

## ✅ **Good News:**

CORS is fixed! Headers show:
- ✅ `access-control-allow-origin: http://rabbitpdf.in:3000` (correct!)
- ✅ `access-control-allow-credentials: true` (correct!)

**But now there's a 500 server error.**

---

## 🔍 **Step 1: Check Server Logs**

**SSH to your server and check frontend logs:**

```bash
docker-compose -f docker-compose.production.yml logs frontend | tail -50
```

**Look for error messages around the time of the request.**

---

## 🔍 **Step 2: Check for Specific Errors**

**Check for OAuth-related errors:**

```bash
docker-compose -f docker-compose.production.yml logs frontend | grep -i "error\|exception\|failed\|oauth\|auth"
```

**Or see recent errors:**

```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 100 | grep -A 5 -B 5 "error"
```

---

## 🚨 **Common Causes:**

### **1. Missing OAuth Credentials**

**Check if OAuth credentials are set:**

```bash
docker-compose -f docker-compose.production.yml logs frontend | grep "Auth Config"
```

**Should show:**
```
GOOGLE_CLIENT_ID: 'SET (...)'
GITHUB_CLIENT_ID: 'SET'
```

**If shows "NOT SET":**
- Check `.env` file has OAuth credentials
- Rebuild frontend

---

### **2. Database Connection Issue**

**Check if database is connected:**

```bash
docker-compose -f docker-compose.production.yml logs backend | grep -i "database\|prisma\|error"
```

---

### **3. Environment Variable Missing**

**Check if `BETTER_AUTH_SECRET` is set:**

```bash
docker-compose -f docker-compose.production.yml logs frontend | grep "BETTER_AUTH_SECRET"
```

**Should show:** `BETTER_AUTH_SECRET: 'SET'`

---

### **4. OAuth Redirect URI Mismatch**

**Check if redirect URI in OAuth app matches:**

- Google: Should be `http://rabbitpdf.in:3000/api/auth/callback/google`
- GitHub: Should be `http://rabbitpdf.in:3000/api/auth/callback/github`

---

## 🔧 **Step 3: Check Full Error Stack**

**See the complete error:**

```bash
# See last 100 lines of frontend logs
docker-compose -f docker-compose.production.yml logs frontend --tail 100

# Or follow logs in real-time
docker-compose -f docker-compose.production.yml logs -f frontend
```

**Then try OAuth sign-in again and watch for errors.**

---

## 🎯 **Quick Diagnostic:**

**Run these commands:**

```bash
# 1. Check OAuth credentials
docker-compose -f docker-compose.production.yml logs frontend | grep "Auth Config"

# 2. Check recent errors
docker-compose -f docker-compose.production.yml logs frontend --tail 50

# 3. Check backend errors
docker-compose -f docker-compose.production.yml logs backend --tail 50

# 4. Check container status
docker-compose -f docker-compose.production.yml ps
```

---

## 💡 **Most Likely Issues:**

1. **OAuth credentials not set** → Check `.env` file
2. **Database not connected** → Check backend logs
3. **Missing environment variable** → Check `BETTER_AUTH_SECRET`
4. **OAuth app misconfigured** → Check redirect URIs

---

## ✅ **Quick Fix Steps:**

1. **Check logs:** `docker-compose logs frontend --tail 100`
2. **Look for error messages**
3. **Share the error** → I'll help fix it!

---

**Check the logs and share the error message you see!** 🔍



