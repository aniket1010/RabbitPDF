# Safe Git Pull Guide - Won't Break Anything

## ✅ What's Protected (Won't Be Overwritten)

**These files are SAFE because they're in `.gitignore`:**
- ✅ `.env` - Your environment variables (passwords, API keys)
- ✅ `.env.production` - Production environment variables
- ✅ `*.pem` - SSH keys
- ✅ `uploads/` - Uploaded PDFs
- ✅ `node_modules/` - Dependencies (will be rebuilt anyway)

**These files might be different on server:**
- ⚠️ `nginx.conf` - Server-specific Nginx config
- ⚠️ `docker-compose.production.yml` - Might have server-specific changes

---

## 🔍 Step 1: Check What's Changed on Server

**SSH to server:**
```bash
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
```

**Check for uncommitted changes:**
```bash
git status
```

**If you see modified files, check what they are:**
```bash
git diff
```

**Common files that might be modified:**
- `nginx.conf` - If you edited it directly on server
- `docker-compose.production.yml` - If you changed env_file paths

---

## 🛡️ Step 2: Safe Pull (Preserves Your Changes)

### Option A: Stash Changes (Recommended)

**If you have uncommitted changes you want to keep:**
```bash
# Save your changes temporarily
git stash

# Pull latest code
git pull

# Reapply your changes (if any conflicts, you'll see them)
git stash pop
```

**If there are conflicts:**
```bash
# Check which files have conflicts
git status

# Edit conflicted files manually
nano <filename>

# After fixing conflicts:
git add <filename>
git stash drop  # Remove stash after resolving
```

### Option B: Pull with Merge Strategy

**If you want to keep server changes:**
```bash
# Pull and merge (keeps both changes)
git pull --no-rebase

# If conflicts occur, Git will tell you which files
# Edit them manually, then:
git add <conflicted-files>
git commit -m "Merge server changes with latest code"
```

### Option C: Check What Will Change (Safest)

**See what will change BEFORE pulling:**
```bash
# Fetch latest without merging
git fetch

# See what's different
git log HEAD..origin/main --oneline

# See file changes
git diff HEAD origin/main --name-only

# If you're happy, then pull:
git pull
```

---

## 🔧 Step 3: Handle Specific Files

### If `nginx.conf` Has Conflicts

**Your server nginx.conf might be different. Keep server version:**
```bash
# After pull, if nginx.conf conflicts:
git checkout --ours nginx.conf  # Keep server version
# OR
git checkout --theirs nginx.conf  # Use new version (then edit manually)
```

**Then manually merge important parts if needed.**

### If `docker-compose.production.yml` Has Conflicts

**Usually safe to keep server version (has correct `.env` paths):**
```bash
git checkout --ours docker-compose.production.yml
```

---

## ✅ Step 4: Verify After Pull

**Check that important files are still correct:**
```bash
# Verify .env still exists (should be untouched)
ls -la .env

# Verify docker-compose still points to .env
grep "env_file" docker-compose.production.yml
# Should show: - .env

# Check nginx config syntax
sudo nginx -t
```

---

## 🚀 Step 5: Rebuild Frontend

**After successful pull:**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**Watch build:**
```bash
docker-compose -f docker-compose.production.yml logs -f frontend
```

---

## 🆘 If Something Breaks

### Rollback to Previous Version

**If pull breaks something:**
```bash
# See recent commits
git log --oneline -5

# Go back to previous commit
git reset --hard HEAD~1

# Or go to specific commit
git reset --hard <commit-hash>
```

### Restore Specific File

**If only one file broke:**
```bash
# Restore from previous commit
git checkout HEAD~1 -- <filename>

# Or restore from stash
git checkout stash -- <filename>
```

---

## 📋 Quick Safe Pull Command

**If you're confident and want to pull quickly:**
```bash
cd ~/RabbitPDF
git fetch
git diff HEAD origin/main --name-only  # Preview changes
git pull  # Pull if changes look safe
```

**If conflicts occur, Git will stop and tell you what to do.**

---

## ✅ Summary: What's Safe

**✅ SAFE (won't be overwritten):**
- `.env` - Protected by .gitignore
- Uploaded files
- Database data
- Docker volumes

**⚠️ CHECK BEFORE PULLING:**
- `nginx.conf` - Might have server-specific changes
- `docker-compose.production.yml` - Might have server-specific paths

**✅ ALWAYS SAFE:**
- Code files (`frontend/src/`, `backend/`)
- Configuration files (unless you edited them on server)

---

## 🎯 Recommended Approach

**For this specific fix (cookie headers):**

```bash
# 1. SSH to server
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170

# 2. Check status
cd ~/RabbitPDF
git status

# 3. If clean, pull safely:
git pull

# 4. If you have changes, stash first:
git stash
git pull
git stash pop  # Reapply your changes

# 5. Rebuild frontend
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**The files we changed (`route.ts` and `auth.ts`) are code files, so they're safe to pull!**

