# 🚀 AWS Deployment Plan - Beginner's Guide

## 📋 Overview

This guide will help you deploy your ChatPDF application to AWS using Docker. We'll use **AWS EC2** (a virtual server) which is the simplest option for beginners.

**What you'll learn:**
- How to create an AWS account
- How to set up an EC2 server
- How to deploy your Docker containers
- How to configure domain and SSL

**Time estimate:** 2-3 hours (first time)

---

## 🎯 Prerequisites

Before we start, make sure you have:
- [ ] AWS account (we'll create one)
- [ ] Domain name (optional, but recommended)
- [ ] Credit card (AWS free tier available)
- [ ] Your application code ready
- [ ] All API keys (OpenAI, Pinecone, etc.)

---

## 📚 Part 1: Understanding AWS Basics

### **What is AWS?**

AWS (Amazon Web Services) = Cloud computing platform
- Provides servers, databases, storage in the cloud
- Pay only for what you use
- Free tier available for beginners

### **What We'll Use:**

1. **EC2 (Elastic Compute Cloud)** = Virtual server
   - Like renting a computer in the cloud
   - Runs your Docker containers
   - Pay by the hour

2. **Elastic IP** = Fixed IP address
   - Your server keeps the same IP
   - Needed for domain name

3. **Security Groups** = Firewall rules
   - Controls what traffic can reach your server
   - Allows HTTP, HTTPS, SSH

---

## 🚀 Part 2: Step-by-Step Deployment

### **Step 1: Create AWS Account (15 minutes)**

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Enter your email and password
4. Enter payment information (required, but free tier available)
5. Verify your phone number
6. Choose "Basic Support" (free)
7. **Important:** Complete account verification

**Free Tier Benefits:**
- 750 hours/month of EC2 (t2.micro instance)
- 5 GB storage
- Enough for small applications!

---

### **Step 2: Create EC2 Instance (20 minutes)**

#### **2.1 Launch Instance**

1. Log into AWS Console
2. Search for "EC2" in the search bar
3. Click "EC2" service
4. Click "Launch Instance" button

#### **2.2 Configure Instance**

**Name:**
- Name: `chatpdf-server`

**Application and OS Images:**
- Choose: **Ubuntu** (latest LTS version, e.g., Ubuntu Server 22.04 LTS)
- Architecture: 64-bit (x86)

**Instance Type:**
- Choose: **t2.micro** (Free tier eligible)
- For production, consider t3.small or t3.medium

**Key Pair:**
- Click "Create new key pair"
- Name: `chatpdf-key`
- Key pair type: RSA
- Private key file format: `.pem`
- Click "Create key pair"
- **IMPORTANT:** Download the `.pem` file and save it securely!

**Network Settings:**
- Click "Edit"
- Auto-assign Public IP: Enable
- Firewall (security groups): Create security group
- Allow SSH traffic from: My IP (or 0.0.0.0/0 for testing, but less secure)
- Allow HTTP traffic from: 0.0.0.0/0
- Allow HTTPS traffic from: 0.0.0.0/0

**Configure Storage:**
- Size: 20 GB (free tier: 30 GB)
- Volume type: gp3

**Click "Launch Instance"**

#### **2.3 Wait for Instance**

- Status will change from "pending" to "running"
- Takes 1-2 minutes
- Note the **Public IPv4 address** (e.g., 54.123.45.67)

---

### **Step 3: Connect to Your Server (10 minutes)**

#### **3.1 On Windows (PowerShell):**

```powershell
# Navigate to where you saved the .pem file
cd C:\Users\YourName\Downloads

# Set permissions (Windows)
icacls chatpdf-key.pem /inheritance:r
icacls chatpdf-key.pem /grant:r "%username%:R"

# Connect to server (replace with your IP)
ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP
```

#### **3.2 On Mac/Linux:**

```bash
# Navigate to where you saved the .pem file
cd ~/Downloads

# Set permissions
chmod 400 chatpdf-key.pem

# Connect to server (replace with your IP)
ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP
```

**First time connecting:**
- Type "yes" when asked about authenticity
- You should see: `ubuntu@ip-xxx-xxx-xxx-xxx:~$`

---

### **Step 4: Install Docker on Server (15 minutes)**

Once connected to your server, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in for docker group to take effect
exit
```

**Reconnect:**
```bash
ssh -i chatpdf-key.pem ubuntu@YOUR_SERVER_IP
```

---

### **Step 5: Install Git and Clone Repository (10 minutes)**

```bash
# Install Git
sudo apt install git -y

# Clone your repository
cd ~
git clone https://github.com/yourusername/chatpdf.git
cd chatpdf

# Verify files are there
ls -la
```

**Alternative:** If your repo is private, you'll need to set up SSH keys or use a personal access token.

---

### **Step 6: Create Environment File (10 minutes)**

```bash
# Create .env.production file
cd ~/chatpdf
nano .env.production
```

**Paste this template and fill in your values:**

```env
# Database
POSTGRES_USER=chatpdf_user
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
POSTGRES_DB=chatpdf_production

# Redis
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD
REDIS_URL=redis://:CHANGE_THIS_REDIS_PASSWORD@redis:6379

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Pinecone
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=chatpdf-production

# Authentication (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=generate-64-character-random-string
NEXTAUTH_URL=http://YOUR_SERVER_IP

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@gmail.com

# AWS S3 (Optional - for file storage)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=chatpdf-uploads-production
AWS_REGION=us-east-1

# Application URLs (use your server IP for now)
NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP
NEXT_PUBLIC_API_BASE=http://YOUR_SERVER_IP/api

# Queue Configuration
USE_QUEUE=true
```

**To save in nano:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

**Generate secrets:**
```bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Generate passwords
openssl rand -base64 24
```

---

### **Step 7: Update CORS Configuration (5 minutes)**

```bash
# Edit CORS config
nano backend/config/cors.js
```

**Update allowed origins:**
```javascript
const allowedOrigins = [
  'http://YOUR_SERVER_IP',
  'https://yourdomain.com',  // Add when you have domain
  'https://www.yourdomain.com',
];
```

---

### **Step 8: Deploy Application (15 minutes)**

```bash
# Make sure you're in the project directory
cd ~/chatpdf

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Start all services
docker-compose -f docker-compose.production.yml up -d --build

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

**Wait for services to start (2-3 minutes)**

---

### **Step 9: Run Database Migrations (5 minutes)**

```bash
# Wait for database to be ready
sleep 30

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy

# Verify migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate status
```

---

### **Step 10: Test Your Application (5 minutes)**

```bash
# Check if services are running
docker-compose -f docker-compose.production.yml ps

# Test backend health
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000
```

**Open in browser:**
- Go to `http://YOUR_SERVER_IP:3000` (frontend)
- Go to `http://YOUR_SERVER_IP:5000/health` (backend health check)

---

### **Step 11: Setup Nginx Reverse Proxy (20 minutes)**

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/chatpdf
```

**Paste this configuration:**

```nginx
# Upstream for backend API
upstream backend {
    server localhost:5000;
    keepalive 64;
}

# Upstream for frontend
upstream frontend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name YOUR_SERVER_IP;  # Replace with your IP or domain

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # API routes
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        client_max_body_size 50M;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Health check
    location /health {
        proxy_pass http://backend;
        access_log off;
    }
}
```

**Enable site:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/chatpdf /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Test:**
- Go to `http://YOUR_SERVER_IP` (should show your app!)

---

### **Step 12: Setup Domain Name (Optional, 30 minutes)**

#### **12.1 Get Elastic IP**

```bash
# In AWS Console:
# 1. Go to EC2 → Elastic IPs
# 2. Click "Allocate Elastic IP address"
# 3. Click "Allocate"
# 4. Select the IP → Actions → Associate Elastic IP address
# 5. Select your instance → Associate
```

#### **12.2 Configure DNS**

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS settings
3. Add A record:
   - Name: `@` (or leave blank)
   - Value: Your Elastic IP
   - TTL: 3600
4. Add A record for www:
   - Name: `www`
   - Value: Your Elastic IP
   - TTL: 3600

**Wait 5-10 minutes for DNS to propagate**

#### **12.3 Update Environment Variables**

```bash
# Edit .env.production
nano ~/chatpdf/.env.production
```

**Update:**
```env
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_BASE=https://yourdomain.com/api
```

**Update CORS:**
```bash
nano ~/chatpdf/backend/config/cors.js
```

**Add your domain to allowed origins**

**Restart services:**
```bash
cd ~/chatpdf
docker-compose -f docker-compose.production.yml restart
```

---

### **Step 13: Setup SSL Certificate (15 minutes)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

**Update Nginx config:**
Certbot automatically updates your Nginx config for HTTPS!

**Test:**
- Go to `https://yourdomain.com` (should work!)

---

## 🔧 Part 3: Post-Deployment

### **Monitor Your Application**

```bash
# View all logs
docker-compose -f docker-compose.production.yml logs -f

# View specific service logs
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f worker
docker-compose -f docker-compose.production.yml logs -f frontend

# Check service status
docker-compose -f docker-compose.production.yml ps

# Check resource usage
docker stats
```

### **Useful Commands**

```bash
# Restart all services
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend

# Stop all services
docker-compose -f docker-compose.production.yml stop

# Start all services
docker-compose -f docker-compose.production.yml start

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```

---

## 💰 Part 4: Cost Management

### **Free Tier Limits:**
- 750 hours/month of t2.micro EC2
- 5 GB storage
- 15 GB data transfer out

### **Estimated Monthly Cost (after free tier):**
- t2.micro: ~$8-10/month
- Storage: ~$1/month
- Data transfer: Varies (first 1 GB free)

**Total: ~$10-15/month for small application**

### **Cost Optimization Tips:**
1. Use t2.micro for development
2. Stop instance when not in use
3. Use Elastic IP (free when attached to running instance)
4. Monitor usage in AWS Cost Explorer

---

## 🚨 Troubleshooting

### **Can't Connect via SSH**

```bash
# Check security group allows SSH from your IP
# In AWS Console: EC2 → Security Groups → Inbound Rules
# Add rule: SSH, Source: Your IP

# Check instance is running
# In AWS Console: EC2 → Instances
```

### **Services Not Starting**

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs

# Check Docker is running
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker
```

### **Port Already in Use**

```bash
# Check what's using port
sudo lsof -i :5000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 PID
```

### **Out of Memory**

```bash
# Check memory usage
free -h

# If needed, upgrade instance type:
# 1. Stop instance
# 2. Change instance type (t2.small or t3.small)
# 3. Start instance
```

---

## ✅ Deployment Checklist

- [ ] AWS account created
- [ ] EC2 instance created and running
- [ ] Connected via SSH
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned
- [ ] Environment file created
- [ ] CORS configuration updated
- [ ] Services deployed and running
- [ ] Database migrations completed
- [ ] Application accessible via IP
- [ ] Nginx configured
- [ ] Domain configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Application tested and working

---

## 🎉 Success!

Your application should now be running on AWS!

**Access your app:**
- `http://YOUR_SERVER_IP` (or `https://yourdomain.com` if configured)

**Next Steps:**
1. Monitor logs for first few hours
2. Set up automated backups
3. Configure monitoring (CloudWatch)
4. Set up CI/CD pipeline

---

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## 🆘 Need Help?

Common issues:
1. **Can't connect:** Check security group rules
2. **Services not starting:** Check logs with `docker-compose logs`
3. **Out of memory:** Upgrade instance type
4. **Domain not working:** Check DNS propagation (can take 24-48 hours)

For detailed troubleshooting, see `DEPLOYMENT-PLAN.md`.

