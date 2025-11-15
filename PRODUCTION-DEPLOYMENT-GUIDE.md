# 🚀 **Complete Production Deployment Guide for ChatPDF**

This comprehensive guide will take you through the entire process of deploying your ChatPDF application to production.

## **📋 Prerequisites**

### **Development Environment**
- Node.js 18+
- Docker & Docker Compose
- Git
- PostgreSQL (for local development)
- Redis (for local development)

### **Production Environment**
- Production server (AWS EC2, VPS, etc.)
- Domain name with DNS control
- SSL certificate (Let's Encrypt recommended)
- Email service (Gmail, SendGrid, etc.)

### **External Services Setup**
1. **OpenAI Account**: Get API key with GPT-4 access
2. **Pinecone Account**: Create vector database index
3. **OAuth Apps**: Set up Google and GitHub OAuth applications
4. **Cloud Storage**: AWS S3 or equivalent (for file storage)
5. **Email Service**: SMTP credentials

---

## **Phase 1: Infrastructure Setup**

### **1.1 Server Preparation**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### **1.2 DNS Configuration**

Set up DNS records for your domain:
- **A Record**: `yourdomain.com` → Your server IP
- **A Record**: `www.yourdomain.com` → Your server IP
- **A Record**: `api.yourdomain.com` → Your server IP (optional)

### **1.3 SSL Certificate Setup**

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Set up auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## **Phase 2: External Services Configuration**

### **2.1 OpenAI Setup**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create API key with GPT-4 access
3. Set usage limits and monitoring

### **2.2 Pinecone Setup**
```bash
# Create index with 1536 dimensions (for OpenAI embeddings)
curl -X POST "https://api.pinecone.io/indexes" \
  -H "Api-Key: YOUR_PINECONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "chatpdf-production",
    "dimension": 1536,
    "metric": "cosine"
  }'
```

### **2.3 OAuth Applications**

#### **Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`

#### **GitHub OAuth Setup**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL:
   - `https://yourdomain.com/api/auth/callback/github`

### **2.4 Email Service Setup**
For Gmail:
1. Enable 2-factor authentication
2. Generate App Password
3. Use app password in SMTP_PASS

---

## **Phase 3: Application Deployment**

### **3.1 Clone Repository**

```bash
# Clone your repository
git clone https://github.com/yourusername/chatpdf.git
cd chatpdf

# Make deployment script executable
chmod +x scripts/deploy.sh
```

### **3.2 Environment Configuration**

Create production environment files:

**Backend (.env.production):**
```env
# Database
DATABASE_URL="postgresql://chatpdf_user:STRONG_PASSWORD@postgres:5432/chatpdf_production"

# Redis
REDIS_URL="redis://redis:6379"

# OpenAI
OPENAI_API_KEY="sk-your-openai-key"

# Pinecone
PINECONE_API_KEY="your-pinecone-key"
PINECONE_INDEX_NAME="chatpdf-production"

# Authentication
BETTER_AUTH_SECRET="your-64-character-secure-secret"
NEXTAUTH_URL="https://yourdomain.com"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
MAIL_FROM="your-email@gmail.com"

# Server
NODE_ENV="production"
PORT="5000"
HOST="0.0.0.0"

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="chatpdf-uploads-production"
AWS_REGION="us-east-1"
```

**Frontend (.env.production):**
```env
# Authentication
BETTER_AUTH_SECRET="your-64-character-secure-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# API
NEXT_PUBLIC_API_BASE="https://yourdomain.com/api"

# Database
DATABASE_URL="postgresql://chatpdf_user:STRONG_PASSWORD@postgres:5432/chatpdf_production"

NODE_ENV="production"
```

### **3.3 Update Configuration Files**

Update domain names in:
- `backend/config/cors.js` - Add your domain
- `nginx.conf` - Replace `yourdomain.com` with your actual domain
- `docker-compose.production.yml` - Update any domain references

### **3.4 Deploy Application**

```bash
# Run the deployment script
./scripts/deploy.sh production deploy

# Or deploy manually:
docker-compose -f docker-compose.production.yml up -d
```

### **3.5 Configure Nginx**

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/chatpdf
sudo ln -s /etc/nginx/sites-available/chatpdf /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## **Phase 4: Security Implementation**

### **4.1 Firewall Configuration**

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### **4.2 Fail2Ban Setup**

```bash
# Install and configure fail2ban
sudo apt install fail2ban -y

# Create custom configuration
sudo tee /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

sudo systemctl restart fail2ban
```

### **4.3 Complete Security Checklist**

Follow the complete [Security Checklist](SECURITY-CHECKLIST.md) to ensure all security measures are in place.

---

## **Phase 5: Monitoring Setup**

### **5.1 Deploy Monitoring Stack**

```bash
# Start monitoring services
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana at http://your-server:3001
# Default credentials: admin/admin123
```

### **5.2 Configure Alerts**

Set up alerts for:
- High CPU/Memory usage
- Database connection failures
- API response times
- Error rates
- Disk space usage

---

## **Phase 6: CI/CD Pipeline Setup**

### **6.1 GitHub Secrets Configuration**

Add these secrets to your GitHub repository:

```bash
# Production server access
PRODUCTION_HOST=your-server-ip
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=your-private-key

# API keys
OPENAI_API_KEY=your-openai-key
PINECONE_API_KEY=your-pinecone-key

# Database password
DB_PASSWORD=your-database-password

# Slack notifications (optional)
SLACK_WEBHOOK=your-slack-webhook
```

### **6.2 Enable GitHub Actions**

The CI/CD pipeline in `.github/workflows/deploy.yml` will automatically:
- Run tests on pull requests
- Build and push Docker images
- Deploy to production on main branch pushes
- Send notifications

---

## **Phase 7: Post-Deployment Tasks**

### **7.1 Verify Deployment**

```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Test health endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health
```

### **7.2 Performance Testing**

```bash
# Install Apache Bench
sudo apt install apache2-utils -y

# Test API performance
ab -n 1000 -c 10 https://yourdomain.com/api/health

# Test file upload
curl -F "file=@test.pdf" https://yourdomain.com/api/upload
```

### **7.3 Backup Setup**

```bash
# Set up automated backups
crontab -e

# Add backup schedule (daily at 2 AM)
0 2 * * * /path/to/chatpdf/scripts/deploy.sh production backup
```

---

## **Phase 8: Ongoing Maintenance**

### **8.1 Regular Tasks**

**Daily:**
- Monitor application logs
- Check system resources
- Verify backup completion

**Weekly:**
- Security updates
- Performance review
- Log analysis

**Monthly:**
- Dependency updates
- Security scan
- Backup testing

### **8.2 Update Procedure**

```bash
# Update application
git pull origin main
./scripts/deploy.sh production deploy

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

---

## **🚨 Emergency Procedures**

### **Rollback Deployment**
```bash
./scripts/deploy.sh production rollback
```

### **Database Recovery**
```bash
# Restore from backup
cat backup/database.sql | docker-compose -f docker-compose.production.yml exec -T postgres psql -U chatpdf_user chatpdf_production
```

### **Emergency Contacts**
- System Administrator: [email]
- Database Administrator: [email]
- Security Team: [email]

---

## **📊 Success Metrics**

Monitor these KPIs after deployment:
- Application uptime (target: 99.9%)
- Response time (target: <500ms)
- Error rate (target: <1%)
- PDF processing time (target: <30s)
- User satisfaction scores

---

## **🎉 Deployment Complete!**

Your ChatPDF application is now running in production with:
- ✅ Secure authentication
- ✅ Scalable infrastructure
- ✅ Monitoring and alerting
- ✅ Automated backups
- ✅ CI/CD pipeline
- ✅ Security hardening

**Next Steps:**
1. Monitor the application for the first 24 hours
2. Set up user onboarding and documentation
3. Plan for scaling based on usage patterns
4. Schedule regular security audits

For support or questions about this deployment, refer to the documentation or contact the development team.
