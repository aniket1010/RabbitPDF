# 🔍 Check Docker Status & Rebuild

## ✅ **Good News:** You're connected!

**Docker is running, but no images found.** This means the build didn't complete.

---

## 🔍 **Step 1: Check Current Status**

**Run these commands to see what's there:**

```bash
# Check containers
docker ps -a

# Check Docker Compose status
docker-compose -f docker-compose.production.yml ps

# Check if project files exist
ls -la

# Check if .env.production exists
ls -la .env.production
```

---

## 📊 **Step 2: Check What Happened**

**Let's see if there are any error logs:**

```bash
# Check Docker logs (if containers exist)
docker-compose -f docker-compose.production.yml logs --tail=50

# Check system resources
free -h
df -h
```

---

## 🚀 **Step 3: Rebuild Docker Images**

**Since no images exist, let's rebuild:**

### **Option A: Full Rebuild (Recommended)**

```bash
# Make sure you're in project directory
cd ~/RabbitPDF
# or
cd ~/ChatPDF

# Clean up any old containers
docker-compose -f docker-compose.production.yml down

# Rebuild images
docker-compose -f docker-compose.production.yml build
```

**This will take 10-20 minutes on t2.micro.**

---

### **Option B: Build with Verbose Output**

**To see what's happening:**

```bash
# Build with progress output
docker-compose -f docker-compose.production.yml build --progress=plain
```

**This shows detailed output so you can see progress.**

---

### **Option C: Build One Service at a Time**

**If full build is too slow:**

```bash
# Build backend first
docker-compose -f docker-compose.production.yml build backend

# Then build frontend
docker-compose -f docker-compose.production.yml build frontend
```

---

## ⏱️ **Step 4: Monitor Build Progress**

**While building, you can monitor:**

**In another terminal (if you want):**
```bash
# Watch Docker processes
watch -n 5 'docker ps -a'

# Or check system resources
watch -n 5 'free -h && df -h'
```

**Or just wait - it will show progress in the build output.**

---

## ✅ **Step 5: After Build Completes**

**Once build finishes:**

```bash
# Verify images were created
docker images

# Should show:
# - backend image
# - frontend image
# - postgres, redis (pulled from registry)

# Start services
docker-compose -f docker-compose.production.yml up -d

# Wait 30 seconds
sleep 30

# Check status
docker-compose -f docker-compose.production.yml ps

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

---

## 🎯 **Quick Action Plan:**

**Right now, run:**

```bash
# 1. Check current status
docker ps -a
docker-compose -f docker-compose.production.yml ps

# 2. Verify project files
ls -la
ls -la .env.production

# 3. Start rebuild
docker-compose -f docker-compose.production.yml build
```

**Then wait for build to complete (10-20 minutes).**

---

## 💡 **Tips:**

1. **Build will take time** - be patient (10-20 min on t2.micro)
2. **Watch for errors** - if build fails, check error messages
3. **Don't disconnect** - keep SSH session alive during build
4. **Use `screen` or `tmux`** if you want to detach (optional)

---

## 🆘 **If Build Fails:**

**Check error messages and:**

```bash
# Clean and retry
docker-compose -f docker-compose.production.yml down
docker system prune -f  # Removes unused data
docker-compose -f docker-compose.production.yml build
```

---

## 📋 **What to Do Now:**

1. **Run diagnostic commands** (check status)
2. **Start rebuild** (`docker-compose build`)
3. **Wait for completion** (10-20 minutes)
4. **Start services** (`docker-compose up -d`)

**Let me know when you start the build!** 🚀

