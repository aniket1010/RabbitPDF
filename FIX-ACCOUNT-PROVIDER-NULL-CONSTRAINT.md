# 🔧 Fix: Account Table provider Column Null Constraint

## 🚨 **The Problem:**

**Error:** `Null constraint violation on the fields: (provider)`

**Why:** The Account table has a `provider` column that's `NOT NULL`, but Better Auth uses `providerId` instead and doesn't provide `provider`.

**Better Auth uses `providerId` - `provider` is from the old NextAuth.js schema.**

---

## ✅ **Solution: Make provider Column Nullable**

**Since Better Auth uses `providerId`, make `provider` nullable:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "provider" DROP NOT NULL;'
```

---

## 🎯 **Quick Fix:**

```bash
# 1. Make provider nullable
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "provider" DROP NOT NULL;'

# 2. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

# 3. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 4. Test OAuth sign-in
```

---

## 💡 **Why This Works:**

- Better Auth uses `providerId` (which we added)
- The old `provider` column is not needed by Better Auth
- Making it nullable allows Better Auth to create accounts without providing `provider`
- OAuth sign-in should work after this

---

**Make the provider column nullable!** 🚀



