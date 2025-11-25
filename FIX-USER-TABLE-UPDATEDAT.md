# 🔧 Fix: User Table Missing updatedAt Column

## 🚨 **The Problem:**

**Error:** `The column User.updatedAt does not exist in the current database.`

**Better Auth expects `updatedAt` column in the User table.**

---

## ✅ **Solution: Add updatedAt Column to User Table**

### **Step 1: Check Current User Table Structure**

**See what columns exist:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'
```

**This shows all columns in the User table.**

---

### **Step 2: Add updatedAt Column**

**Add the column:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'
```

**This adds `updatedAt` with a default value.**

---

### **Step 3: Verify Column Added**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'
```

**Should now show `updatedAt` column.**

---

### **Step 4: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix Commands:**

```bash
# 1. Check current structure
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'

# 2. Add updatedAt column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;'

# 3. Verify it was added
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "User"'

# 4. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 5. Test OAuth sign-in
```

---

**Add the updatedAt column to User table!** 🚀



