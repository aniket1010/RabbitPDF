# 🔒 Setup HTTPS/SSL Certificate - Fix "Not Secure" Warning

## ✅ **Quick Fix: Get Free SSL Certificate**

**Run these commands on your server:**

### **Step 1: Install Certbot**

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### **Step 2: Make sure Nginx is set up first**

**If you haven't set up nginx yet, do this first:**

```bash
cd ~/RabbitPDF
sudo cp nginx.conf /etc/nginx/sites-available/rabbitpdf
sudo nano /etc/nginx/sites-available/rabbitpdf
# Make sure line 22 says: server_name rabbitpdf.in www.rabbitpdf.in;
sudo ln -sf /etc/nginx/sites-available/rabbitpdf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 3: Get SSL Certificate**

```bash
sudo certbot --nginx -d rabbitpdf.in -d www.rabbitpdf.in
```

**Follow the prompts:**
- Enter your email address
- Agree to terms (type `A` and press Enter)
- Choose to redirect HTTP to HTTPS (type `2` and press Enter)

**Certbot will automatically:**
- ✅ Get SSL certificate from Let's Encrypt
- ✅ Update nginx config for HTTPS
- ✅ Set up auto-renewal

### **Step 4: Update Environment Variables**

**Update your .env file:**

```bash
nano .env
```

**Change:**
```env
NEXT_PUBLIC_APP_URL=http://rabbitpdf.in
```

**To:**
```env
NEXT_PUBLIC_APP_URL=https://rabbitpdf.in
```

**Also update (if present):**
```env
NEXTAUTH_URL=https://rabbitpdf.in
NEXT_PUBLIC_API_BASE=https://rabbitpdf.in/api
```

**Save and restart frontend:**
```bash
docker-compose -f docker-compose.production.yml restart frontend
```

### **Step 5: Test**

**Visit:** `https://rabbitpdf.in`

**You should see:**
- ✅ Green lock icon 🔒
- ✅ No "Not Secure" warning
- ✅ HTTPS in the URL

---

## 🔍 **Troubleshooting**

### **Error: "Failed to obtain certificate"**

**Possible causes:**
1. **DNS not pointing to server** - Check: `nslookup rabbitpdf.in`
2. **Port 80 blocked** - Check security group allows port 80
3. **Nginx not running** - Check: `sudo systemctl status nginx`

**Fix DNS first:**
- Make sure `rabbitpdf.in` DNS A record points to your server IP
- Wait 5-10 minutes for DNS to propagate

### **Error: "Connection refused"**

**Check nginx is running:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

### **Certificate expires**

**Auto-renewal is set up automatically, but test it:**
```bash
sudo certbot renew --dry-run
```

---

## ✅ **What This Does**

1. **Gets free SSL certificate** from Let's Encrypt
2. **Configures nginx** to use HTTPS (port 443)
3. **Redirects HTTP to HTTPS** automatically
4. **Renews certificate** automatically (every 90 days)

---

## 🎉 **Done!**

Your site is now secure with HTTPS! 🔒

**Benefits:**
- ✅ No "Not Secure" warning
- ✅ Encrypted connection
- ✅ Better SEO
- ✅ More professional
- ✅ Required for some OAuth providers


