# ✅ Verify Everything Before Building

## 🎯 **Smart Move!** Let's verify everything is correct before building.

**This will save time and prevent issues!**

---

## 🔍 **Step 1: Check Git Status**

**Verify code is up to date:**

```bash
# Check git status
git status

# Check current branch
git branch

# Check if there are uncommitted changes
git diff
```

**Should show:**
- ✅ On `main` branch (or your branch)
- ✅ No uncommitted changes (or expected changes)
- ✅ Up to date with remote (or pull if needed)

---

## 🔍 **Step 2: Verify Required Files Exist**

**Check all necessary files are present:**

```bash
# Check project structure
ls -la

# Should see:
# - docker-compose.production.yml ✅
# - .env ✅
# - backend/ directory ✅
# - frontend/ directory ✅

# Check backend files
ls -la backend/
ls -la backend/Dockerfile
ls -la backend/config/cors.js

# Check frontend files
ls -la frontend/
ls -la frontend/Dockerfile
ls -la frontend/next.config.production.ts
```

---

## 🔍 **Step 3: Verify .env File**

**Check environment variables are set:**

```bash
# Check file exists and has content
ls -la .env

# Check file size (should be > 1000 bytes)
wc -l .env

# Verify Docker Compose can read it
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD | head -1

# Should show actual password, not warnings!
```

**Check required variables are set:**

```bash
# Check required variables (without showing values)
grep -E "^POSTGRES_PASSWORD=|^REDIS_PASSWORD=|^OPENAI_API_KEY=|^PINECONE_API_KEY=|^BETTER_AUTH_SECRET=|^NEXTAUTH_URL=" .env

# Should show 6 lines (all variables set)
```

---

## 🔍 **Step 4: Verify docker-compose.production.yml**

**Check configuration is correct:**

```bash
# Check file exists
ls -la docker-compose.production.yml

# Verify env_file points to .env (not .env.production)
grep "env_file" docker-compose.production.yml

# Should show: - .env (not .env.production)

# Check Docker Compose syntax
docker-compose -f docker-compose.production.yml config > /dev/null

# If no errors, syntax is correct!
```

---

## 🔍 **Step 5: Verify CORS Configuration**

**Check CORS is updated with server IP:**

```bash
# Check CORS file
cat backend/config/cors.js | grep -A 5 "Production origins"

# Should show your server IP or domain
# NOT: yourdomain.com or localhost
```

**If using IP, should see:**
```javascript
'http://13.61.180.8',
'http://13.61.180.8:3000',
'http://13.61.180.8:5000'
```

---

## 🔍 **Step 6: Verify Dockerfiles**

**Check Dockerfiles exist and are correct:**

```bash
# Check backend Dockerfile
head -20 backend/Dockerfile

# Should show:
# FROM node:18-alpine
# WORKDIR /app
# etc.

# Check frontend Dockerfile
head -20 frontend/Dockerfile

# Should show:
# FROM node:18-alpine AS builder
# etc.
```

---

## 🔍 **Step 7: Check System Resources**

**Verify server has enough resources:**

```bash
# Check memory
free -h

# Should have at least 500MB free

# Check disk space
df -h

# Should have at least 5GB free

# Check CPU
nproc

# Should show: 1 (for t2.micro)
```

---

## 🔍 **Step 8: Verify Docker is Running**

**Check Docker is working:**

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Check Docker daemon is running
docker info | head -5

# Should show Docker info, not errors
```

---

## 📋 **Quick Verification Checklist:**

**Run all these commands:**

```bash
# 1. Git status
git status

# 2. Required files
ls -la docker-compose.production.yml .env backend/Dockerfile frontend/Dockerfile

# 3. .env file
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD | head -1

# 4. docker-compose syntax
docker-compose -f docker-compose.production.yml config > /dev/null && echo "✅ Syntax OK" || echo "❌ Syntax Error"

# 5. CORS config
cat backend/config/cors.js | grep -A 3 "Production origins"

# 6. System resources
free -h && df -h

# 7. Docker
docker --version && docker-compose --version
```

---

## ✅ **What to Verify:**

- [ ] Git is up to date
- [ ] All required files exist
- [ ] `.env` file has all required variables
- [ ] `docker-compose.production.yml` uses `.env` (not `.env.production`)
- [ ] CORS is updated with server IP
- [ ] Dockerfiles exist
- [ ] System has enough resources
- [ ] Docker is running

---

## 🎯 **Run Verification:**

**Run the commands above and tell me:**

1. **Any missing files?**
2. **Any errors in verification?**
3. **CORS shows correct IP?**
4. **.env file readable by Docker Compose?**

**Then we'll proceed with build!** 🚀


