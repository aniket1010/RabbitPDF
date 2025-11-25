# 🔧 Fix: Account Table Missing accountId Column

## 🚨 **The Problem:**

**Error:** `The column Account.accountId does not exist in the current database.`

**Why:** Database schema doesn't match Prisma schema. The `Account` table is missing the `accountId` column.

---

## ✅ **Solution: Update Database Schema**

### **Step 1: Check Current Account Table Structure**

**See what columns exist:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d Account"
```

**This shows the current table structure.**

---

### **Step 2: Add Missing Column**

**Add the `accountId` column:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "ALTER TABLE \"Account\" ADD COLUMN IF NOT EXISTS \"accountId\" TEXT;"
```

---

### **Step 3: Check What Other Columns Are Missing**

**Compare with Prisma schema. Account table should have:**

- `id` ✅
- `userId` ✅
- `accountId` ❌ (missing - need to add)
- `providerId` ✅
- `accessToken` ✅
- `refreshToken` ✅
- `accessTokenExpiresAt` ✅
- `refreshTokenExpiresAt` ✅
- `scope` ✅
- `idToken` ✅
- `password` ✅
- `createdAt` ✅
- `updatedAt` ✅

---

### **Step 4: Add Missing Column**

**Run this SQL:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production << EOF
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accountId" TEXT;
EOF
```

**Or connect and run:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production
```

**Then in psql:**

```sql
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accountId" TEXT;
\q
```

---

### **Step 5: Verify Column Added**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d Account"
```

**Should now show `accountId` column.**

---

### **Step 6: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix:**

```bash
# Add missing column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "ALTER TABLE \"Account\" ADD COLUMN IF NOT EXISTS \"accountId\" TEXT;"

# Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d Account"

# Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# Test OAuth again
```

---

## 🔍 **Check Current Schema:**

**First, see what the Account table looks like:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d Account"
```

**Share the output - I'll tell you what columns to add!**

---

**Add the missing `accountId` column and restart frontend!** 🚀



