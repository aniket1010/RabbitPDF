# 🔧 Complete Troubleshooting: 500 Error on OAuth Sign-In

## 🔍 **Step 1: Check Current Error**

**Check the latest error in logs:**

```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 50 | grep -A 10 "error\|Error\|ERROR"
```

**Or see all recent logs:**

```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 100
```

**Look for the exact error message.**

---

## ✅ **Step 2: Verify Migrations Ran**

### **Check if migrations were applied:**

```bash
# Try to connect to database and check tables
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres -c "\l"
```

**See what databases exist.**

---

### **Check if Verification table exists:**

**If you can connect, check tables:**

```bash
# Connect to your database (adjust user/database name)
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d chatpdf_production -c "\dt"
```

**Or check via Prisma:**

```bash
docker-compose -f docker-compose.production.yml exec backend npx prisma db pull
```

---

## 🚀 **Step 3: Run Migrations Properly**

### **Option A: Run from Backend Container**

```bash
cd ~/RabbitPDF

# Check if Prisma is available
docker-compose -f docker-compose.production.yml exec backend which npx

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.production.yml exec backend npx prisma generate
```

---

### **Option B: Run from Frontend Container**

```bash
cd ~/RabbitPDF

# Run migrations
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.production.yml exec frontend npx prisma generate
```

---

### **Option C: Run from Host (If containers don't have Prisma)**

**If containers don't have Prisma CLI, run from host:**

```bash
cd ~/RabbitPDF

# Install Prisma CLI (if not installed)
npm install -g prisma

# Or use npx
cd frontend
npx prisma migrate deploy

# Generate client
npx prisma generate
```

---

## 🔧 **Step 4: Check Database Connection**

### **Verify DATABASE_URL is correct:**

```bash
docker-compose -f docker-compose.production.yml exec frontend env | grep DATABASE_URL
```

**Should show:** `DATABASE_URL=postgresql://...`

---

### **Test database connection:**

```bash
docker-compose -f docker-compose.production.yml exec frontend npx prisma db pull
```

**If this works, database is connected!**

---

## 🔄 **Step 5: Restart Services**

**After running migrations:**

```bash
# Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# Restart backend (if needed)
docker-compose -f docker-compose.production.yml restart backend

# Check status
docker-compose -f docker-compose.production.yml ps
```

---

## 🎯 **Step 6: Check Prisma Schema**

**Make sure Prisma schema exists:**

```bash
ls -la frontend/prisma/schema.prisma
```

**Check if it has Verification model:**

```bash
grep -i "model Verification" frontend/prisma/schema.prisma
```

**Should show the Verification model definition.**

---

## 📋 **Complete Fix Checklist:**

- [ ] Check current error in logs
- [ ] Verify Prisma schema exists
- [ ] Check DATABASE_URL is set correctly
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Verify tables created (check database)
- [ ] Restart frontend container
- [ ] Test OAuth sign-in again
- [ ] Check logs for new errors

---

## 🚨 **Common Issues:**

### **Issue 1: Migrations Not Running**

**If migrations fail:**

```bash
# Check Prisma schema location
ls -la frontend/prisma/

# Check if migrations folder exists
ls -la frontend/prisma/migrations/

# Try running from frontend directory
cd frontend
npx prisma migrate deploy
```

---

### **Issue 2: Database Not Connected**

**If database connection fails:**

```bash
# Check database container is running
docker-compose -f docker-compose.production.yml ps postgres

# Check database logs
docker-compose -f docker-compose.production.yml logs postgres --tail 50

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

---

### **Issue 3: Prisma Client Not Generated**

**If Prisma client missing:**

```bash
# Generate client
docker-compose -f docker-compose.production.yml exec frontend npx prisma generate

# Or rebuild frontend
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## 🎯 **Quick Diagnostic Commands:**

```bash
# 1. Check latest error
docker-compose -f docker-compose.production.yml logs frontend --tail 50

# 2. Check if migrations ran
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate status

# 3. Check database connection
docker-compose -f docker-compose.production.yml exec frontend npx prisma db pull

# 4. Check environment variables
docker-compose -f docker-compose.production.yml exec frontend env | grep DATABASE_URL

# 5. Check container status
docker-compose -f docker-compose.production.yml ps
```

---

## 💡 **Most Likely Fix:**

**Run these commands in order:**

```bash
cd ~/RabbitPDF

# 1. Run migrations
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy

# 2. Generate Prisma client
docker-compose -f docker-compose.production.yml exec frontend npx prisma generate

# 3. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 4. Check logs
docker-compose -f docker-compose.production.yml logs frontend --tail 20

# 5. Test OAuth
```

---

**Run the diagnostic commands and share:**
1. **Latest error from logs**
2. **Result of migrations command**
3. **Database connection test result**

**This will help pinpoint the exact issue!** 🔍



