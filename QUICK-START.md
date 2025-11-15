# ⚡ Quick Start Deployment Guide

## 🎯 Deploy in 30 Minutes

This is a condensed version of the full deployment plan. Follow these steps to get your app running today.

### **Step 1: Server Setup (5 min)**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in
exit
```

### **Step 2: Clone Repository (2 min)**

```bash
git clone <your-repo-url>
cd chatpdf
chmod +x scripts/deploy.sh
```

### **Step 3: Create Environment File (5 min)**

```bash
# Copy the example file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Required values to set:**
- `POSTGRES_PASSWORD` - Strong password for database
- `REDIS_PASSWORD` - Strong password for Redis
- `OPENAI_API_KEY` - Your OpenAI API key
- `PINECONE_API_KEY` - Your Pinecone API key
- `PINECONE_INDEX_NAME` - Your Pinecone index name
- `BETTER_AUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your domain (e.g., `https://yourdomain.com`)
- `NEXT_PUBLIC_APP_URL` - Same as above
- `NEXT_PUBLIC_API_BASE` - Your API URL (e.g., `https://yourdomain.com/api`)

### **Step 4: Update CORS (1 min)**

Edit `backend/config/cors.js` and replace `yourdomain.com` with your actual domain.

### **Step 5: Deploy (10 min)**

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Start all services
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services to start
sleep 30

# Run database migrations
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy

# Check status
docker-compose -f docker-compose.production.yml ps
```

### **Step 6: Setup Nginx (5 min)**

```bash
# Install Nginx
sudo apt update && sudo apt install nginx -y

# Copy config (update domain name first!)
sudo cp nginx.conf /etc/nginx/sites-available/chatpdf
sudo nano /etc/nginx/sites-available/chatpdf  # Update domain name

# Enable site
sudo ln -s /etc/nginx/sites-available/chatpdf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 7: SSL Certificate (5 min)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### **Step 8: Verify (2 min)**

```bash
# Check all services
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Test endpoints
curl http://localhost:5000/health
curl http://localhost:3000/api/health
```

Visit `https://yourdomain.com` and test the application!

---

## 🔍 Understanding Your Stack

### **Redis/BullMQ Queue System**

- **Purpose**: Background PDF processing
- **How it works**:
  1. PDF upload → Job added to queue
  2. Worker processes job
  3. Worker notifies API when done
  4. API emits WebSocket event to clients

- **Files**:
  - `backend/queues/pdfProcessingQueue.js` - Queue definition
  - `backend/workers/pdfProcessorWorker.js` - Worker process
  - `backend/routes/upload.js` - Adds jobs to queue

- **Configuration**: Set `USE_QUEUE=true` in `.env.production`

### **WebSocket System**

- **Purpose**: Real-time updates (PDF processing, messages)
- **Technology**: Socket.IO
- **Events**:
  - `pdf-processing-complete` - PDF ready
  - `message-processing-started` - AI started
  - `ai-response-complete` - Response ready
  - `message-error` - Errors

- **Files**:
  - `backend/websocket.js` - Server setup
  - `frontend/src/hooks/useWebSocket.ts` - Client hook

---

## 🚨 Common Issues

### **Redis Connection Failed**
```bash
# Check Redis is running
docker-compose -f docker-compose.production.yml exec redis redis-cli ping

# Check password
docker-compose -f docker-compose.production.yml logs redis
```

### **Worker Not Processing**
```bash
# Check worker logs
docker-compose -f docker-compose.production.yml logs worker

# Verify USE_QUEUE is set
docker-compose -f docker-compose.production.yml exec backend env | grep USE_QUEUE
```

### **WebSocket Not Connecting**
1. Check CORS in `backend/config/cors.js`
2. Verify Nginx WebSocket config in `nginx.conf`
3. Check browser console for errors

---

## 📚 Full Documentation

See `DEPLOYMENT-PLAN.md` for detailed instructions and troubleshooting.

