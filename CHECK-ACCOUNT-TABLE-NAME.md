# 🔍 Check Account Table Name - Case Sensitivity Issue

## 🚨 **The Problem:**

**Error:** `Did not find any relation named "Account"`

**PostgreSQL is case-sensitive! The table might be stored as `account` (lowercase) or `"Account"` (quoted).**

---

## ✅ **Step 1: List All Tables**

**See exact table names:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\dt"
```

**Or get exact names:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
```

---

## ✅ **Step 2: Try Different Cases**

**Try lowercase:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d account"
```

**Try with quotes:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'
```

---

## ✅ **Step 3: Add Column with Correct Name**

**Once you know the exact name, add the column:**

**If it's `Account` (with quotes):**
```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "accountId" TEXT;'
```

**If it's `account` (lowercase):**
```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE account ADD COLUMN "accountId" TEXT;'
```

---

## 🎯 **Quick Commands:**

```bash
# 1. List all tables (see exact names)
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\dt"

# 2. Get exact table names
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

# 3. Try lowercase
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c "\d account"

# 4. Try with quotes
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'
```

---

**Run `\dt` first to see the exact table names!** 🔍



