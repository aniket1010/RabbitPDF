# 🌐 Setup Your Domain for the Application

## 🎯 **Goal:**

Point your domain to your server (`51.20.135.170`) and configure OAuth to use it.

---

## ✅ **Step 1: Point Domain to Your Server IP**

### **1.1: Find Your Domain Registrar**

**Where did you buy your domain?**
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- AWS Route 53
- Other

**Go to your domain registrar's website and log in.**

---

### **1.2: Access DNS Management**

**In your domain registrar:**

1. Find **"DNS Management"** or **"DNS Settings"** or **"Name Servers"**
2. Look for **"DNS Records"** or **"Manage DNS"**
3. You should see records like:
   - A records
   - CNAME records
   - MX records
   - etc.

---

### **1.3: Add/Update A Record**

**Add an A record to point your domain to your server:**

1. Click **"Add Record"** or **"Edit"** existing A record
2. Fill in:
   - **Type:** `A`
   - **Name/Host:** `@` (or leave blank, or `www` for www subdomain)
   - **Value/Points to:** `51.20.135.170` (your server IP)
   - **TTL:** `3600` (or default)

3. **Save** the record

**Example:**
```
Type: A
Name: @
Value: 51.20.135.170
TTL: 3600
```

**For www subdomain (optional):**
```
Type: A
Name: www
Value: 51.20.135.170
TTL: 3600
```

---

### **1.4: Wait for DNS Propagation**

**DNS changes take time to propagate:**
- Usually: **5-30 minutes**
- Sometimes: **Up to 48 hours** (rare)

**Check if it's working:**
```powershell
# In PowerShell
nslookup yourdomain.com
```

**Or use online tool:**
- https://www.whatsmydns.net/
- Enter your domain
- Check if it shows `51.20.135.170`

---

## ✅ **Step 2: Update Google OAuth Redirect URI**

### **2.1: Go to Google Cloud Console**

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click on your OAuth client ID (**RabbitPDF**)

---

### **2.2: Update Redirect URI**

**In "Authorised redirect URIs" section:**

1. **Remove** the IP-based URI:
   - ❌ `http://51.20.135.170:3000/api/auth/callback/google`

2. **Add** domain-based URI:
   - ✅ `http://yourdomain.com/api/auth/callback/google`
   - Or if you want HTTPS: `https://yourdomain.com/api/auth/callback/google`

3. **Click "Save"**

**Note:** If you want HTTPS, you'll need SSL certificate (see Step 5).

---

## ✅ **Step 3: Update GitHub OAuth Redirect URI**

### **3.1: Go to GitHub OAuth Apps**

1. Go to: https://github.com/settings/developers
2. Click on your OAuth app
3. Click **"Edit"**

---

### **3.2: Update Callback URL**

**In "Authorization callback URL":**

1. **Change from:**
   - ❌ `http://51.20.135.170:3000/api/auth/callback/github`

2. **Change to:**
   - ✅ `http://yourdomain.com/api/auth/callback/github`
   - Or HTTPS: `https://yourdomain.com/api/auth/callback/github`

3. **Click "Update application"**

---

## ✅ **Step 4: Update .env File**

### **4.1: SSH to Your Server**

```powershell
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
```

---

### **4.2: Edit .env File**

```bash
cd ~/RabbitPDF
nano .env
```

---

### **4.3: Update URLs**

**Find and update these lines:**

```env
# Change from IP to domain
NEXT_PUBLIC_APP_URL=http://yourdomain.com
NEXT_PUBLIC_API_BASE=http://yourdomain.com/api

# Or if using HTTPS (after SSL setup):
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
# NEXT_PUBLIC_API_BASE=https://yourdomain.com/api
```

**Also update (if present):**
```env
NEXTAUTH_URL=http://yourdomain.com
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## ✅ **Step 5: Restart Services**

**After updating .env:**

```bash
docker-compose -f docker-compose.production.yml restart frontend backend
```

**Or restart all:**
```bash
docker-compose -f docker-compose.production.yml restart
```

---

## ✅ **Step 6: Test Domain**

### **6.1: Check DNS Propagation**

**Wait 5-30 minutes, then test:**

```powershell
# In PowerShell
nslookup yourdomain.com
```

**Should show:** `51.20.135.170`

---

### **6.2: Test Application**

**Try accessing:**

```
http://yourdomain.com:3000
```

**If DNS is working, you should see your application!**

---

### **6.3: Test OAuth**

1. Go to: `http://yourdomain.com:3000`
2. Click "Sign in"
3. Try "Continue with Google"
4. Should redirect to Google and work! ✅

---

## 🔒 **Step 7: Setup HTTPS (Optional but Recommended)**

**For production, you should use HTTPS:**

### **Option A: Use Nginx Reverse Proxy with Let's Encrypt**

**This is more advanced but recommended for production.**

### **Option B: Use Cloudflare (Easier)**

1. **Add domain to Cloudflare:**
   - Sign up: https://www.cloudflare.com/
   - Add your domain
   - Update nameservers at your registrar

2. **Cloudflare will provide:**
   - Free SSL certificate
   - HTTPS automatically
   - DDoS protection

3. **Update redirect URIs to HTTPS:**
   - Google: `https://yourdomain.com/api/auth/callback/google`
   - GitHub: `https://yourdomain.com/api/auth/callback/github`

---

## 📋 **Quick Checklist:**

- [ ] DNS A record points to `51.20.135.170`
- [ ] DNS propagated (check with nslookup)
- [ ] Google OAuth redirect URI updated to domain
- [ ] GitHub OAuth redirect URI updated to domain
- [ ] `.env` file updated with domain URL
- [ ] Containers restarted
- [ ] Application accessible at `http://yourdomain.com:3000`
- [ ] OAuth sign-in working

---

## 🚨 **Common Issues:**

### **Issue: Domain not resolving**

**Fix:**
- Wait longer (DNS can take up to 48 hours)
- Check DNS records are correct
- Verify A record points to `51.20.135.170`
- Use `nslookup` or online DNS checker

### **Issue: Port 3000 in URL**

**If you want to remove `:3000` from URL:**
- You need a reverse proxy (Nginx)
- Or use Cloudflare's proxy
- This is more advanced

**For now, using `http://yourdomain.com:3000` is fine!**

### **Issue: OAuth still not working**

**Check:**
- Redirect URIs match exactly (including http/https, port)
- `.env` file has correct domain
- Containers restarted
- DNS propagated

---

## 🎯 **Summary:**

1. **DNS:** Add A record (`@` → `51.20.135.170`)
2. **Google OAuth:** Update redirect URI to domain
3. **GitHub OAuth:** Update callback URL to domain
4. **.env:** Update `NEXT_PUBLIC_APP_URL` to domain
5. **Restart:** Restart containers
6. **Test:** Access `http://yourdomain.com:3000`

---

## 💡 **What's Your Domain Registrar?**

**Let me know which registrar you're using, and I can give you specific steps!**

**Common ones:**
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- AWS Route 53

---

**Once DNS is set up, update OAuth and .env, then restart containers!** 🚀



