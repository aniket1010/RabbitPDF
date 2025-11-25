# 🔧 Fix: .env.production Has Markdown Syntax

## 🚨 **Problem:** File has markdown code block markers

**Error:** `unexpected character "`" in variable name "```env"`

**This means:** You accidentally copied the markdown code block markers (`\`\`\`env`) into the file!

---

## 🔧 **Step 1: Check File Content**

**Let's see what's wrong:**

```bash
# View first few lines
head -10 .env.production

# You'll probably see:
# ```env
# POSTGRES_USER=chatpdf_user
# ...
# ```
```

**The problem:** The file starts with `\`\`\`env` and ends with `\`\`\``

---

## 🚀 **Step 2: Fix the File**

**Remove the markdown markers:**

### **Option A: Edit with nano (Recommended)**

```bash
# Open file
nano .env.production

# Remove these lines:
# - First line: ```env (if it exists)
# - Last line: ``` (if it exists)

# Keep only the actual environment variables:
# POSTGRES_USER=chatpdf_user
# POSTGRES_PASSWORD=...
# etc.

# Save: Ctrl+X, Y, Enter
```

---

### **Option B: Use sed to remove markers**

```bash
# Remove first line if it starts with ```
sed -i '1{/^```/d}' .env.production

# Remove last line if it's just ```
sed -i '$ {/^```$/d}' .env.production

# Verify
head -5 .env.production
tail -5 .env.production
```

---

### **Option C: Recreate File Properly**

**If easier, just recreate:**

```bash
# Backup old file (just in case)
cp .env.production .env.production.backup

# Create new file
nano .env.production
```

**Then paste ONLY the environment variables (without markdown markers):**

```env
POSTGRES_USER=chatpdf_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=chatpdf_production
REDIS_PASSWORD=your_redis_password
REDIS_URL=redis://:your_redis_password@redis:6379
OPENAI_API_KEY=sk-your_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=chatpdf-production
BETTER_AUTH_SECRET=your_secret
NEXTAUTH_URL=http://YOUR_SERVER_IP
INTERNAL_API_SECRET=your_internal_secret
NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP
NEXT_PUBLIC_API_BASE=http://YOUR_SERVER_IP/api
USE_QUEUE=true
```

**NO markdown markers (`\`\`\`env` or `\`\`\``)!**

---

## ✅ **Step 3: Verify File is Fixed**

**After fixing:**

```bash
# Check first line (should NOT start with ```)
head -1 .env.production

# Should show: POSTGRES_USER=chatpdf_user (or similar)
# NOT: ```env

# Check last line (should NOT be just ```)
tail -1 .env.production

# Should show: AWS_REGION=... (or similar)
# NOT: ```

# Test Docker Compose can read it
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD

# Should show actual password, not warnings!
```

---

## 🎯 **Quick Fix:**

**Run this:**

```bash
# Open file
nano .env.production

# In nano:
# 1. Go to first line
# 2. If it says ```env, delete that line
# 3. Go to last line
# 4. If it says ```, delete that line
# 5. Save: Ctrl+X, Y, Enter

# Verify
head -3 .env.production
tail -3 .env.production
```

---

## 📋 **Correct File Format:**

**Your `.env.production` should look like:**

```env
POSTGRES_USER=chatpdf_user
POSTGRES_PASSWORD=actual_password_here
POSTGRES_DB=chatpdf_production
REDIS_PASSWORD=actual_password_here
...
```

**NOT:**

```env
```env
POSTGRES_USER=chatpdf_user
...
```
```

---

## 🚀 **After Fixing:**

**Once file is correct:**

```bash
# Test Docker Compose can read it
docker-compose -f docker-compose.production.yml config | grep POSTGRES_PASSWORD

# Should show actual password, not warnings!

# Then rebuild
docker-compose -f docker-compose.production.yml build
```

---

## 💡 **What Happened:**

When you copied the template in Step 6, you accidentally included the markdown code block markers (`\`\`\`env` and `\`\`\``) that were used to format the code in the guide.

**Solution:** Remove those markers - keep only the actual environment variables!

---

## 🎯 **Action Plan:**

1. **Open file:** `nano .env.production`
2. **Remove first line** if it's `\`\`\`env`
3. **Remove last line** if it's just `\`\`\``
4. **Save:** Ctrl+X, Y, Enter
5. **Verify:** `head -3 .env.production` should show variables, not markers
6. **Test:** `docker-compose config` should work without warnings

**Let me know when it's fixed!** 🚀

