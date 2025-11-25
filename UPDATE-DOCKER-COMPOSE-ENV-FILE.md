# 🔧 Update docker-compose.production.yml to Use .env

## 🚨 **Problem:** Docker Compose still looking for `.env.production`

**You renamed the file to `.env`, but `docker-compose.production.yml` still references `.env.production`**

---

## 🔧 **Solution: Update docker-compose.production.yml**

**Change `env_file: - .env.production` to `env_file: - .env`**

---

## 📝 **Step 1: Update the File**

**Open docker-compose file:**

```bash
nano docker-compose.production.yml
```

**Find all instances of:**
```yaml
env_file:
  - .env.production
```

**Change to:**
```yaml
env_file:
  - .env
```

**Or you can remove `env_file` entirely since Docker Compose reads `.env` automatically!**

---

## 🚀 **Quick Fix: Use sed**

**Or use sed to replace automatically:**

```bash
# Replace .env.production with .env
sed -i 's/\.env\.production/.env/g' docker-compose.production.yml

# Verify changes
grep "env_file" docker-compose.production.yml
```

---

## ✅ **Step 2: Verify**

**After updating:**

```bash
# Test Docker Compose can read it
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD

# Should show actual password, not warnings or errors!
```

---

## 🎯 **Option: Remove env_file Entirely**

**Since Docker Compose reads `.env` automatically, you can remove `env_file` directives:**

**But keep them if you want explicit control - both work!**

---

## 📋 **What to Change:**

**Find these sections in docker-compose.production.yml:**

```yaml
backend:
  env_file:
    - .env.production  # ← Change this
```

**Change to:**

```yaml
backend:
  env_file:
    - .env  # ← Or remove this line entirely
```

**Do this for:**
- backend service
- worker service  
- frontend service

---

## 🚀 **Quick Action:**

**Run this:**

```bash
# Replace .env.production with .env
sed -i 's/\.env\.production/.env/g' docker-compose.production.yml

# Verify
grep "env_file" docker-compose.production.yml

# Test
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD
```

---

## ✅ **After Fixing:**

**Once updated:**

```bash
# Should work without errors
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD

# Build
docker-compose -f docker-compose.production.yml build
```

**Let me know when it's fixed!** 🚀

