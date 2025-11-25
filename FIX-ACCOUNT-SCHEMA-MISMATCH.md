# 🔧 Fix: Account Table Schema Mismatch

## 🚨 **The Problem:**

**Your Account table has:**
- `providerAccountId` (Better Auth expects `accountId`)
- `provider` (Better Auth expects `providerId`)

**Better Auth expects:**
- `accountId` ❌ (missing)
- `providerId` ❌ (missing)

**This is a schema mismatch - the table was created with NextAuth.js schema, but Better Auth uses different column names.**

---

## ✅ **Solution: Add Missing Columns**

### **Step 1: Add accountId Column**

**Add `accountId` column (copy from `providerAccountId`):**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accountId" TEXT;'
```

**Copy data from existing column:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "accountId" = "providerAccountId" WHERE "accountId" IS NULL;'
```

---

### **Step 2: Add providerId Column**

**Add `providerId` column (copy from `provider`):**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "providerId" TEXT;'
```

**Copy data from existing column:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "providerId" = "provider" WHERE "providerId" IS NULL;'
```

---

### **Step 3: Make Columns NOT NULL (If Needed)**

**After copying data, make them required:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "accountId" SET NOT NULL;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "providerId" SET NOT NULL;'
```

---

### **Step 4: Verify Columns Added**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'
```

**Should now show `accountId` and `providerId` columns.**

---

### **Step 5: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix Commands:**

```bash
# 1. Add accountId column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accountId" TEXT;'

# 2. Copy data from providerAccountId to accountId
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "accountId" = "providerAccountId" WHERE "accountId" IS NULL;'

# 3. Add providerId column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "providerId" TEXT;'

# 4. Copy data from provider to providerId
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "providerId" = "provider" WHERE "providerId" IS NULL;'

# 5. Verify columns added
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

# 6. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 7. Test OAuth sign-in
```

---

## 💡 **Alternative: Check if Better Auth Can Use Existing Columns**

**If Better Auth supports mapping, you might not need to add columns. But based on the error, it's looking for `accountId` and `providerId`, so we need to add them.**

---

**Add the missing columns and copy data from existing columns!** 🚀



