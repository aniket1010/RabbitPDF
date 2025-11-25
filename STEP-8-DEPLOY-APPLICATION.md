# 🚀 Step 8: Deploy Application

Let's build and start all your services! This is the exciting part! 🎉

---

## 🎯 **Goal:** Build Docker images and start all services

**Time:** 15-20 minutes

**You should be:** Connected to server, in project directory, with `.env.production` created

---

## 📋 **What We'll Do:**

1. ✅ Build Docker images
2. ✅ Start all services (PostgreSQL, Redis, Backend, Worker, Frontend)
3. ✅ Run database migrations
4. ✅ Verify everything is running

---

## 📝 **Step-by-Step Instructions:**

### **8.1: Navigate to Project Directory**

**On your server, run:**

```bash
# Make sure you're in project directory
cd ~/RabbitPDF
# or
cd ~/ChatPDF

# Verify you're in the right place
ls docker-compose.production.yml
ls .env.production
```

**✅ Both files should exist!**

---

### **8.2: Build Docker Images**

**This will take 5-10 minutes (first time):**

```bash
docker-compose -f docker-compose.production.yml build
```

**What this does:**
- Builds frontend Docker image
- Builds backend Docker image (used for both API and worker)
- Downloads base images if needed

**⏱️ Wait for it to complete!** You'll see lots of output.

**✅ When you see "Successfully built" messages, you're done!**

---

### **8.3: Start All Services**

**Start all containers:**

```bash
docker-compose -f docker-compose.production.yml up -d
```

**What this does:**
- Starts PostgreSQL database
- Starts Redis
- Starts Backend API
- Starts Worker
- Starts Frontend

**The `-d` flag runs them in the background (detached mode).**

**✅ Services are starting!**

---

### **8.4: Wait for Services to Start**

**Give services 30-60 seconds to start up:**

```bash
# Wait a bit
sleep 30

# Check status
docker-compose -f docker-compose.production.yml ps
```

**You should see all services as "Up" or "healthy":**
- ✅ postgres (healthy)
- ✅ redis (healthy)
- ✅ chatpdf-backend (Up)
- ✅ chatpdf-worker (Up)
- ✅ chatpdf-frontend (Up)

**✅ All services running? Great!**

---

### **8.5: Check Service Logs (Optional)**

**If you want to see what's happening:**

```bash
# See all logs
docker-compose -f docker-compose.production.yml logs

# See specific service logs
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs frontend
docker-compose -f docker-compose.production.yml logs worker
```

**Look for:**
- ✅ No errors
- ✅ "Server running on port 5000" (backend)
- ✅ "Ready" messages (frontend)
- ✅ "Worker started" (worker)

---

### **8.6: Run Database Migrations**

**Set up your database tables:**

```bash
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

**What this does:**
- Creates all database tables
- Sets up relationships
- Applies all migrations

**✅ You should see "Applied migration" messages!**

---

### **8.7: Verify Services Are Running**

**Check all services:**

```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# Check backend health
curl http://localhost:5000/health

# Check frontend (should return HTML)
curl http://localhost:3000/
```

**✅ All services should respond!**

---

## ✅ **Step 8 Complete Checklist:**

- [ ] Built Docker images successfully
- [ ] Started all services with `docker-compose up -d`
- [ ] All services showing as "Up" or "healthy"
- [ ] Ran database migrations
- [ ] Backend health check passes
- [ ] Frontend responds

---

## 🎉 **Success Indicators:**

**You'll know it's working when:**
- ✅ `docker-compose ps` shows all services "Up"
- ✅ `curl http://localhost:5000/health` returns JSON
- ✅ `curl http://localhost:3000/` returns HTML
- ✅ No errors in logs

---

## 🚀 **Next Step:**

Once everything is running, tell me: **"Step 8 complete"** or **"Services are running"**

Then we'll move to **Step 9: Setup Nginx** (reverse proxy) 🌐

---

## 🆘 **Troubleshooting:**

### **If services fail to start:**

```bash
# Check logs for errors
docker-compose -f docker-compose.production.yml logs

# Restart services
docker-compose -f docker-compose.production.yml restart

# Check if ports are in use
sudo netstat -tulpn | grep -E '3000|5000|5432|6379'
```

### **If database connection fails:**

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.production.yml exec postgres pg_isready

# Check environment variables
docker-compose -f docker-compose.production.yml exec backend env | grep DATABASE
```

### **If build fails:**

```bash
# Clean and rebuild
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

---

## 🎯 **Ready to Deploy?**

**Run these commands one by one:**

1. `cd ~/RabbitPDF` (or your project directory)
2. `docker-compose -f docker-compose.production.yml build`
3. `docker-compose -f docker-compose.production.yml up -d`
4. `sleep 30`
5. `docker-compose -f docker-compose.production.yml ps`
6. `docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy`

**Let me know when you're ready to start!** 🚀

