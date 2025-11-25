# 🔧 Fix: Wrong IP Address in OAuth Request

## 🚨 **Problem:**

Console shows: `http://13.61.180.8/api/auth/sign-in/social`

**This is wrong!** It should be using your domain `rabbitpdf.in` or your server IP `51.20.135.170`.

**This means:** `NEXT_PUBLIC_APP_URL` environment variable is not set correctly or not loaded.

---

## ✅ **Solution: Fix Environment Variable**

### **Step 1: Check .env File on Server**

**SSH to your server:**

```powershell
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
```

**Check .env file:**

```bash
cd ~/RabbitPDF
cat .env | grep NEXT_PUBLIC_APP_URL
```

**Should show:**
```
NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000
```

**If it shows something else or is missing, fix it!**

---

### **Step 2: Update .env File**

**Edit .env file:**

```bash
nano .env
```

**Find and update:**

```env
# Make sure this is set correctly
NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000
NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:3000/api
NEXTAUTH_URL=http://rabbitpdf.in:3000
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### **Step 3: Rebuild Frontend (Important!)**

**Environment variables are baked into the build, so you need to rebuild:**

```bash
# Stop frontend
docker-compose -f docker-compose.production.yml stop frontend

# Rebuild frontend with new environment variables
docker-compose -f docker-compose.production.yml build --no-cache frontend

# Start frontend
docker-compose -f docker-compose.production.yml up -d frontend
```

**Or rebuild and restart:**

```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

### **Step 4: Verify Environment Variables**

**Check frontend logs:**

```bash
docker-compose -f docker-compose.production.yml logs frontend | grep "Auth Config"
```

**Should show:**
```
🔍 [Auth Config] Environment variables check: {
  NEXT_PUBLIC_APP_URL: 'http://rabbitpdf.in:3000',
  APP_URL: 'http://rabbitpdf.in:3000',
  ...
}
```

**If it still shows wrong URL, rebuild again!**

---

### **Step 5: Clear Browser Cache**

**After rebuilding:**

1. **Hard refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Or clear cache:** Browser settings → Clear browsing data
3. **Or use incognito/private window**

---

## 🔍 **Why This Happened:**

**Next.js environment variables starting with `NEXT_PUBLIC_` are baked into the JavaScript bundle at build time.**

**This means:**
- ✅ Changing `.env` file → Need to rebuild
- ✅ Restarting container → Not enough (variables already baked in)
- ✅ Must rebuild → To get new environment variables

---

## ✅ **Quick Fix Steps:**

```bash
# 1. SSH to server
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170

# 2. Update .env
cd ~/RabbitPDF
nano .env
# Set: NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000
# Save: Ctrl+X, Y, Enter

# 3. Rebuild frontend
docker-compose -f docker-compose.production.yml up -d --build frontend

# 4. Check logs
docker-compose -f docker-compose.production.yml logs frontend | grep "Auth Config"

# 5. Clear browser cache and test
```

---

## 🎯 **Expected Result:**

**After rebuild, console should show:**
```
http://rabbitpdf.in:3000/api/auth/sign-in/social
```

**Not:**
```
http://13.61.180.8/api/auth/sign-in/social
```

---

## 💡 **About the Referrer Policy Warning:**

**The referrer policy warning is just informational** - it's a browser security feature. The real issue is the wrong IP address.

**After fixing the environment variable, the warning might still appear, but OAuth should work correctly.**

---

## 🚨 **If Still Not Working:**

### **Check Docker Compose Build Args:**

**Make sure docker-compose.production.yml passes the environment variable:**

```yaml
frontend:
  build:
    args:
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
```

**If missing, add it and rebuild.**

---

## ✅ **Complete Fix:**

1. ✅ Update `.env` file with correct domain
2. ✅ Rebuild frontend container (not just restart!)
3. ✅ Clear browser cache
4. ✅ Test OAuth sign-in
5. ✅ Check console - should show correct domain

---

**Rebuild the frontend container - that's the key!** 🚀



