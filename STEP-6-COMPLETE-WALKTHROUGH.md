# 🔐 Step 6: Create Environment File - Complete Walkthrough

Let's do this step-by-step, together!

---

## 🎯 **Goal:** Create `.env.production` file with all required variables

**Time:** 10-15 minutes

**You should be:** Connected to server, in project directory

---

## 📋 **Step 1: Make Sure You're in the Right Place**

**On your server, run:**

```bash
# Check current directory
pwd
# Should show: /home/ubuntu/RabbitPDF or /home/ubuntu/ChatPDF

# If not, go there
cd ~/RabbitPDF
# or
cd ~/ChatPDF

# Verify docker-compose file exists
ls docker-compose.production.yml
```

**✅ If you see `docker-compose.production.yml`, you're in the right place!**

---

## 📋 **Step 2: Get Your Server IP**

**Run this command:**

```bash
curl ifconfig.me
```

**Or check AWS Console:**
- EC2 → Instances → Your instance → Public IPv4 address

**✅ Copy your IP address (e.g., `54.123.45.67`)**

---

## 📋 **Step 3: Generate All Secrets**

**Run these commands one by one and COPY each result:**

```bash
# 1. Generate BETTER_AUTH_SECRET
echo "BETTER_AUTH_SECRET:"
openssl rand -base64 32

# 2. Generate INTERNAL_API_SECRET
echo "INTERNAL_API_SECRET:"
openssl rand -base64 32

# 3. Generate POSTGRES_PASSWORD
echo "POSTGRES_PASSWORD:"
openssl rand -base64 24

# 4. Generate REDIS_PASSWORD
echo "REDIS_PASSWORD:"
openssl rand -base64 24
```

**✅ You should have 4 generated values. Copy each one!**

---

## 📋 **Step 4: Create the File**

**Run:**

```bash
nano .env.production
```

**✅ Nano editor should open (you'll see a blank file)**

---

## 📋 **Step 5: Paste This Complete Template**

**Copy and paste this ENTIRE block into nano:**

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
POSTGRES_USER=chatpdf_user
POSTGRES_PASSWORD=PASTE_POSTGRES_PASSWORD_HERE
POSTGRES_DB=chatpdf_production

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_PASSWORD=PASTE_REDIS_PASSWORD_HERE
REDIS_URL=redis://:PASTE_REDIS_PASSWORD_HERE@redis:6379

# ============================================
# OPENAI CONFIGURATION
# ============================================
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE

# ============================================
# PINECONE CONFIGURATION
# ============================================
PINECONE_API_KEY=YOUR_PINECONE_KEY_HERE
PINECONE_INDEX_NAME=chatpdf-production

# ============================================
# AUTHENTICATION
# ============================================
BETTER_AUTH_SECRET=PASTE_BETTER_AUTH_SECRET_HERE
NEXTAUTH_URL=http://YOUR_SERVER_IP

# ============================================
# INTERNAL API SECURITY
# ============================================
INTERNAL_API_SECRET=PASTE_INTERNAL_API_SECRET_HERE

# ============================================
# APPLICATION URLs
# ============================================
NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP
NEXT_PUBLIC_API_BASE=http://YOUR_SERVER_IP/api

# ============================================
# QUEUE CONFIGURATION
# ============================================
USE_QUEUE=true

# ============================================
# OAUTH (Optional - leave empty if not using)
# ============================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ============================================
# EMAIL (Optional - leave empty if not using)
# ============================================
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=

# ============================================
# AWS S3 (Optional - leave empty if not using)
# ============================================
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=
```

**✅ Template pasted? Let me know!**

---

## 📋 **Step 6: Replace Placeholders**

**Now replace these placeholders with YOUR actual values:**

### **6.1: Replace Server IP (3 places)**

Find and replace `YOUR_SERVER_IP` with your actual IP:

- `NEXTAUTH_URL=http://YOUR_SERVER_IP` → `NEXTAUTH_URL=http://54.123.45.67`
- `NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP` → `NEXT_PUBLIC_APP_URL=http://54.123.45.67`
- `NEXT_PUBLIC_API_BASE=http://YOUR_SERVER_IP/api` → `NEXT_PUBLIC_API_BASE=http://54.123.45.67/api`

**✅ Server IP replaced? Let me know!**

---

### **6.2: Replace Generated Passwords**

**Find:**
- `PASTE_POSTGRES_PASSWORD_HERE` → Replace with your POSTGRES_PASSWORD (from Step 3)
- `PASTE_REDIS_PASSWORD_HERE` → Replace with your REDIS_PASSWORD (from Step 3) - **Replace it TWICE!**

**Example:**
```env
POSTGRES_PASSWORD=xK9mP2qR7vN4wL8tY3zA6bC1dE5fG
REDIS_PASSWORD=aB3cD5eF7gH9iJ1kL2mN4oP6qR8sT0uV
REDIS_URL=redis://:aB3cD5eF7gH9iJ1kL2mN4oP6qR8sT0uV@redis:6379
```

**✅ Passwords replaced? Let me know!**

---

### **6.3: Replace Generated Secrets**

**Find:**
- `PASTE_BETTER_AUTH_SECRET_HERE` → Replace with your BETTER_AUTH_SECRET (from Step 3)
- `PASTE_INTERNAL_API_SECRET_HERE` → Replace with your INTERNAL_API_SECRET (from Step 3)

**✅ Secrets replaced? Let me know!**

---

### **6.4: Replace API Keys**

**Find:**
- `YOUR_OPENAI_KEY_HERE` → Replace with your OpenAI API key (starts with `sk-`)
- `YOUR_PINECONE_KEY_HERE` → Replace with your Pinecone API key

**✅ API keys replaced? Let me know!**

---

## 📋 **Step 7: Save the File**

**In nano:**
1. Press `Ctrl + X` (to exit)
2. Press `Y` (to confirm save)
3. Press `Enter` (to confirm filename)

**✅ File saved? Let me know!**

---

## 📋 **Step 8: Verify File Created**

**Run:**

```bash
# Check file exists
ls -la .env.production

# Check first few lines (to verify, but don't show full content)
head -5 .env.production
```

**✅ File exists? Let me know!**

---

## ✅ **Step 6 Complete Checklist:**

- [ ] In project directory
- [ ] Got server IP address
- [ ] Generated 4 secrets (2 passwords + 2 secrets)
- [ ] Created `.env.production` file
- [ ] Pasted template
- [ ] Replaced `YOUR_SERVER_IP` (3 places)
- [ ] Replaced `PASTE_POSTGRES_PASSWORD_HERE`
- [ ] Replaced `PASTE_REDIS_PASSWORD_HERE` (2 places)
- [ ] Replaced `PASTE_BETTER_AUTH_SECRET_HERE`
- [ ] Replaced `PASTE_INTERNAL_API_SECRET_HERE`
- [ ] Replaced `YOUR_OPENAI_KEY_HERE`
- [ ] Replaced `YOUR_PINECONE_KEY_HERE`
- [ ] Saved file
- [ ] Verified file exists

---

## 🚀 **Next Step:**

Once all placeholders are replaced and file is saved, tell me: **"Environment file created"** or **"Step 6 complete"**

Then we'll move to **Step 7: Update CORS Configuration** 🌐

---

## 🆘 **Need Help?**

**If you get stuck:**
- Tell me which step you're on
- Tell me what's confusing
- I'll help you through it!

**Ready? Let's start with Step 1!** 🎯

