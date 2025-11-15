# 🐳 Step 4: Install Docker and Docker Compose

Let's install Docker on your server so we can run your application!

---

## 🎯 **Goal:** Install Docker and Docker Compose on your Ubuntu server

**Time:** 10-15 minutes

**You should be:** Connected to your server via SSH (you should see `ubuntu@ip-xxx:~$`)

---

## 📝 **Step-by-Step Instructions:**

### **4.1: Update System**

**Copy and paste this command:**

```bash
sudo apt update && sudo apt upgrade -y
```

**What it does:** Updates your system packages to latest versions

**⏱️ Time:** 2-5 minutes (depends on updates)

**✅ When done, you'll see the prompt again. Let me know!**

---

### **4.2: Install Docker**

**Copy and paste these commands one by one:**

```bash
# Download Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
```

**Then:**

```bash
# Run Docker installation script
sudo sh get-docker.sh
```

**What it does:** Installs Docker automatically

**⏱️ Time:** 2-3 minutes

**✅ When done, you should see: "Docker installed successfully" or similar. Let me know!**

---

### **4.3: Add Your User to Docker Group**

**Copy and paste:**

```bash
# Add ubuntu user to docker group (so you can run docker without sudo)
sudo usermod -aG docker ubuntu
```

**What it does:** Allows you to run Docker commands without typing `sudo` every time

**✅ Command completed? Let me know!**

---

### **4.4: Install Docker Compose**

**Copy and paste:**

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

**Then:**

```bash
# Make Docker Compose executable
sudo chmod +x /usr/local/bin/docker-compose
```

**What it does:** Installs Docker Compose (needed to run multiple containers)

**✅ Both commands completed? Let me know!**

---

### **4.5: Log Out and Back In**

**Important:** You need to log out and reconnect for Docker group changes to take effect.

**Type:**

```bash
exit
```

**Then reconnect:**

```bash
# In your local PowerShell, reconnect:
ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP
```

**✅ Are you reconnected? Let me know!**

---

### **4.6: Verify Installation**

**Test Docker:**

```bash
docker --version
```

**Expected output:** `Docker version 24.x.x` or similar

**Test Docker Compose:**

```bash
docker-compose --version
```

**Expected output:** `Docker Compose version v2.x.x` or similar

**Test Docker works:**

```bash
docker ps
```

**Expected output:** Empty list (no containers running yet) - this is normal!

**✅ Do you see version numbers? Let me know!**

---

## ✅ **Step 4 Complete Checklist:**

- [ ] System updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] Docker installed (`sudo sh get-docker.sh`)
- [ ] User added to docker group (`sudo usermod -aG docker ubuntu`)
- [ ] Docker Compose installed
- [ ] Logged out and reconnected
- [ ] Verified Docker version (`docker --version`)
- [ ] Verified Docker Compose version (`docker-compose --version`)
- [ ] Tested Docker (`docker ps`)

---

## 🆘 **Troubleshooting:**

### **"Permission denied" when running docker:**
- Make sure you logged out and reconnected after adding user to docker group
- Try: `newgrp docker` (temporary fix)

### **"Command not found" for docker-compose:**
- Check installation: `ls -la /usr/local/bin/docker-compose`
- If missing, reinstall Docker Compose

### **Docker installation fails:**
- Check internet connection: `ping google.com`
- Try again: `sudo sh get-docker.sh`

---

## 🚀 **Next Step:**

Once Docker is installed and verified, tell me: **"Docker installed"** or **"Step 4 complete"**

Then we'll move to **Step 5: Clone Repository** 📦

---

## 💡 **Quick Reference:**

**All commands in order:**

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Add user to docker group
sudo usermod -aG docker ubuntu

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Log out
exit

# 6. Reconnect (from your local machine)
ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP

# 7. Verify
docker --version
docker-compose --version
docker ps
```

**Ready to install Docker? Follow the steps above!** 🐳

