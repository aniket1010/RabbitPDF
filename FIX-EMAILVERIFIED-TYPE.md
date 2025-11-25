# 🔧 Fix: emailVerified Column Type Mismatch

## 🚨 **The Problem:**

**Current:** `emailVerified` is `TIMESTAMP(3)` ❌
**Expected:** `emailVerified` should be `BOOLEAN` ✅

**This type mismatch is causing the "insufficient data left in message" error.**

---

## ✅ **Solution: Change Column Type**

### **Option 1: Drop and Recreate (If No Existing Data)**

**Since you have no existing users (UPDATE 0 earlier), we can safely drop and recreate:**

```bash
# 1. Drop the old column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" DROP COLUMN "emailVerified";'

# 2. Add the correct column type
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;'

# 3. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'

# 4. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend
```

---

### **Option 2: Convert Existing Data (If You Have Users)**

**If you have existing users, convert the timestamp to boolean:**

```bash
# 1. Add new column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" ADD COLUMN "emailVerified_new" BOOLEAN NOT NULL DEFAULT false;'

# 2. Convert: if timestamp exists, set to true
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "User" SET "emailVerified_new" = true WHERE "emailVerified" IS NOT NULL;'

# 3. Drop old column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" DROP COLUMN "emailVerified";'

# 4. Rename new column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" RENAME COLUMN "emailVerified_new" TO "emailVerified";'

# 5. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'

# 6. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix (Option 1 - Recommended):**

```bash
# 1. Drop old column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" DROP COLUMN "emailVerified";'

# 2. Add correct column type
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;'

# 3. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'

# 4. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 5. Test OAuth sign-in
```

---

**Fix the emailVerified column type!** 🚀



