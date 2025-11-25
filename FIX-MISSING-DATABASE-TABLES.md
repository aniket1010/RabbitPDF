# 🔧 Fix: Missing Database Tables - Run Prisma Migrations

## 🚨 **The Problem:**

**Error:** `The table 'public.Verification' does not exist in the current database.`

**Why:** Database migrations haven't been run. The database schema is missing tables that Better Auth needs.

---

## ✅ **Solution: Run Database Migrations**

### **Step 1: Check Prisma Schema**

**Make sure Prisma schema exists:**

```bash
cd ~/RabbitPDF
ls -la frontend/prisma/schema.prisma
```

**Should exist!**

---

### **Step 2: Run Prisma Migrations**

**Run migrations to create all tables:**

```bash
# Make sure you're in the project directory
cd ~/RabbitPDF

# Run migrations using the backend container (has Prisma CLI)
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

**Or if that doesn't work, run from frontend container:**

```bash
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

---

### **Step 3: Generate Prisma Client**

**After migrations, generate Prisma client:**

```bash
docker-compose -f docker-compose.production.yml exec backend npx prisma generate
```

**Or:**

```bash
docker-compose -f docker-compose.production.yml exec frontend npx prisma generate
```

---

### **Step 4: Verify Tables Created**

**Check if tables exist:**

```bash
docker-compose -f docker-compose.production.yml exec backend npx prisma db pull
```

**Or connect to database directly:**

```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U chatpdf_user -d chatpdf_production -c "\dt"
```

**Should show tables including:**
- `User`
- `Account`
- `Session`
- `Verification` ← This is the missing one!

---

## 🔧 **Alternative: Run Migrations Manually**

**If exec doesn't work, run migrations from host:**

```bash
cd ~/RabbitPDF

# Copy Prisma schema to backend (if needed)
# Or run from frontend directory

# Set database URL
export DATABASE_URL="postgresql://chatpdf_user:YOUR_PASSWORD@localhost:5432/chatpdf_production"

# Run migrations
cd frontend
npx prisma migrate deploy

# Generate client
npx prisma generate
```

---

## 🚀 **Quick Fix Commands:**

```bash
# 1. Run migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy

# 2. Generate Prisma client
docker-compose -f docker-compose.production.yml exec backend npx prisma generate

# 3. Restart frontend (to reload Prisma client)
docker-compose -f docker-compose.production.yml restart frontend

# 4. Test OAuth again
```

---

## 📋 **Step-by-Step:**

### **1. SSH to Server:**

```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
```

### **2. Navigate to Project:**

```bash
cd ~/RabbitPDF
```

### **3. Run Migrations:**

```bash
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

**Expected output:**
```
Applying migration `20250821123338_init_with_pending_users`
```

### **4. Generate Prisma Client:**

```bash
docker-compose -f docker-compose.production.yml exec backend npx prisma generate
```

### **5. Restart Frontend:**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

### **6. Test OAuth:**

**Try signing in with Google/GitHub again!**

---

## 🎯 **What Migrations Do:**

**Prisma migrations:**
- ✅ Create all database tables
- ✅ Set up relationships
- ✅ Create indexes
- ✅ Set up constraints

**Required tables for Better Auth:**
- `User` - User accounts
- `Account` - OAuth accounts
- `Session` - User sessions
- `Verification` - Email verification tokens ← Missing!

---

## 🚨 **If Migrations Fail:**

### **Check Database Connection:**

```bash
docker-compose -f docker-compose.production.yml exec backend npx prisma db pull
```

**If this fails, database might not be connected.**

### **Check Environment Variables:**

```bash
docker-compose -f docker-compose.production.yml exec backend env | grep DATABASE_URL
```

**Should show:** `DATABASE_URL=postgresql://...`

---

## ✅ **After Running Migrations:**

**You should see:**
- ✅ Migration applied successfully
- ✅ Tables created
- ✅ OAuth sign-in works!

---

## 💡 **Why This Happened:**

**Database migrations weren't run during deployment. This is a common step that's easy to miss!**

---

**Run the migrations command above and let me know the result!** 🚀



