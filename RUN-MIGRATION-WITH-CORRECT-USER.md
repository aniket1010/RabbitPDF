# 🔧 Run Migration with Correct Database User

## ✅ **Solution: Use Correct Database User**

**Your docker-compose uses `chatpdf_user`, not `postgres`.**

---

## 🚀 **Quick Fix: Run Migration SQL**

### **Step 1: Get Database Credentials from .env**

```bash
cd ~/RabbitPDF

# Get actual values
cat .env | grep POSTGRES_USER
cat .env | grep POSTGRES_DB
cat .env | grep POSTGRES_PASSWORD
```

---

### **Step 2: Run Migration with Correct User**

**Use the user from .env (likely `chatpdf_user`):**

```bash
cd ~/RabbitPDF

# Run migration SQL with chatpdf_user
docker-compose -f docker-compose.production.yml exec -T postgres psql -U chatpdf_user -d chatpdf_production < frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql
```

---

### **Step 3: If User Doesn't Exist, Create It First**

**Connect as postgres superuser (PostgreSQL creates this automatically):**

```bash
# Connect to postgres container
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres
```

**If that doesn't work, try:**

```bash
# Check what users exist
docker-compose -f docker-compose.production.yml exec postgres psql -U $(cat .env | grep POSTGRES_USER | cut -d '=' -f2) -d postgres -c "\du"
```

---

## 🔧 **Alternative: Connect and Run SQL Manually**

### **Step 1: Connect to Database**

```bash
cd ~/RabbitPDF

# Get user from .env
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2 | tr -d ' ')

# Connect
docker-compose -f docker-compose.production.yml exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
```

---

### **Step 2: Run Migration SQL**

**Once connected, run:**

```sql
-- Check if database exists
\l

-- Connect to database
\c chatpdf_production

-- Then paste the migration SQL
```

**Or copy the SQL file content:**

```bash
cat frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql
```

**Then paste it into psql.**

---

## ✅ **Easiest: Run SQL File Directly**

**Try this command:**

```bash
cd ~/RabbitPDF

# Get user from .env
POSTGRES_USER=$(grep "^POSTGRES_USER" .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_DB=$(grep "^POSTGRES_DB" .env | cut -d '=' -f2 | tr -d ' ')

# Run migration
docker-compose -f docker-compose.production.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql
```

---

## 🎯 **Quick Test:**

**First, check if you can connect:**

```bash
cd ~/RabbitPDF

# Try connecting with chatpdf_user
docker-compose -f docker-compose.production.yml exec postgres psql -U chatpdf_user -d chatpdf_production -c "\dt"
```

**If that works, run the migration:**

```bash
docker-compose -f docker-compose.production.yml exec -T postgres psql -U chatpdf_user -d chatpdf_production < frontend/prisma/migrations/20250821123338_init_with_pending_users/migration.sql
```

---

## 💡 **If User Doesn't Exist:**

**Create it first:**

```bash
# Connect as postgres (superuser)
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres

# In psql:
CREATE USER chatpdf_user WITH PASSWORD 'YOUR_PASSWORD_FROM_ENV';
CREATE DATABASE chatpdf_production OWNER chatpdf_user;
GRANT ALL PRIVILEGES ON DATABASE chatpdf_production TO chatpdf_user;
\q
```

**Then run migration.**

---

**Try connecting with `chatpdf_user` first!** 🚀



