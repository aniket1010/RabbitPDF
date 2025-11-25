# 🔧 Fix: Worker Unhealthy - Messages Not Processing

## 🚨 **The Problem:**

**Worker Status:** `Up 12 hours (unhealthy)`

**The worker is running but unhealthy, which means it's not processing messages correctly.**

---

## ✅ **Solution: Check Worker Logs**

### **Step 1: Check Worker Logs**

**See what errors are happening:**

```bash
# Check worker logs
docker-compose -f docker-compose.production.yml logs worker --tail 100

# Check for errors
docker-compose -f docker-compose.production.yml logs worker --tail 100 | grep -i "error\|exception\|failed\|unhealthy"
```

---

### **Step 2: Check Worker Health**

**The worker might be failing health checks. Check what's wrong:**

```bash
# Check recent worker logs
docker-compose -f docker-compose.production.yml logs worker --tail 200

# Check for specific errors
docker-compose -f docker-compose.production.yml logs worker --tail 200 | grep -i "error\|exception\|failed"
```

---

### **Step 3: Restart Worker**

**After checking logs, restart worker:**

```bash
# Restart worker
docker-compose -f docker-compose.production.yml restart worker

# Watch logs in real-time
docker-compose -f docker-compose.production.yml logs worker -f
```

---

### **Step 4: Check Dependencies**

**Worker might be failing due to:**
- Database connection issues
- Redis connection issues
- Missing environment variables
- Missing dependencies

**Check:**

```bash
# Check Redis connection
docker-compose -f docker-compose.production.yml exec redis redis-cli ping

# Check database connection (from worker)
docker-compose -f docker-compose.production.yml exec worker env | grep DATABASE_URL

# Check if worker can connect to backend
docker-compose -f docker-compose.production.yml exec worker curl -f http://backend:5000/health || echo "Backend connection failed"
```

---

## 🎯 **Quick Diagnostic:**

```bash
# 1. Check worker logs (most important!)
docker-compose -f docker-compose.production.yml logs worker --tail 200

# 2. Check for errors
docker-compose -f docker-compose.production.yml logs worker --tail 200 | grep -i "error\|exception\|failed"

# 3. Restart worker
docker-compose -f docker-compose.production.yml restart worker

# 4. Watch logs
docker-compose -f docker-compose.production.yml logs worker -f
```

---

## 💡 **Common Issues:**

**1. Database connection error:**
- Check DATABASE_URL in worker environment
- Check if postgres is running

**2. Redis connection error:**
- Check REDIS_URL in worker environment
- Check if redis is running

**3. Missing environment variables:**
- Check worker environment variables
- Compare with backend environment

---

**Check worker logs first to see the exact error!** 🔍



