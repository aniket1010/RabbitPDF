# ✅ AWS Deployment Checklist

Use this checklist to track your deployment progress.

## 📋 Pre-Deployment

### AWS Setup
- [ ] AWS account created
- [ ] Credit card added (for verification)
- [ ] Account verified
- [ ] AWS Console access confirmed

### Server Setup
- [ ] EC2 instance created
- [ ] Instance type selected (t2.micro for free tier)
- [ ] Key pair created and downloaded (.pem file)
- [ ] Security group configured (SSH, HTTP, HTTPS)
- [ ] Instance launched and running
- [ ] Public IP address noted

### Local Setup
- [ ] SSH client installed (Windows: PowerShell, Mac/Linux: Terminal)
- [ ] Key file permissions set correctly
- [ ] Can connect to server via SSH

### Application Setup
- [ ] Repository cloned on server
- [ ] All API keys ready:
  - [ ] OpenAI API key
  - [ ] Pinecone API key
  - [ ] OAuth credentials (if using)
  - [ ] SMTP credentials (if using)
  - [ ] AWS S3 credentials (if using)

---

## 🚀 Deployment Steps

### Step 1: Server Configuration
- [ ] Connected to server via SSH
- [ ] System updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Docker permissions configured
- [ ] Git installed
- [ ] Repository cloned

### Step 2: Environment Configuration
- [ ] `.env.production` file created
- [ ] All environment variables filled in:
  - [ ] Database credentials
  - [ ] Redis password
  - [ ] OpenAI API key
  - [ ] Pinecone credentials
  - [ ] Auth secret generated
  - [ ] Application URLs set
- [ ] CORS configuration updated
- [ ] Secrets generated securely

### Step 3: Application Deployment
- [ ] Docker images built successfully
- [ ] All containers started
- [ ] Services running:
  - [ ] Frontend container
  - [ ] Backend container
  - [ ] Worker container
  - [ ] Postgres container
  - [ ] Redis container
- [ ] Database migrations run
- [ ] Migrations completed successfully

### Step 4: Testing
- [ ] Backend health check passes (`/health`)
- [ ] Frontend accessible
- [ ] Can access application via IP address
- [ ] PDF upload works
- [ ] PDF processing completes
- [ ] Chat functionality works
- [ ] WebSocket connections work

### Step 5: Nginx Setup
- [ ] Nginx installed
- [ ] Configuration file created
- [ ] Site enabled
- [ ] Default site removed
- [ ] Configuration tested (`nginx -t`)
- [ ] Nginx restarted
- [ ] Application accessible via port 80

### Step 6: Domain & SSL (Optional)
- [ ] Domain name purchased/configured
- [ ] Elastic IP allocated
- [ ] Elastic IP associated with instance
- [ ] DNS A record configured
- [ ] DNS propagation verified
- [ ] Environment variables updated with domain
- [ ] CORS updated with domain
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS

---

## 🔍 Post-Deployment Verification

### Service Health
- [ ] All containers running (`docker-compose ps`)
- [ ] No error logs (`docker-compose logs`)
- [ ] Database accessible
- [ ] Redis accessible
- [ ] Worker processing jobs

### Application Functionality
- [ ] User can sign up/login
- [ ] User can upload PDF
- [ ] PDF processing completes
- [ ] User can chat with PDF
- [ ] Real-time updates work (WebSocket)
- [ ] Messages save correctly
- [ ] Conversations load correctly

### Performance
- [ ] Response times acceptable
- [ ] No memory issues
- [ ] No CPU spikes
- [ ] File uploads work
- [ ] Large PDFs process successfully

### Security
- [ ] Strong passwords set
- [ ] Security group configured correctly
- [ ] SSH key secured
- [ ] Environment variables not exposed
- [ ] SSL certificate valid (if configured)
- [ ] CORS configured correctly

---

## 📊 Monitoring Setup

### Logs
- [ ] Know how to view logs (`docker-compose logs -f`)
- [ ] Know how to view specific service logs
- [ ] Log rotation configured (optional)

### Monitoring
- [ ] AWS CloudWatch configured (optional)
- [ ] Alerts set up (optional)
- [ ] Backup strategy planned

### Maintenance
- [ ] Know how to restart services
- [ ] Know how to update application
- [ ] Know how to rollback if needed
- [ ] Backup process documented

---

## 💰 Cost Management

- [ ] Understand AWS free tier limits
- [ ] Monitoring AWS costs
- [ ] Set up billing alerts (optional)
- [ ] Know how to stop/start instance
- [ ] Understand instance pricing

---

## 🆘 Troubleshooting Prepared

- [ ] Know how to check service status
- [ ] Know how to view logs
- [ ] Know how to restart services
- [ ] Know how to check security groups
- [ ] Have support resources bookmarked

---

## 📝 Notes

**Deployment Date:** _______________

**Server IP:** _______________

**Domain:** _______________

**Key File Location:** _______________

**Issues Encountered:**
- 

**Solutions Applied:**
- 

---

## ✅ Final Checklist

- [ ] Application fully deployed
- [ ] All services running
- [ ] Application tested and working
- [ ] Domain configured (if applicable)
- [ ] SSL configured (if applicable)
- [ ] Monitoring in place
- [ ] Documentation reviewed
- [ ] Team notified (if applicable)

---

## 🎉 Deployment Complete!

Your application is now live on AWS!

**Next Steps:**
1. Monitor for first 24 hours
2. Set up automated backups
3. Configure monitoring alerts
4. Plan for scaling

**Useful Commands:**
```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Check status
docker-compose -f docker-compose.production.yml ps

# Restart services
docker-compose -f docker-compose.production.yml restart

# Update application
git pull
docker-compose -f docker-compose.production.yml up -d --build
```

