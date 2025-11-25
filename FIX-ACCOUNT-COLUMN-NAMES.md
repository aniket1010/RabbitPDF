# 🔧 Fix: Account Table Column Name Mismatches

## 🚨 **The Problem:**

**Better Auth expects camelCase columns:**
- `accessToken` ❌ (database has `access_token`)
- `refreshToken` ❌ (database has `refresh_token`)
- `accessTokenExpiresAt` ❌ (database has `expires_at`)
- `refreshTokenExpiresAt` ❌ (missing)
- `idToken` ❌ (database has `id_token`)

**Database has snake_case columns:**
- `access_token` ✅
- `refresh_token` ✅
- `expires_at` ✅
- `id_token` ✅

**Better Auth Prisma schema expects:**
- `accessToken` (TEXT?)
- `refreshToken` (TEXT?)
- `accessTokenExpiresAt` (TIMESTAMP?)
- `refreshTokenExpiresAt` (TIMESTAMP?)
- `idToken` (TEXT?)

---

## ✅ **Solution: Add Missing camelCase Columns**

### **Step 1: Add accessToken Column**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accessToken" TEXT;'
```

**Copy data from existing column:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "accessToken" = "access_token" WHERE "accessToken" IS NULL AND "access_token" IS NOT NULL;'
```

---

### **Step 2: Add refreshToken Column**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "refreshToken" TEXT;'
```

**Copy data from existing column:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "refreshToken" = "refresh_token" WHERE "refreshToken" IS NULL AND "refresh_token" IS NOT NULL;'
```

---

### **Step 3: Add accessTokenExpiresAt Column**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3);'
```

**Convert from integer timestamp (if expires_at is integer):**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "accessTokenExpiresAt" = to_timestamp("expires_at") WHERE "accessTokenExpiresAt" IS NULL AND "expires_at" IS NOT NULL;'
```

---

### **Step 4: Add refreshTokenExpiresAt Column**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3);'
```

**(No existing data to copy - this is new)**

---

### **Step 5: Add idToken Column**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "idToken" TEXT;'
```

**Copy data from existing column:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "idToken" = "id_token" WHERE "idToken" IS NULL AND "id_token" IS NOT NULL;'
```

---

### **Step 6: Verify All Columns Added**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'
```

---

### **Step 7: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix Commands:**

```bash
# 1. Add accessToken
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accessToken" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "accessToken" = "access_token" WHERE "accessToken" IS NULL AND "access_token" IS NOT NULL;'

# 2. Add refreshToken
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "refreshToken" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "refreshToken" = "refresh_token" WHERE "refreshToken" IS NULL AND "refresh_token" IS NOT NULL;'

# 3. Add accessTokenExpiresAt
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3);'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "accessTokenExpiresAt" = to_timestamp("expires_at") WHERE "accessTokenExpiresAt" IS NULL AND "expires_at" IS NOT NULL;'

# 4. Add refreshTokenExpiresAt
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3);'

# 5. Add idToken
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "idToken" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Account" SET "idToken" = "id_token" WHERE "idToken" IS NULL AND "id_token" IS NOT NULL;'

# 6. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

# 7. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend
```

---

**Add all missing camelCase columns!** 🚀



