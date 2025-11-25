# 🔧 Fix: Account Table type Column Null Constraint

## 🚨 **The Problem:**

**Error:** `Null constraint violation on the fields: (type)`

**Why:** The Account table has a `type` column that's `NOT NULL`, but Better Auth doesn't provide it when creating accounts.

**Better Auth doesn't use `type` - it's from the old NextAuth.js schema.**

---

## ✅ **Solution: Make type Column Nullable**

### **Option 1: Make type Nullable (Recommended)**

**Since Better Auth doesn't use `type`, make it nullable:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "type" DROP NOT NULL;'
```

---

### **Option 2: Provide Default Value**

**If you want to keep it NOT NULL, provide a default:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "type" SET DEFAULT '\''oauth'\'';'
```

---

### **Option 3: Remove type Column (If Not Needed)**

**If `type` is not used anywhere, remove it:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" DROP COLUMN "type";'
```

---

## 🎯 **Quick Fix (Option 1 - Recommended):**

```bash
# 1. Make type nullable
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ALTER COLUMN "type" DROP NOT NULL;'

# 2. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

# 3. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 4. Test OAuth sign-in
```

---

## 💡 **Why This Works:**

- Better Auth doesn't use the `type` column
- Making it nullable allows Better Auth to create accounts without providing `type`
- OAuth sign-in should work after this

---

**Make the type column nullable!** 🚀



