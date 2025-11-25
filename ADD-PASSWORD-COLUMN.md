# ✅ Add Missing password Column to Account Table

## 🚨 **The Problem:**

**Error:** `The column Account.password does not exist in the current database.`

**Better Auth expects `password` column (optional, for password-based auth).**

---

## ✅ **Solution: Add password Column**

### **Add password Column:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "password" TEXT;'
```

**This is optional (nullable), so no default value needed.**

---

### **Verify Column Added:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'
```

**Should now show `password` column.**

---

### **Restart Frontend:**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎯 **Quick Fix:**

```bash
# 1. Add password column
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c 'ALTER TABLE "Account" ADD COLUMN "password" TEXT;'

# 2. Verify
docker-compose -f docker-compose.production.yml exec postgres psql -U rabbitpdf_user -d rabbitpdf_production -c '\d "Account"'

# 3. Restart frontend
docker-compose -f docker-compose.production.yml restart frontend

# 4. Test OAuth sign-in
```

---

**Add the password column and restart frontend!** 🚀



