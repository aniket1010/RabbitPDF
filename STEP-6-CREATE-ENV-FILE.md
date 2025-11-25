# 🔐 Step 6: Create Environment File

Let's create your `.env.production` file with all the required configuration!

---

## 🎯 **Goal:** Create and configure `.env.production` file

**Time:** 10-15 minutes

**You should be:** Connected to server, in project directory (`~/RabbitPDF` or `~/ChatPDF`)

---

## 📝 **Step-by-Step Instructions:**

### **6.1: Navigate to Project Directory**

**Make sure you're in the project root:**

```bash
# Check current directory
pwd
# Should show: /home/ubuntu/RabbitPDF or /home/ubuntu/ChatPDF

# If not, navigate there
cd ~/RabbitPDF
# or
cd ~/ChatPDF
```

**✅ Are you in the project directory? Let me know!**

---

### **6.2: Create Environment File**

**Create the file:**

```bash
nano .env.production
```

**This opens the nano text editor.**

**✅ File opened? Let me know!**

---

### **6.3: Generate Secure Secrets**

**Before filling the file, let's generate secure passwords. In a NEW terminal window (keep nano open), run:**

```bash
# Generate BETTER_AUTH_SECRET (64 characters)
openssl rand -base64 32

# Generate POSTGRES_PASSWORD
openssl rand -base64 24

# Generate REDIS_PASSWORD
openssl rand -base64 24

# Generate INTERNAL_API_SECRET
openssl rand -base64 32
```

**Copy each generated secret - you'll need them!**

**✅ Secrets generated? Let me know!**

---

### **6.4: Fill in Environment Variables**

**In the nano editor, paste this template and fill in YOUR values:**

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
POSTGRES_USER=chatpdf_user
POSTGRES_PASSWORD=PASTE_GENERATED_PASSWORD_HERE
POSTGRES_DB=chatpdf_production

# ============================================
# REDIS CONFIGURATION (for BullMQ)
# ============================================
REDIS_PASSWORD=PASTE_GENERATED_PASSWORD_HERE
REDIS_URL=redis://:PASTE_GENERATED_PASSWORD_HERE@redis:6379

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
BETTER_AUTH_SECRET=PASTE_GENERATED_SECRET_HERE
NEXTAUTH_URL=http://YOUR_SERVER_IP

# ============================================
# INTERNAL API SECURITY (REQUIRED)
# ============================================
INTERNAL_API_SECRET=PASTE_GENERATED_SECRET_HERE

# ============================================
# OAUTH PROVIDERS (Optional - leave empty if not using)
# ============================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ============================================
# EMAIL CONFIGURATION (Optional - leave empty if not using)
# ============================================
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=

# ============================================
# AWS S3 CONFIGURATION (Optional - leave empty if not using)
# ============================================
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=

# ============================================
# APPLICATION URLs
# ============================================
# Replace YOUR_SERVER_IP with your actual EC2 Public IP
NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP
NEXT_PUBLIC_API_BASE=http://YOUR_SERVER_IP/api

# ============================================
# QUEUE CONFIGURATION
# ============================================
USE_QUEUE=true
```

---

### **6.5: Important Replacements**

**Replace these placeholders:**

1. **`YOUR_SERVER_IP`** → Your EC2 Public IP (e.g., `54.123.45.67`)
   - Replace in: `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_BASE`

2. **`PASTE_GENERATED_PASSWORD_HERE`** → Use the passwords you generated
   - `POSTGRES_PASSWORD` → Use first generated password
   - `REDIS_PASSWORD` → Use second generated password (use same in REDIS_URL too)

3. **`PASTE_GENERATED_SECRET_HERE`** → Use the secrets you generated
   - `BETTER_AUTH_SECRET` → Use first generated secret
   - `INTERNAL_API_SECRET` → Use second generated secret

4. **API Keys:**
   - `OPENAI_API_KEY` → Your OpenAI API key (starts with `sk-`)
   - `PINECONE_API_KEY` → Your Pinecone API key
   - `PINECONE_INDEX_NAME` → Your Pinecone index name

---

### **6.6: Save the File**

**In nano editor:**

1. Press `Ctrl + X` (to exit)
2. Press `Y` (to confirm save)
3. Press `Enter` (to confirm filename)

**✅ File saved? Let me know!**

---

### **6.7: Verify File Created**

**Check the file exists:**

```bash
ls -la .env.production
```

**View first few lines (to verify, but don't show full content):**

```bash
head -5 .env.production
```

**✅ File created? Let me know!**

---

## ✅ **Step 6 Complete Checklist:**

- [ ] Navigated to project directory
- [ ] Created `.env.production` file
- [ ] Generated secure passwords (4 total)
- [ ] Generated secure secrets (2 total)
- [ ] Filled in database credentials
- [ ] Filled in Redis password
- [ ] Added OpenAI API key
- [ ] Added Pinecone API key and index name
- [ ] Added authentication secrets
- [ ] Added internal API secret
- [ ] Replaced YOUR_SERVER_IP with actual IP
- [ ] Saved file
- [ ] Verified file exists

---

## 🆘 **Troubleshooting:**

### **"Permission denied" when saving:**
- Make sure you're in the project directory
- Check: `pwd` should show `/home/ubuntu/RabbitPDF` or similar

### **Can't generate secrets:**
- Make sure `openssl` is installed: `which openssl`
- If not: `sudo apt install openssl -y`

### **Forgot your server IP:**
- Check AWS Console → EC2 → Instances → Your instance → Public IPv4 address
- Or run: `curl ifconfig.me` (from server)

---

## 🚀 **Next Step:**

Once `.env.production` is created and filled in, tell me: **"Environment file created"** or **"Step 6 complete"**

Then we'll move to **Step 7: Update CORS Configuration** 🌐

---

## 💡 **Quick Reference:**

**Generate secrets:**
```bash
openssl rand -base64 32  # For BETTER_AUTH_SECRET and INTERNAL_API_SECRET
openssl rand -base64 24  # For passwords
```

**Edit file:**
```bash
nano .env.production
```

**Save in nano:**
- `Ctrl + X` → `Y` → `Enter`

**Ready to create your environment file? Let me know if you need help!** 🔐

