# 🔧 Setup Nginx for Port 80 (No :3000 needed)

## ✅ **Quick Fix: Setup Nginx Reverse Proxy**

**Run these commands on your server:**

### **Step 1: Install Nginx (if not installed)**

```bash
sudo apt update
sudo apt install nginx -y
```

### **Step 2: Copy nginx config to server**

```bash
cd ~/RabbitPDF
sudo cp nginx.conf /etc/nginx/sites-available/rabbitpdf
```

### **Step 3: Update domain name in config**

```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**Make sure line 22 says:**
```nginx
server_name rabbitpdf.in www.rabbitpdf.in;
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### **Step 4: Enable site and restart nginx**

```bash
# Enable site
sudo ln -sf /etc/nginx/sites-available/rabbitpdf /etc/nginx/sites-enabled/

# Remove default site (if exists)
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx
```

### **Step 5: Update NEXT_PUBLIC_APP_URL**

**Update your .env file:**

```bash
nano .env
```

**Change:**
```env
NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000
```

**To:**
```env
NEXT_PUBLIC_APP_URL=http://rabbitpdf.in
```

**Save and restart frontend:**
```bash
docker-compose -f docker-compose.production.yml restart frontend
```

### **Step 6: Test**

**Now try:**
- `http://rabbitpdf.in` (should work without :3000!)

---

## 🔍 **Troubleshooting**

**If nginx doesn't start:**
```bash
sudo nginx -t  # Check for errors
sudo journalctl -u nginx -n 50  # Check logs
```

**If you get 502 Bad Gateway:**
- Make sure Docker containers are running: `docker-compose -f docker-compose.production.yml ps`
- Check if port 3000 is accessible: `curl http://localhost:3000`

**If domain doesn't resolve:**
- Make sure DNS is pointing to your server IP
- Check DNS: `nslookup rabbitpdf.in`

---

## ✅ **Done!**

Now `rabbitpdf.in` should work without `:3000`! 🎉


