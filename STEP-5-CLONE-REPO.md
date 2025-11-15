# 📦 Step 5: Clone Repository and Setup

Let's get your code on the server and configure it!

---

## 🎯 **Goal:** Clone your repository and prepare for deployment

**Time:** 10-15 minutes

**You should be:** Connected to server, Docker installed

---

## 📝 **Step-by-Step Instructions:**

### **5.1: Install Git**

**Run:**

```bash
sudo apt install git -y
```

**What it does:** Installs Git so we can clone your repository

**✅ Git installed? Let me know!**

---

### **5.2: Clone Your Repository**

**You need your repository URL. Is your repo:**
- **Public?** → Use HTTPS URL
- **Private?** → We'll need to set up authentication

**For Public Repository:**

```bash
# Navigate to home directory
cd ~

# Clone repository (replace with YOUR repository URL)
git clone https://github.com/yourusername/chatpdf.git

# Navigate into project
cd chatpdf

# Verify files are there
ls -la
```

**For Private Repository:**

We'll need to set up SSH keys or use a personal access token. Let me know if your repo is private!

**✅ Repository cloned? Do you see your project files? Let me know!**

---

### **5.3: Verify Project Structure**

**Check that you have:**

```bash
# Check main directories exist
ls -d backend frontend

# Check docker-compose file exists
ls docker-compose.production.yml

# Check environment template exists
ls .env.production.template
```

**Expected:** You should see `backend`, `frontend` directories and `docker-compose.production.yml`

**✅ Files verified? Let me know!**

---

## 🆘 **Troubleshooting:**

### **"Repository not found" error:**
- Check repository URL is correct
- If private repo, you need authentication (SSH keys or token)

### **"Permission denied" for private repo:**
- We'll set up SSH keys or use personal access token
- Let me know and I'll guide you

### **Can't find docker-compose.production.yml:**
- Make sure you're in the project root directory
- Check: `pwd` should show `/home/ubuntu/chatpdf`

---

## 🚀 **Next Step:**

Once repository is cloned, tell me: **"Repository cloned"** or **"Step 5 complete"**

Then we'll move to **Step 6: Create Environment File** 🔐

---

## 💡 **Quick Reference:**

**All commands:**

```bash
# Install Git
sudo apt install git -y

# Clone repository
cd ~
git clone https://github.com/yourusername/chatpdf.git
cd chatpdf

# Verify
ls -la
ls -d backend frontend
ls docker-compose.production.yml
```

**Ready to clone? Let me know your repository URL or if you need help with private repo setup!** 📦

