# ✅ Add Missing camelCase Columns to Account Table

## 🚨 **The Problem:**

**Better Auth expects camelCase columns:**
- `accessToken` ❌ (database has `access_token`)
- `refreshToken` ❌ (database has `refresh_token`)
- `accessTokenExpiresAt` ❌ (database has `expires_at` as integer)
- `refreshTokenExpiresAt` ❌ (missing)
- `idToken` ❌ (database has `id_token`)
- `scope` ✅ (already exists)
- `createdAt` ❌ (missing)
- `updatedAt` ❌ (missing)

---

## ✅ **Solution: Add All Missing Columns**

### **Quick Fix - Run All Commands:**

```bash
# 1. Add accessToken
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accessToken" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "accessToken" = "access_token" WHERE "accessToken" IS NULL AND "access_token" IS NOT NULL;'

# 2. Add refreshToken
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "refreshToken" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "refreshToken" = "refresh_token" WHERE "refreshToken" IS NULL AND "refresh_token" IS NOT NULL;'

# 3. Add accessTokenExpiresAt (convert from integer timestamp)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3);'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "accessTokenExpiresAt" = to_timestamp("expires_at") WHERE "accessTokenExpiresAt" IS NULL AND "expires_at" IS NOT NULL;'

# 4. Add refreshTokenExpiresAt
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3);'

# 5. Add idToken
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "idToken" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "idToken" = "id_token" WHERE "idToken" IS NULL AND "id_token" IS NOT NULL;'

# 6. Add createdAt
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'

# 7. Add updatedAt
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'

# 8. Verify all columns
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

# 9. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🔍 **Step-by-Step Explanation:**

### **1. accessToken** (copy from `access_token`)
```bash
ALTER TABLE "Account" ADD COLUMN "accessToken" TEXT;
UPDATE "Account" SET "accessToken" = "access_token" WHERE "accessToken" IS NULL AND "access_token" IS NOT NULL;
```

### **2. refreshToken** (copy from `refresh_token`)
```bash
ALTER TABLE "Account" ADD COLUMN "refreshToken" TEXT;
UPDATE "Account" SET "refreshToken" = "refresh_token" WHERE "refreshToken" IS NULL AND "refresh_token" IS NOT NULL;
```

### **3. accessTokenExpiresAt** (convert from `expires_at` integer)
```bash
ALTER TABLE "Account" ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3);
UPDATE "Account" SET "accessTokenExpiresAt" = to_timestamp("expires_at") WHERE "accessTokenExpiresAt" IS NULL AND "expires_at" IS NOT NULL;
```

### **4. refreshTokenExpiresAt** (new column)
```bash
ALTER TABLE "Account" ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3);
```

### **5. idToken** (copy from `id_token`)
```bash
ALTER TABLE "Account" ADD COLUMN "idToken" TEXT;
UPDATE "Account" SET "idToken" = "id_token" WHERE "idToken" IS NULL AND "id_token" IS NOT NULL;
```

### **6. createdAt** (add with default)
```bash
ALTER TABLE "Account" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

### **7. updatedAt** (add with default)
```bash
ALTER TABLE "Account" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

---

**Run all the commands above to add missing columns!** 🚀



