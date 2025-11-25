# 🔧 Setup Port 80 - Remove :3000 from URL

## ✅ **Goal:** Make `rabbitpdf.in` work without `:3000`

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Install Nginx**

**SSH to your server and run:**

```bash
sudo apt update
sudo apt install nginx -y
```

**Check if nginx is running:**
```bash
sudo systemctl status nginx
```

---

### **Step 2: Copy Nginx Config**

**On your server:**

```bash
cd ~/RabbitPDF

# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/rabbitpdf

# Edit to make sure domain is correct
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**In nano, check line 22 - should say:**
```nginx
server_name rabbitpdf.in www.rabbitpdf.in;
```

**If it says `yourdomain.com`, change it to `rabbitpdf.in`**

**Save:** `Ctrl+X`, then `Y`, then `Enter`

---

### **Step 3: Enable Nginx Site**

```bash
# Enable site
sudo ln -sf /etc/nginx/sites-available/rabbitpdf /etc/nginx/sites-enabled/

# Remove default site (if exists)
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
```

**Should say:** `syntax is ok` and `test is successful`

---

### **Step 4: Start/Restart Nginx**

```bash
# Start nginx
sudo systemctl start nginx

# Enable nginx to start on boot
sudo systemctl enable nginx

# Restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

**Should show:** `active (running)` ✅

---

### **Step 5: Update Environment Variables**

**Update your .env file:**

```bash
cd ~/RabbitPDF
nano .env
```

**Find and update these 3 lines (remove :3000 from all):**

**Change:**
```env
NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000
NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:3000/api
NEXTAUTH_URL=http://rabbitpdf.in:3000
```

**To (Option 1 - Using nginx proxy, recommended):**
```env
NEXT_PUBLIC_APP_URL=http://rabbitpdf.in
NEXT_PUBLIC_API_BASE=http://rabbitpdf.in/api
NEXTAUTH_URL=http://rabbitpdf.in
```

**Or (Option 2 - Direct backend access on port 5000):**
```env
NEXT_PUBLIC_APP_URL=http://rabbitpdf.in
NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:5000
NEXTAUTH_URL=http://rabbitpdf.in
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

**Or use sed command (faster):**

**For Option 1 (nginx proxy):**
```bash
sed -i 's|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in|g' .env
sed -i 's|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:3000/api|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in/api|g' .env
sed -i 's|NEXTAUTH_URL=http://rabbitpdf.in:3000|NEXTAUTH_URL=http://rabbitpdf.in|g' .env
```

**For Option 2 (direct backend on :5000):**
```bash
sed -i 's|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in|g' .env
sed -i 's|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:3000/api|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:5000|g' .env
sed -i 's|NEXTAUTH_URL=http://rabbitpdf.in:3000|NEXTAUTH_URL=http://rabbitpdf.in|g' .env
```

---

### **Step 6: Restart Frontend**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

---

### **Step 7: Check Security Group**

**Make sure port 80 is open in AWS:**

1. Go to AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Check Inbound Rules
4. **Add rule if missing:**
   - Type: HTTP
   - Port: 80
   - Source: 0.0.0.0/0 (or your IP)

---

### **Step 8: Test**

**Try these URLs:**

```bash
# Test locally on server
curl http://localhost

# Test from your computer
curl http://rabbitpdf.in
```

**Or open in browser:** `http://rabbitpdf.in` (should work without :3000!)

---

## 🔍 **Troubleshooting**

### **Error: "502 Bad Gateway"**

**Check if frontend is running:**
```bash
docker-compose -f docker-compose.production.yml ps
```

**Check if port 3000 is accessible:**
```bash
curl http://localhost:3000
```

**If not working, restart frontend:**
```bash
docker-compose -f docker-compose.production.yml restart frontend
```

### **Error: "Connection refused"**

**Check nginx logs:**
```bash
sudo tail -50 /var/log/nginx/error.log
```

**Check if nginx is running:**
```bash
sudo systemctl status nginx
```

### **Error: "nginx: [emerg] bind() to 0.0.0.0:80 failed"**

**Port 80 is already in use. Check what's using it:**
```bash
sudo lsof -i :80
```

**Or check if Apache is running:**
```bash
sudo systemctl status apache2
# If running, stop it:
sudo systemctl stop apache2
```

---

## ✅ **Quick Commands Summary**

**Copy-paste all at once:**

```bash
# Install nginx
sudo apt update && sudo apt install nginx -y

# Copy config
cd ~/RabbitPDF
sudo cp nginx.conf /etc/nginx/sites-available/rabbitpdf

# Enable site
sudo ln -sf /etc/nginx/sites-available/rabbitpdf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t && sudo systemctl restart nginx

# Update .env (remove :3000 from all URL variables)
# Choose one: Option 1 (nginx proxy) or Option 2 (direct :5000)

# Option 1: Using nginx proxy (recommended)
sed -i 's|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in|g' .env
sed -i 's|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:3000/api|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in/api|g' .env
sed -i 's|NEXTAUTH_URL=http://rabbitpdf.in:3000|NEXTAUTH_URL=http://rabbitpdf.in|g' .env

# Option 2: Direct backend access on port 5000 (if you prefer)
# sed -i 's|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000|NEXT_PUBLIC_APP_URL=http://rabbitpdf.in|g' .env
# sed -i 's|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:3000/api|NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:5000|g' .env
# sed -i 's|NEXTAUTH_URL=http://rabbitpdf.in:3000|NEXTAUTH_URL=http://rabbitpdf.in|g' .env

# Restart frontend
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 🎉 **Done!**

Now `http://rabbitpdf.in` should work without `:3000`!

**Test it:** Open `http://rabbitpdf.in` in your browser 🚀

