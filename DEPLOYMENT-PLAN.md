# 🚀 ChatPDF Deployment Plan - Today's Deployment

## 📋 Quick Overview

This is a **step-by-step deployment plan** to get your ChatPDF application running in production **today**. The application uses:
- **Backend**: Express.js API with Socket.IO for WebSockets
- **Frontend**: Next.js 15 application
- **Database**: PostgreSQL
- **Queue System**: Redis + BullMQ for PDF processing
- **Worker**: Separate worker process for background PDF processing

---

## 🔍 Understanding Your Architecture

### **Redis/BullMQ Queue System**

**How it works:**
1. When a PDF is uploaded via `/upload`, the backend creates a job in the BullMQ queue
2. The **worker process** (`pdfProcessorWorker.js`) listens to the queue and processes PDFs in the background
3. Redis stores the job queue and job state
4. After processing, the worker notifies the API via HTTP call to `/internal/pdf-complete`
5. The API then emits WebSocket events to notify clients

**Configuration:**
- Queue name: `pdf-processing`
- Redis connection: Configured via `REDIS_URL` environment variable
- Worker: Runs as separate Docker container with `npm run worker` command
- Fallback: If queue is unavailable, falls back to inline processing

**Files involved:**
- `backend/queues/pdfProcessingQueue.js` - Queue definition
- `backend/workers/pdfProcessorWorker.js` - Worker that processes jobs
- `backend/routes/upload.js` - Adds jobs to queue when `USE_QUEUE=true`

### **WebSocket System**

**How it works:**
1. Socket.IO server runs on the same Express server (port 5000)
2. Clients connect via `socket.io-client` from the frontend
3. Authentication happens via middleware using JWT tokens
4. Users join rooms: `user_{userId}` and `conversation_{conversationId}`
5. Real-time events:
   - `message-processing-started` - When AI starts processing
   - `ai-thinking` - When AI is generating response
   - `ai-response-complete` - When response is ready
   - `pdf-processing-complete` - When PDF processing finishes
   - `message-error` - When errors occur

**Configuration:**
- CORS configured in `backend/config/cors.js`
- WebSocket setup in `backend/websocket.js`
- Frontend hook: `frontend/src/hooks/useWebSocket.ts`

---

## ⚡ Quick Start Deployment (Today)

### **Prerequisites Checklist**

- [ ] Server with Docker & Docker Compose installed
- [ ] Domain name (or IP address)
- [ ] OpenAI API key
- [ ] Pinecone API key and index name
- [ ] OAuth credentials (Google/GitHub) - Optional
- [ ] SMTP credentials for email - Optional
- [ ] AWS S3 credentials (if using S3 storage) - Optional

### **Step 1: Server Setup (15 minutes)**

```bash
# SSH into your server
ssh user@your-server-ip

# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for Docker group to take effect
exit
ssh user@your-server-ip
```

### **Step 2: Clone and Prepare Repository (5 minutes)**

```bash
# Clone your repository
git clone https://github.com/yourusername/chatpdf.git
cd chatpdf

# Make deployment script executable
chmod +x scripts/deploy.sh
```

### **Step 3: Create Environment Files (10 minutes)**

Create `.env.production` file in the project root:

```bash
# Create .env.production in project root
cat > .env.production << 'EOF'
# Database
POSTGRES_USER=chatpdf_user
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
POSTGRES_DB=chatpdf_production

# Redis
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD
REDIS_URL=redis://:CHANGE_THIS_REDIS_PASSWORD@redis:6379

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=chatpdf-production

# Authentication
BETTER_AUTH_SECRET=generate-64-character-random-string-here
NEXTAUTH_URL=https://yourdomain.com

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# SMTP (Optional - for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@gmail.com

# AWS S3 (Optional - if using S3 for file storage)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=chatpdf-uploads-production
AWS_REGION=us-east-1

# Application URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_BASE=https://yourdomain.com/api

# Queue Configuration
USE_QUEUE=true
EOF

# Generate secure secrets
echo "Generate BETTER_AUTH_SECRET:"
openssl rand -base64 32
```

**Important:** Replace all placeholder values with your actual credentials!

### **Step 4: Update CORS Configuration (2 minutes)**

Edit `backend/config/cors.js` and replace `yourdomain.com` with your actual domain:

```javascript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];
```

### **Step 5: Deploy Application (10 minutes)**

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Build and start all services
docker-compose -f docker-compose.production.yml up -d --build

# Check logs
docker-compose -f docker-compose.production.yml logs -f
```

### **Step 6: Run Database Migrations (2 minutes)**

```bash
# Wait for database to be ready
sleep 30

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

### **Step 7: Setup Nginx Reverse Proxy (10 minutes)**

```bash
# Install Nginx
sudo apt update
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/chatpdf
```

Paste this configuration (replace `yourdomain.com`):

```nginx
# Upstream for backend API
upstream backend {
    server localhost:5000;
}

# Upstream for frontend
upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    # For now, allow HTTP (remove after SSL setup)
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
        
        # WebSocket support
        proxy_set_header Connection "upgrade";
    }

    # WebSocket upgrade
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/chatpdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 8: Setup SSL Certificate (5 minutes)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

### **Step 9: Verify Deployment (5 minutes)**

```bash
# Check all services are running
docker-compose -f docker-compose.production.yml ps

# Check health endpoints
curl http://localhost:5000/health
curl http://localhost:3000/api/health

# Check logs for errors
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs worker
docker-compose -f docker-compose.production.yml logs frontend
```

### **Step 10: Test the Application**

1. Visit `https://yourdomain.com` (or `http://yourdomain.com` if no SSL yet)
2. Try uploading a PDF
3. Check that:
   - PDF uploads successfully
   - Processing status updates in real-time (WebSocket)
   - You can chat with the PDF
   - Messages appear in real-time

---

## 🔧 Troubleshooting

### **Redis Connection Issues**

```bash
# Check Redis is running
docker-compose -f docker-compose.production.yml exec redis redis-cli ping

# Check Redis logs
docker-compose -f docker-compose.production.yml logs redis

# Test connection from backend
docker-compose -f docker-compose.production.yml exec backend node -e "const {connection} = require('./queues/pdfProcessingQueue'); console.log(connection)"
```

### **Worker Not Processing Jobs**

```bash
# Check worker logs
docker-compose -f docker-compose.production.yml logs worker

# Check queue status
docker-compose -f docker-compose.production.yml exec backend node -e "const {pdfProcessingQueue} = require('./queues/pdfProcessingQueue'); pdfProcessingQueue.getJobs().then(jobs => console.log('Jobs:', jobs.length))"
```

### **WebSocket Connection Issues**

1. Check CORS configuration in `backend/config/cors.js`
2. Verify Nginx WebSocket configuration
3. Check browser console for connection errors
4. Verify Socket.IO version compatibility

### **Database Connection Issues**

```bash
# Check database is accessible
docker-compose -f docker-compose.production.yml exec postgres psql -U chatpdf_user -d chatpdf_production -c "SELECT 1"

# Check migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate status
```

---

## 📊 Monitoring

### **View Logs**

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f worker
docker-compose -f docker-compose.production.yml logs -f frontend
```

### **Check Service Status**

```bash
# Service status
docker-compose -f docker-compose.production.yml ps

# Resource usage
docker stats
```

---

## 🔄 Updates and Maintenance

### **Update Application**

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

# Run migrations if needed
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

### **Backup Database**

```bash
# Create backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U chatpdf_user chatpdf_production > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20250101.sql | docker-compose -f docker-compose.production.yml exec -T postgres psql -U chatpdf_user chatpdf_production
```

---

## 🎯 Success Checklist

- [ ] All Docker containers are running
- [ ] Database migrations completed
- [ ] Backend health check passes (`/health`)
- [ ] Frontend loads correctly
- [ ] PDF upload works
- [ ] PDF processing completes (check worker logs)
- [ ] WebSocket connections work (real-time updates)
- [ ] Chat functionality works
- [ ] SSL certificate installed (if using domain)
- [ ] Nginx reverse proxy configured correctly

---

## 🚨 Emergency Rollback

If something goes wrong:

```bash
# Stop all services
docker-compose -f docker-compose.production.yml down

# Restore from backup
# (Follow backup restore steps above)

# Or use deployment script
./scripts/deploy.sh production rollback
```

---

## 📝 Notes

- **Queue System**: The application uses BullMQ with Redis. Make sure Redis is running before starting the worker.
- **WebSockets**: Socket.IO requires proper CORS configuration and Nginx WebSocket support.
- **Worker**: The worker runs as a separate container. You can scale it by running multiple worker containers.
- **File Storage**: Currently uses local storage in `backend/uploads`. Consider migrating to S3 for production.

---

## 🎉 You're Done!

Your ChatPDF application should now be running in production. Monitor the logs for the first few hours to ensure everything is working correctly.

**Next Steps:**
1. Set up monitoring (Prometheus/Grafana - see `monitoring/` directory)
2. Configure automated backups
3. Set up CI/CD pipeline (see `.github/workflows/deploy.yml`)
4. Review security checklist (see `SECURITY-CHECKLIST.md`)

