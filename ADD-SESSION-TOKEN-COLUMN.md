# ✅ Add token Column to Session Table

## 🚨 **The Problem:**

**Error:** `The column token does not exist in the current database.`

**Better Auth expects `token` column in Session table (UNIQUE, NOT NULL).**

---

## ✅ **Solution: Add token Column**

### **Step 1: Check Current Session Table Structure**

**See what columns exist:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Session"'
```

**Share the output - I'll tell you what's missing!**

---

### **Step 2: Add token Column**

**Add the `token` column (UNIQUE, NOT NULL):**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "token" TEXT UNIQUE NOT NULL;'
```

**If that fails (because of NOT NULL on existing rows), try:**

```bash
# Add nullable first
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "token" TEXT;'

# Add unique constraint
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");'

# Make NOT NULL (if no existing rows)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ALTER COLUMN "token" SET NOT NULL;'
```

---

### **Step 3: Verify Column Added**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Session"'
```

**Should now show `token` column with UNIQUE constraint.**

---

### **Step 4: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix:**

```bash
# 1. Check Session table structure
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Session"'

# 2. Add token column (if no existing rows)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Session" ADD COLUMN "token" TEXT UNIQUE NOT NULL;'

# 3. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Session"'

# 4. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend
```

---

**Check Session table structure first, then add the token column!** 🔍



