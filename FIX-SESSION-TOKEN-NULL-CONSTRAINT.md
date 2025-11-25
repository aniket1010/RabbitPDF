# 🔧 Fix: Session Table sessionToken Null Constraint

## 🚨 **The Problem:**

**Error:** `Null constraint violation on the fields: (sessionToken)`

**Why:** The Session table has `sessionToken` column that's `NOT NULL`, but Better Auth uses `token` instead and doesn't provide `sessionToken`.

**Better Auth uses `token` - `sessionToken` is from the old NextAuth.js schema.**

---

## ✅ **Solution: Make sessionToken Nullable**

**Since Better Auth uses `token`, make `sessionToken` nullable:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ALTER COLUMN "sessionToken" DROP NOT NULL;'
```

---

## 🎯 **Quick Fix:**

```bash
# 1. Make sessionToken nullable
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ALTER COLUMN "sessionToken" DROP NOT NULL;'

# 2. Also make expires nullable (Better Auth uses expiresAt)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ALTER COLUMN "expires" DROP NOT NULL;'

# 3. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Session"'

# 4. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 5. Test OAuth sign-in
```

---

## 💡 **Why This Works:**

- Better Auth uses `token` (which we added)
- The old `sessionToken` column is not needed by Better Auth
- Making it nullable allows Better Auth to create sessions without providing `sessionToken`
- Same for `expires` - Better Auth uses `expiresAt`

---

**Make sessionToken and expires nullable!** 🚀



