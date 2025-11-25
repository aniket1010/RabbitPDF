# 🔧 Fix All Account Table Constraints at Once

## 🎯 **Fix All Potential Issues:**

**Better Auth uses different column names than NextAuth.js. Let's make all old columns nullable:**

---

## ✅ **Complete Fix - Run All Commands:**

```bash
# 1. Make provider nullable (Better Auth uses providerId)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "provider" DROP NOT NULL;'

# 2. Make providerAccountId nullable (Better Auth uses accountId)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "providerAccountId" DROP NOT NULL;'

# 3. Verify all changes
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

# 4. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 5. Test OAuth sign-in
```

---

## 📋 **What We're Fixing:**

1. ✅ `provider` → nullable (Better Auth uses `providerId`)
2. ✅ `providerAccountId` → nullable (Better Auth uses `accountId`)
3. ✅ `type` → already nullable (Better Auth doesn't use it)

---

## 🎯 **One-Liner (Copy-Paste All):**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "provider" DROP NOT NULL; ALTER TABLE "Account" ALTER COLUMN "providerAccountId" DROP NOT NULL;' && docker-compose -f docker-compose.production.yml restart frontend
```

---

**Run all commands to fix all constraints at once!** 🚀



