# 🚀 Apply Mobile Fix to Server - Simple Guide

## ✅ **Quick Method: Git Push & Pull**

**This is the easiest way to apply all your changes!**

---

## 📤 **Step 1: Push Changes from Local Machine**

**On your Windows machine (where you made the changes):**

```bash
# Navigate to project folder
cd D:\all_my_code\projects\chatPDF

# Check what files changed
git status

# Add all changes
git add .

# Commit changes
git commit -m "Fix yellow border on mobile - improve viewport handling"

# Push to GitHub/GitLab
git push origin main
```

**If you get an error about branch name, try:**
```bash
git push origin master
# or
git push
```

---

## 📥 **Step 2: Pull Changes on Server**

**SSH to your server:**

```bash
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
```

**On the server:**

```bash
# Navigate to project
cd ~/RabbitPDF

# Pull latest changes
git pull origin main

# If that doesn't work, try:
git pull
```

---

## 🔨 **Step 3: Rebuild Frontend**

**Still on the server:**

```bash
# Rebuild frontend with new changes
docker-compose -f docker-compose.production.yml up -d --build frontend

# Watch the build (optional)
docker-compose -f docker-compose.production.yml logs -f frontend
```

**Wait for build to complete** (takes 2-5 minutes)

---

## ✅ **Step 4: Verify It Works**

**Check if frontend is running:**

```bash
docker-compose -f docker-compose.production.yml ps
```

**Should show frontend as "Up"**

**Test on mobile:** Visit `http://rabbitpdf.in:3000` - yellow border should be gone! 🎉

---

## 🔍 **Troubleshooting**

### **If git pull says "Already up to date":**

**Check if you're on the right branch:**
```bash
git branch
# Should show: * main (or master)
```

**If not, switch branch:**
```bash
git checkout main
git pull
```

### **If git pull fails:**

**Check remote:**
```bash
git remote -v
```

**If no remote, add it:**
```bash
git remote add origin YOUR_GIT_REPO_URL
git pull origin main
```

### **If build fails:**

**Check logs:**
```bash
docker-compose -f docker-compose.production.yml logs frontend --tail 50
```

**Rebuild from scratch:**
```bash
docker-compose -f docker-compose.production.yml build --no-cache frontend
docker-compose -f docker-compose.production.yml up -d frontend
```

---

## 🎯 **Alternative: Copy Files Directly (If Git Doesn't Work)**

**If git isn't set up, you can copy files directly:**

**From your Windows machine:**

```powershell
# Copy layout.tsx
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem frontend\src\app\layout.tsx ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/app/layout.tsx

# Copy globals.css
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem frontend\src\app\globals.css ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/app/globals.css

# Copy AppShell.tsx
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem frontend\src\components\AppShell.tsx ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/components/AppShell.tsx
```

**Then rebuild on server:**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## ✅ **Done!**

After rebuilding, test on mobile - the yellow border should be fixed! 🎉


