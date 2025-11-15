# ⚡ AWS Quick Start - Deploy in 1 Hour

## 🎯 Fast Track Deployment

This is a condensed version for quick deployment. For detailed explanations, see `AWS-DEPLOYMENT-PLAN.md`.

---

## 📋 Prerequisites

- AWS account
- Domain name (optional)
- API keys ready

---

## 🚀 Quick Steps

### **1. Create AWS Account** (5 min)
- Go to aws.amazon.com
- Sign up (requires credit card, but free tier available)

### **2. Launch EC2 Instance** (10 min)

**In AWS Console:**
1. Search "EC2" → Launch Instance
2. **OS:** Ubuntu Server 22.04 LTS
3. **Instance:** t2.micro (Free tier)
4. **Key Pair:** Create new → Download `.pem` file
5. **Network:** Allow SSH, HTTP, HTTPS
6. **Storage:** 20 GB
7. Launch Instance
8. **Note your Public IP**

### **3. Connect to Server** (5 min)

**Windows (PowerShell):**
```powershell
cd Downloads
icacls chatpdf-key.pem /inheritance:r
icacls chatpdf-key.pem /grant:r "%username%:R"
ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP
```

**Mac/Linux:**
```bash
cd ~/Downloads
chmod 400 chatpdf-key.pem
ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP
```

### **4. Install Docker** (5 min)

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
exit
```

**Reconnect:**
```bash
ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP
```

### **5. Clone Repository** (3 min)

```bash
sudo apt install git -y
cd ~
git clone https://github.com/yourusername/chatpdf.git
cd chatpdf
```

### **6. Create Environment File** (5 min)

```bash
nano .env.production
```

**Paste and fill in values:**
```env
POSTGRES_USER=chatpdf_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
POSTGRES_DB=chatpdf_production
REDIS_PASSWORD=STRONG_PASSWORD_HERE
REDIS_URL=redis://:STRONG_PASSWORD_HERE@redis:6379
OPENAI_API_KEY=sk-your-key
PINECONE_API_KEY=your-key
PINECONE_INDEX_NAME=chatpdf-production
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://YOUR_SERVER_IP
NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP
NEXT_PUBLIC_API_BASE=http://YOUR_SERVER_IP/api
USE_QUEUE=true
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### **7. Update CORS** (2 min)

```bash
nano backend/config/cors.js
```

**Add your server IP to allowed origins**

### **8. Deploy** (10 min)

```bash
export $(cat .env.production | grep -v '^#' | xargs)
docker-compose -f docker-compose.production.yml up -d --build
sleep 30
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

### **9. Setup Nginx** (10 min)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/chatpdf
```

**Paste config from AWS-DEPLOYMENT-PLAN.md Step 11**

```bash
sudo ln -s /etc/nginx/sites-available/chatpdf /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### **10. Test** (2 min)

- Open browser: `http://YOUR_SERVER_IP`
- Should see your app!

---

## ✅ Done!

Your app is now live on AWS!

**Next:**
- Setup domain (optional)
- Setup SSL (optional)
- Monitor logs: `docker-compose logs -f`

---

## 🆘 Quick Troubleshooting

**Can't connect?**
- Check security group allows SSH from your IP

**Services not starting?**
- Check logs: `docker-compose logs`

**Port issues?**
- Check: `sudo lsof -i :5000`

For detailed help, see `AWS-DEPLOYMENT-PLAN.md`.

