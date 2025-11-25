# 🔧 Run Migrations Correctly - Fix All Issues

## 🚨 **Issues Found:**

1. Prisma schema path wrong in container
2. Database user "postgres" doesn't exist
3. Need to use correct database user

---

## ✅ **Solution: Run SQL Migration with Correct User**

### **Step 1: Find Correct Database User**

**Check your .env file:**

```bash
cd ~/RabbitPDF
cat .env | grep POSTGRES_USER
```

**Or check docker-compose:**

```bash
cat docker-compose.production.yml | grep -A 5 POSTGRES_USER
```

**Common values:** `chatpdf_user` or `postgres`

---

### **Step 2: Find Correct Database Name**

```bash
cat .env | grep POSTGRES_DB
```

**Common values:** `chatpdf_production` or `postgres`

---

### **Step 3: Run SQL Migration with Correct Credentials**

**Once you know the user and database:**

```bash
cd ~/RabbitPDF

# Get values from .env
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2)
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2)

# Run migration SQL
docker-compose -f docker-compose.production.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql
```

---

### **Step 4: Or Connect to Postgres Container First**

**Connect to postgres container and check users:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres -c "\du"
```

**This lists all users. Find the one that exists.**

---

## 🎯 **Quick Fix: Check What Exists**

### **Check Database Users:**

```bash
# Try connecting with default postgres user
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -c "\du"
```

**If that works, you'll see all users.**

---

### **Check Databases:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -c "\l"
```

**Lists all databases.**

---

## 🔧 **Alternative: Create Database User First**

**If user doesn't exist, create it:**

```bash
# Connect as postgres superuser
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres

# Then in psql:
CREATE USER chatpdf_user WITH PASSWORD 'YOUR_PASSWORD';
CREATE DATABASE chatpdf_production OWNER chatpdf_user;
GRANT ALL PRIVILEGES ON DATABASE chatpdf_production TO chatpdf_user;
\q
```

---

## ✅ **Recommended: Run SQL Migration Directly**

**Copy the migration SQL and run it:**

### **Step 1: View Migration SQL**

```bash
cat frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql
```

### **Step 2: Connect to Database**

**Try with different users until one works:**

```bash
# Try 1: Default postgres user
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres

# Try 2: Check .env for actual user
cat .env | grep POSTGRES_USER
# Then use that user
```

### **Step 3: Run SQL**

**Once connected, create database and run migration:**

```sql
-- In psql:
CREATE DATABASE chatpdf_production;
\c chatpdf_production

-- Then paste the migration SQL content
```

---

## 🚀 **Easiest Solution: Copy SQL and Run Manually**

### **Step 1: Get Migration SQL**

```bash
cat frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql
```

### **Step 2: Connect to Postgres**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres
```

**If that doesn't work, check what user exists:**

```bash
docker-compose -f docker-compose.production.yml exec postgres env | grep POSTGRES
```

### **Step 3: Create Database and Run SQL**

**In psql:**

```sql
-- Create database if doesn't exist
CREATE DATABASE chatpdf_production;

-- Connect to database
\c chatpdf_production

-- Then paste the migration SQL (from the file)
```

---

## 💡 **Check Docker Compose Database Setup**

**See how database is configured:**

```bash
cat docker-compose.production.yml | grep -A 10 "postgres:"
```

**This shows the database user and password from environment variables.**

---

## 🎯 **Quick Diagnostic:**

```bash
# 1. Check .env file
cat .env | grep POSTGRES

# 2. Check docker-compose
cat docker-compose.production.yml | grep -A 10 postgres

# 3. Try connecting with postgres user
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -c "\du"

# 4. If that works, create user and database, then run migration
```

---

**Check your .env file for POSTGRES_USER and POSTGRES_DB, then use those values!** 🔍



