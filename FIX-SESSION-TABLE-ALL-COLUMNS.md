# 🔧 Fix: Session Table - Add All Missing Columns

## 🚨 **The Problem:**

**Session table has:**
- `sessionToken` ❌ (Better Auth expects `token`)
- `expires` ❌ (Better Auth expects `expiresAt`)
- Missing: `ipAddress`, `userAgent`, `createdAt`, `updatedAt`

---

## ✅ **Solution: Add All Missing Columns**

### **Step 1: Add token Column (Copy from sessionToken)**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "token" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Session" SET "token" = "sessionToken" WHERE "token" IS NULL AND "sessionToken" IS NOT NULL;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token") WHERE "token" IS NOT NULL;'
```

---

### **Step 2: Add expiresAt Column (Copy from expires)**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "expiresAt" TIMESTAMP(3);'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Session" SET "expiresAt" = "expires" WHERE "expiresAt" IS NULL AND "expires" IS NOT NULL;'
```

---

### **Step 3: Add Missing Columns**

```bash
# Add ipAddress
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "ipAddress" TEXT;'

# Add userAgent
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "userAgent" TEXT;'

# Add createdAt
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'

# Add updatedAt
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'
```

---

### **Step 4: Verify All Columns**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Session"'
```

---

### **Step 5: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix - All Commands:**

```bash
# 1. Add token (copy from sessionToken)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "token" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Session" SET "token" = "sessionToken" WHERE "token" IS NULL AND "sessionToken" IS NOT NULL;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token") WHERE "token" IS NOT NULL;'

# 2. Add expiresAt (copy from expires)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "expiresAt" TIMESTAMP(3);'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'UPDATE "Session" SET "expiresAt" = "expires" WHERE "expiresAt" IS NULL AND "expires" IS NOT NULL;'

# 3. Add missing columns
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "ipAddress" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "userAgent" TEXT;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'

# 4. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Session"'

# 5. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend
```

---

**Add all missing columns to Session table!** 🚀

