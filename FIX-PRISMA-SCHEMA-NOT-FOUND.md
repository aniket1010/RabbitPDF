# 🔧 Fix: Prisma Schema Not Found - Specify Schema Path

## 🚨 **The Problem:**

**Error:** `Could not find Prisma Schema`

**Why:** When exec'ing into the container, Prisma can't find the schema file because it's not in the default location or working directory.

---

## ✅ **Solution: Specify Schema Path**

### **Option 1: Use --schema Flag**

**Specify the schema path explicitly:**

```bash
cd ~/RabbitPDF

# Run migrations with schema path
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy --schema=/app/prisma/schema.prisma

# Generate Prisma client with schema path
docker-compose -f docker-compose.production.yml exec frontend npx prisma generate --schema=/app/prisma/schema.prisma
```

---

### **Option 2: Change Directory First**

**Change to the app directory in the container:**

```bash
docker-compose -f docker-compose.production.yml exec frontend sh -c "cd /app && npx prisma migrate deploy"
```

---

### **Option 3: Run from Host (Easier)**

**Run migrations from your host machine (not in container):**

```bash
cd ~/RabbitPDF/frontend

# Set DATABASE_URL (get from .env)
export DATABASE_URL="postgresql://chatpdf_user:YOUR_PASSWORD@localhost:5432/chatpdf_production"

# Or use the one from docker-compose
export DATABASE_URL=$(grep DATABASE_URL ../.env | cut -d '=' -f2-)

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

**Note:** This requires port forwarding or connecting to the database from host.

---

### **Option 4: Use Backend Container**

**Backend might have Prisma set up differently:**

```bash
cd ~/RabbitPDF

# Try backend container
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy --schema=/app/prisma/schema.prisma
```

---

## 🎯 **Recommended: Run from Host**

**Easiest solution - run from host:**

### **Step 1: Install Prisma CLI (if needed)**

```bash
# On server
npm install -g prisma
# Or use npx (no install needed)
```

### **Step 2: Get DATABASE_URL**

```bash
cd ~/RabbitPDF
cat .env | grep DATABASE_URL
```

**Copy the DATABASE_URL value.**

### **Step 3: Run Migrations**

```bash
cd ~/RabbitPDF/frontend

# Set DATABASE_URL
export DATABASE_URL="postgresql://chatpdf_user:YOUR_PASSWORD@localhost:5432/chatpdf_production"

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

**Note:** If database is not accessible from host, you'll need to use port forwarding or run from container.

---

## 🔧 **Alternative: Run SQL Migration Directly**

**If Prisma CLI doesn't work, run the SQL migration directly:**

```bash
# Get the migration SQL file
cat frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql

# Connect to database and run SQL
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres

# Then in psql:
\c chatpdf_production
\i /path/to/migration.sql
```

**Or copy SQL and run:**

```bash
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres -d chatpdf_production < frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql
```

---

## ✅ **Quick Fix Commands:**

```bash
cd ~/RabbitPDF

# Option 1: Specify schema path
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy --schema=/app/prisma/schema.prisma

# Option 2: Change directory
docker-compose -f docker-compose.production.yml exec frontend sh -c "cd /app && npx prisma migrate deploy"

# Option 3: Run SQL directly
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres -d chatpdf_production < frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql
```

---

## 🎯 **Most Likely Fix:**

**Try specifying the schema path:**

```bash
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy --schema=/app/prisma/schema.prisma
```

**If that doesn't work, run the SQL migration directly!**

---

**Try the --schema flag first!** 🚀



