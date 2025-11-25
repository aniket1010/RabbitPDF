# 🔧 Fix: User Creation Error - Check User Table Structure

## 🚨 **The Problem:**

**Error:** `ConnectorError: insufficient data left in message` during `prisma.user.create()`

**This means OAuth is working, but there's an issue creating the user in the database.**

**Possible causes:**
- Missing required columns in User table
- Data type mismatches
- Constraint violations

---

## ✅ **Solution: Check User Table Structure**

### **Step 1: Check Current User Table Structure**

**See what columns exist:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'
```

**Compare with Prisma schema - User should have:**
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, nullable)
- `email` (TEXT, UNIQUE, NOT NULL)
- `emailVerified` (BOOLEAN, default false)
- `image` (TEXT, nullable)
- `createdAt` (TIMESTAMP(3), NOT NULL, default CURRENT_TIMESTAMP)
- `updatedAt` (TIMESTAMP(3), NOT NULL, default CURRENT_TIMESTAMP)

---

### **Step 2: Check for Missing Columns**

**If `emailVerified` is missing:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;'
```

**If `createdAt` is missing:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'
```

**If `updatedAt` is missing:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'
```

---

### **Step 3: Verify All Columns**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'
```

---

### **Step 4: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Diagnostic:**

```bash
# 1. Check User table structure
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'

# 2. Check for any constraint issues
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "SELECT conname, contype FROM pg_constraint WHERE conrelid = 'public.User'::regclass;"

# 3. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 4. Test OAuth again
```

---

**Check the User table structure and add any missing columns!** 🔍



