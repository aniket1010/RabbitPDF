# 🔧 Fix: Messages Stuck and Not Processing

## 🚨 **The Problem:**

**Messages are stuck and not being processed.**

**Possible causes:**
- Worker not running
- Queue not processing
- Redis connection issues
- Message processing errors

---

## ✅ **Solution: Check Worker and Queue**

### **Step 1: Check Worker Status**

```bash
# Check if worker is running
docker-compose -f docker-compose.production.yml ps worker

# Check worker logs
docker-compose -f docker-compose.production.yml logs worker --tail 100

# Check for errors
docker-compose -f docker-compose.production.yml logs worker --tail 100 | grep -i "error\|exception\|failed"
```

---

### **Step 2: Check Redis Connection**

```bash
# Check if Redis is running
docker-compose -f docker-compose.production.yml ps redis

# Check Redis logs
docker-compose -f docker-compose.production.yml logs redis --tail 50

# Test Redis connection
docker-compose -f docker-compose.production.yml exec redis redis-cli ping
```

---

### **Step 3: Check Backend Logs**

```bash
# Check backend logs for message processing
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep -i "message\|queue\|process"
```

---

### **Step 4: Restart Worker**

**If worker is not running or stuck:**

```bash
# Restart worker
docker-compose -f docker-compose.production.yml restart worker

# Check logs after restart
docker-compose -f docker-compose.production.yml logs worker --tail 50 -f
```

---

### **Step 5: Check Queue Status**

**Check if messages are in the queue:**

```bash
# Check Redis for queue data
docker-compose -f docker-compose.production.yml exec redis redis-cli KEYS "*"
```

---

## 🎯 **Quick Diagnostic:**

```bash
# 1. Check worker status
docker-compose -f docker-compose.production.yml ps worker

# 2. Check worker logs
docker-compose -f docker-compose.production.yml logs worker --tail 100

# 3. Check Redis
docker-compose -f docker-compose.production.yml ps redis
docker-compose -f docker-compose.production.yml exec redis redis-cli ping

# 4. Check backend logs
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep -i "message"

# 5. Restart worker if needed
docker-compose -f docker-compose.production.yml restart worker
```

---

## 💡 **Common Issues:**

**1. Worker not running:**
```bash
docker-compose -f docker-compose.production.yml up -d worker
```

**2. Redis connection issues:**
```bash
docker-compose -f docker-compose.production.yml restart redis worker
```

**3. Queue stuck:**
```bash
# Restart worker and backend
docker-compose -f docker-compose.production.yml restart worker backend
```

---

**Check worker logs first to see what's happening!** 🔍



