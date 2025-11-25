# 🔧 Fix: Environment Variables Not Loading

## 🚨 **Problem:** Docker Compose can't find `.env.production` file

**All variables showing as "not set" means the file isn't being read.**

---

## 🔍 **Step 1: Check if .env.production Exists**

**Run:**

```bash
# Check if file exists
ls -la .env.production

# Check current directory
pwd

# List all files
ls -la
```

**Should show:** `.env.production` file

---

## 🔧 **Step 2: Verify File Location**

**The `.env.production` file MUST be in the same directory as `docker-compose.production.yml`**

**Check:**

```bash
# Make sure you're in project root
cd ~/RabbitPDF
# or
cd ~/ChatPDF

# Verify both files are here
ls -la docker-compose.production.yml
ls -la .env.production

# Both should exist!
```

---

## 🔍 **Step 3: Check File Permissions**

**Make sure file is readable:**

```bash
# Check permissions
ls -la .env.production

# Should show: -rw-r--r-- or similar
# If not readable, fix:
chmod 644 .env.production
```

---

## 🔍 **Step 4: Verify File Contents**

**Check if file has content:**

```bash
# View first few lines (don't show full content - contains secrets!)
head -5 .env.production

# Should show something like:
# POSTGRES_USER=chatpdf_user
# POSTGRES_PASSWORD=...
# etc.
```

**If file is empty or missing:** You need to create it (Step 6).

---

## 🔧 **Step 5: Check File Format**

**Make sure file format is correct:**

```bash
# Check for common issues
cat .env.production | head -10

# Should NOT have:
# - Spaces around = sign (WRONG: KEY = value)
# - Quotes around values (optional but should be consistent)
# - Comments starting with # (OK)
```

**Correct format:**
```env
POSTGRES_USER=chatpdf_user
POSTGRES_PASSWORD=your_password
```

**Wrong format:**
```env
POSTGRES_USER = chatpdf_user  # Space around =
POSTGRES_PASSWORD="your_password"  # Quotes (OK but not needed)
```

---

## 🚀 **Step 6: If File Doesn't Exist - Create It**

**If `.env.production` doesn't exist:**

```bash
# Create file
nano .env.production
```

**Then paste your environment variables** (from Step 6 we did earlier).

**Or if you have it elsewhere:**

```bash
# Copy from backup location
cp /path/to/backup/.env.production .

# Or recreate it
nano .env.production
```

---

## 🔍 **Step 7: Verify Docker Compose Can Read It**

**Test:**

```bash
# Check if Docker Compose can read variables
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD

# Should show the password (not blank)
```

---

## 🎯 **Quick Fix Steps:**

**Run these commands:**

```bash
# 1. Navigate to project root
cd ~/RabbitPDF
# or
cd ~/ChatPDF

# 2. Check if file exists
ls -la .env.production

# 3. If exists, check permissions
chmod 644 .env.production

# 4. Verify file has content (first few lines)
head -5 .env.production

# 5. Test Docker Compose can read it
docker-compose -f docker-compose.production.yml config | head -20
```

---

## 🆘 **If File Doesn't Exist:**

**You need to recreate it:**

1. **Open nano:**
   ```bash
   nano .env.production
   ```

2. **Paste your environment variables** (from Step 6)

3. **Save:** `Ctrl+X`, `Y`, `Enter`

4. **Verify:**
   ```bash
   ls -la .env.production
   head -5 .env.production
   ```

---

## ✅ **After Fixing:**

**Once `.env.production` is correct:**

```bash
# Test Docker Compose can read it
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD

# Should show actual password, not blank

# Then rebuild
docker-compose -f docker-compose.production.yml build
```

---

## 📋 **Common Issues:**

### **Issue 1: File in Wrong Location**

**Fix:** Move to project root (same directory as docker-compose.production.yml)

---

### **Issue 2: File Permissions**

**Fix:** `chmod 644 .env.production`

---

### **Issue 3: File Format**

**Fix:** No spaces around `=`, one variable per line

---

### **Issue 4: File Doesn't Exist**

**Fix:** Create it with `nano .env.production`

---

## 🎯 **What to Do Now:**

1. **Check if `.env.production` exists:**
   ```bash
   ls -la .env.production
   ```

2. **If exists:** Check permissions and format

3. **If doesn't exist:** Create it (we did this in Step 6)

4. **Test:** `docker-compose config` should show variables

**Let me know what you find!** 🚀

