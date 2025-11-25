# 🔍 Check User Table Structure - Fix User Creation Error

## 🚨 **The Problem:**

**Error:** `ConnectorError: insufficient data left in message` during `prisma.user.create()`

**This PostgreSQL error usually means:**
- Missing required columns
- Data type mismatches
- Constraint violations

**Good news:** OAuth is working! The error happens when trying to create the user.

---

## ✅ **Step 1: Check User Table Structure**

**See what columns exist:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'
```

**Share the output - I'll tell you what's missing!**

---

## ✅ **Expected User Table Columns:**

**According to Prisma schema, User should have:**
- `id` (TEXT, PRIMARY KEY, NOT NULL)
- `name` (TEXT, nullable)
- `email` (TEXT, UNIQUE, NOT NULL)
- `emailVerified` (BOOLEAN, NOT NULL, default false)
- `image` (TEXT, nullable)
- `createdAt` (TIMESTAMP(3), NOT NULL, default CURRENT_TIMESTAMP)
- `updatedAt` (TIMESTAMP(3), NOT NULL, default CURRENT_TIMESTAMP)

---

## ✅ **Common Missing Columns:**

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

## 🎯 **Quick Diagnostic:**

```bash
# 1. Check User table structure
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'

# 2. Share the output - I'll tell you what to add!
```

---

**Check the User table structure first!** 🔍



