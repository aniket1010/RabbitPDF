# ✅ Add accountId Column to Account Table

## ✅ **Table Found: `Account` (with capital A)**

**Now let's check its structure and add the missing column.**

---

## 🔍 **Step 1: Check Current Account Table Structure**

**See what columns exist:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'
```

**This shows all columns in the Account table.**

---

## ✅ **Step 2: Add Missing accountId Column**

**Add the column (with quotes for case-sensitive name):**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accountId" TEXT;'
```

---

## ✅ **Step 3: Verify Column Added**

**Check the structure again:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'
```

**Should now show `accountId` column.**

---

## ✅ **Step 4: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix Commands:**

```bash
# 1. Check current structure
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

# 2. Add missing column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accountId" TEXT;'

# 3. Verify it was added
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

# 4. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 5. Test OAuth sign-in
```

---

**Run these commands in order!** 🚀



