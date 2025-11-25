# ✅ Verify Upgrade & Rebuild Docker

## 🎉 **Great! You're Connected to Upgraded Instance!**

**Now let's verify the upgrade worked and rebuild Docker images!**

---

## 🔍 **Step 1: Verify Instance Upgrade**

**Check resources to confirm upgrade:**

```bash
# Check CPU cores (should show 2)
nproc

# Check memory (should show ~2GB)
free -h

# Should show:
# total: ~2GB (was ~1GB before)
```

**Expected:**
- ✅ **CPU:** 2 cores
- ✅ **Memory:** ~2GB total

---

## 🔍 **Step 2: Verify Files Are Still There**

**Check all your files persisted:**

```bash
# Navigate to project
cd ~/RabbitPDF

# Check files exist
ls -la

# Should see:
# - .env ✅
# - docker-compose.production.yml ✅
# - backend/ ✅
# - frontend/ ✅

# Verify .env file
ls -la .env

# Verify docker-compose file
ls -la docker-compose.production.yml

# Check git status
git status
```

**Everything should be exactly as you left it!** ✅

---

## 🔍 **Step 3: Verify Configuration**

**Quick check that everything is still configured:**

```bash
# Check Docker Compose can read .env
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD | head -1

# Should show actual password, not warnings!

# Check CORS config
cat backend/config/cors.js | grep -A 3 "Production origins"

# Should show your server IP
```

---

## 🚀 **Step 4: Start Docker Build**

**Now with more resources, rebuild:**

```bash
# Make sure you're in project directory
cd ~/RabbitPDF

# Start build (will be much faster now!)
docker-compose -f docker-compose.production.yml build
```

**Expected time:** 10-15 minutes (vs 30+ minutes before)

**With t3.small, build should complete successfully!** ✅

---

## ⏱️ **Step 5: Monitor Build Progress**

**While building, you'll see:**
- Downloading base images
- Installing dependencies (`npm ci` - faster now!)
- Building application
- "Successfully built" messages

**The build should progress smoothly without becoming unresponsive!**

---

## ✅ **Step 6: After Build Completes**

**Once you see "Successfully built" messages:**

```bash
# Verify images were created
docker images

# Should show:
# - backend image
# - frontend image
# - postgres, redis (pulled)

# Start services
docker-compose -f docker-compose.production.yml up -d

# Wait 30 seconds
sleep 30

# Check status
docker-compose -f docker-compose.production.yml ps

# Should show all services as "Up" or "healthy"

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

---

## 📋 **Quick Checklist:**

- [ ] Verify CPU = 2 cores (`nproc`)
- [ ] Verify Memory = ~2GB (`free -h`)
- [ ] Verify files exist (`ls -la ~/RabbitPDF`)
- [ ] Verify .env readable (`docker-compose config`)
- [ ] Start build (`docker-compose build`)
- [ ] Wait for completion (10-15 minutes)
- [ ] Start services (`docker-compose up -d`)
- [ ] Run migrations

---

## 💡 **What's Different Now:**

**With t3.small:**
- ✅ **2x CPU** = Faster builds
- ✅ **2x RAM** = No out-of-memory errors
- ✅ **Stable resources** = Won't become unresponsive
- ✅ **Better network** = Faster downloads

**Build should complete successfully!** 🚀

---

## 🎯 **What to Do Now:**

**Run these commands:**

```bash
# 1. Verify resources
nproc
free -h

# 2. Verify files
cd ~/RabbitPDF
ls -la

# 3. Start build
docker-compose -f docker-compose.production.yml build
```

**Let me know when you start the build!** 🚀


