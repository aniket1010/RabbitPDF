# 🔧 Replace Nginx Config - Complete Guide

## ✅ **Method 1: Copy-Paste Full Config (Easiest)**

### **Step 1: On your server, backup current config**

```bash
sudo cp /etc/nginx/sites-available/rabbitpdf /etc/nginx/sites-available/rabbitpdf.backup
```

### **Step 2: Open nano editor**

```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

### **Step 3: Delete everything and paste new config**

**In nano:**
1. Press `Ctrl+K` repeatedly to delete all lines (or `Ctrl+A` then `Ctrl+K`)
2. Or press `Ctrl+6` (to start selection), then `Ctrl+End` (to select all), then `Delete`

**Then paste the full config below:**

---

## 📋 **FULL CORRECTED NGINX CONFIG - COPY THIS:**

```nginx
# Nginx configuration for ChatPDF
# Place this file at /etc/nginx/sites-available/rabbitpdf

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

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=1r/s;

# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name rabbitpdf.in www.rabbitpdf.in;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    server_name rabbitpdf.in www.rabbitpdf.in;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/rabbitpdf.in/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/rabbitpdf.in/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

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

    # Next.js API routes (auth, etc.) - go to frontend (MUST come before /api)
    location /api/auth {
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

    # File upload endpoint with stricter rate limiting (MUST come before /api)
    location /api/upload {
        limit_req zone=upload_limit burst=2 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Large file upload support
        client_max_body_size 50M;
        proxy_read_timeout 600s;
        proxy_connect_timeout 75s;
        proxy_request_buffering off;
    }

    # Backend API routes with rate limiting
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        
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
        
        # Increase body size for file uploads
        client_max_body_size 50M;
    }

    # WebSocket upgrade for Socket.IO
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
        
        # WebSocket specific timeouts
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Health check endpoint (no rate limiting)
    location /health {
        proxy_pass http://backend;
        access_log off;
    }
}
```

---

### **Step 4: Save and exit**

**In nano:**
- Press `Ctrl+X`
- Press `Y` to confirm
- Press `Enter` to save

### **Step 5: Test and restart**

```bash
# Test configuration
sudo nginx -t

# If test passes, restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

## ✅ **Method 2: Copy file from local to server**

**On your Windows machine:**

```powershell
# Copy the corrected config to server
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem nginx-corrected.conf ubuntu@51.20.135.170:~/nginx-corrected.conf
```

**On your server:**

```bash
# Backup current config
sudo cp /etc/nginx/sites-available/rabbitpdf /etc/nginx/sites-available/rabbitpdf.backup

# Copy new config
sudo cp ~/nginx-corrected.conf /etc/nginx/sites-available/rabbitpdf

# Test and restart
sudo nginx -t && sudo systemctl restart nginx
```

---

## 🎯 **What This Fixes:**

1. ✅ HTTP redirects to HTTPS
2. ✅ `/api/auth/*` routes go to frontend (Next.js API routes)
3. ✅ `/api/upload` goes to backend
4. ✅ Other `/api/*` routes go to backend
5. ✅ SSL certificates configured
6. ✅ All location blocks in correct order

---

## ✅ **After Replacing:**

**Test:**
```bash
# Test HTTP redirect
curl -I http://rabbitpdf.in

# Test HTTPS
curl -I https://rabbitpdf.in

# Test auth endpoint
curl -I https://rabbitpdf.in/api/auth/sign-in/social
```

**Should all work now!** 🎉

