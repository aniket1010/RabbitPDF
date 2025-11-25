# 🔧 Fix: Database User Does Not Exist

## 🚨 **The Problem:**

**Error:** `role "chatpdf_user" does not exist`

**Why:** The database user hasn't been created, or you're using the wrong credentials.

---

## ✅ **Solution 1: Check Actual Database User**

### **Step 1: Check .env File**

**See what database user is configured:**

```bash
cd ~/RabbitPDF
cat .env | grep POSTGRES_USER
```

**Should show:** `POSTGRES_USER=chatpdf_user` (or something else)

---

### **Step 2: Connect with Default Postgres User**

**Try connecting with default postgres user:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres -c "\du"
```

**This lists all database users.**

---

### **Step 3: Check What Database Exists**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres -c "\l"
```

**Lists all databases.**

---

## ✅ **Solution 2: Run Migrations (Creates User Automatically)**

**Prisma migrations will create the user if needed. Try:**

```bash
cd ~/RabbitPDF

# Run migrations - this will create tables and set up everything
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

**If backend container doesn't have Prisma, try frontend:**

```bash
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

---

## ✅ **Solution 3: Check Database Container Logs**

**See if database initialized correctly:**

```bash
docker-compose -f docker-compose.production.yml logs postgres | tail -50
```

**Look for:**
- Database initialization messages
- User creation messages
- Any errors

---

## ✅ **Solution 4: Connect to Database Correctly**

### **Check Docker Compose Environment:**

**See what user is configured in docker-compose:**

```bash
cat docker-compose.production.yml | grep -A 5 POSTGRES_USER
```

**Or check environment variables:**

```bash
docker-compose -f docker-compose.production.yml exec postgres env | grep POSTGRES
```

---

### **Connect with Correct User:**

**If user is different, use that:**

```bash
# Replace USERNAME with actual user from .env
docker-compose -f docker-compose.production.yml exec postgres psql -U USERNAME -d DATABASE_NAME -c "\dt"
```

---

## 🔧 **Quick Diagnostic:**

```bash
# 1. Check .env file
cat .env | grep POSTGRES

# 2. Check docker-compose config
cat docker-compose.production.yml | grep -A 10 postgres

# 3. Check database logs
docker-compose -f docker-compose.production.yml logs postgres | tail -30

# 4. Try connecting with postgres user
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -c "\du"
```

---

## 🚀 **Most Likely Fix:**

**Just run migrations - they'll handle everything:**

```bash
cd ~/RabbitPDF

# Try backend first
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy

# If that doesn't work, try frontend
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

**Migrations will:**
- ✅ Connect to database
- ✅ Create user if needed
- ✅ Create database if needed
- ✅ Create all tables
- ✅ Set up schema

---

## 💡 **Check Database Connection String**

**See what connection string is being used:**

```bash
docker-compose -f docker-compose.production.yml exec backend env | grep DATABASE_URL
```

**Or:**

```bash
docker-compose -f docker-compose.production.yml exec frontend env | grep DATABASE_URL
```

**This shows the actual database connection details.**

---

**Run the migrations command - that's the easiest fix!** 🚀



