# 🔧 Update docker-compose.production.yml on Server

## 🎯 **You're Right!** Need to update the file on the server too.

**Two options:**

---

## 🚀 **Option 1: Edit Directly on Server (Faster)**

**SSH to server and edit:**

```bash
# SSH to server
ssh -i rabbitpdf-key.pem ubuntu@YOUR_SERVER_IP

# Navigate to project
cd ~/RabbitPDF

# Edit docker-compose file
nano docker-compose.production.yml
```

**Find these 3 sections and change:**

**Find:**
```yaml
    env_file:
      - .env.production
```

**Change to:**
```yaml
    env_file:
      - .env
```

**Do this for:**
- backend service (around line 49-50)
- worker service (around line 104-105)
- frontend service (around line 142-143)

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## 🚀 **Option 2: Use sed Command (Faster)**

**On server, run:**

```bash
# Navigate to project
cd ~/RabbitPDF

# Replace .env.production with .env
sed -i 's/\.env\.production/.env/g' docker-compose.production.yml

# Verify changes
grep "env_file" docker-compose.production.yml

# Should show: - .env (not .env.production)
```

---

## 🚀 **Option 3: Push to Git and Pull (If Using Git)**

**If you want to sync with git:**

**On your local machine:**

```bash
# Commit changes
git add docker-compose.production.yml
git commit -m "Update env_file to use .env instead of .env.production"
git push origin main
```

**On server:**

```bash
# Pull latest changes
cd ~/RabbitPDF
git pull origin main

# Verify
grep "env_file" docker-compose.production.yml
```

---

## ✅ **After Updating:**

**Test on server:**

```bash
# Verify .env file exists
ls -la .env

# Test Docker Compose can read it
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD

# Should show actual password, no errors!
```

---

## 🎯 **Recommended: Use sed Command**

**Fastest way:**

```bash
# On server
cd ~/RabbitPDF
sed -i 's/\.env\.production/.env/g' docker-compose.production.yml
grep "env_file" docker-compose.production.yml
```

**Done in 10 seconds!** ✅

---

## 📋 **Quick Steps:**

1. **SSH to server**
2. **Run:** `sed -i 's/\.env\.production/.env/g' docker-compose.production.yml`
3. **Verify:** `grep "env_file" docker-compose.production.yml`
4. **Test:** `docker-compose config | grep POSTGRES_PASSWORD`

**Let me know when it's done!** 🚀

