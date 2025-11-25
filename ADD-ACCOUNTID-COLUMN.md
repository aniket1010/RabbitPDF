# 🔧 Add Missing accountId Column to Account Table

## 🚨 **The Problem:**

**Error:** `The column Account.accountId does not exist in the current database.`

**The migration SQL shows `accountId` should exist, but it's missing from your database.**

---

## ✅ **Solution: Add Missing Column**

### **Step 1: Check Current Account Table Structure**

**See what columns exist:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d Account"
```

**Share the output - this will show what columns are missing.**

---

### **Step 2: Add Missing accountId Column**

**Add the column:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "ALTER TABLE \"Account\" ADD COLUMN IF NOT EXISTS \"accountId\" TEXT NOT NULL DEFAULT '';"
```

**If that fails (because of NOT NULL), try:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "ALTER TABLE \"Account\" ADD COLUMN \"accountId\" TEXT;"
```

---

### **Step 3: Update Existing Rows (If Any)**

**If there are existing rows, you might need to set a default:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "UPDATE \"Account\" SET \"accountId\" = \"providerAccountId\" WHERE \"accountId\" IS NULL OR \"accountId\" = '';"
```

**Or if there's a different column name, use that.**

---

### **Step 4: Make Column NOT NULL (If Needed)**

**After adding data:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "ALTER TABLE \"Account\" ALTER COLUMN \"accountId\" SET NOT NULL;"
```

---

### **Step 5: Verify Column Added**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d Account"
```

**Should now show `accountId` column.**

---

### **Step 6: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix Commands:**

```bash
# 1. Check current structure
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d Account"

# 2. Add missing column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "ALTER TABLE \"Account\" ADD COLUMN \"accountId\" TEXT;"

# 3. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d Account"

# 4. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 5. Test OAuth
```

---

## 💡 **If Column Already Exists with Different Name:**

**Check what columns Account table has:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d Account"
```

**If you see `providerAccountId` instead of `accountId`, you might need to rename it:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "ALTER TABLE \"Account\" RENAME COLUMN \"providerAccountId\" TO \"accountId\";"
```

---

**First, check the current Account table structure, then add the missing column!** 🔍



