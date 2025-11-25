# 🌐 Setup rabbitpdf.in on GoDaddy

## 🎯 **Domain:** `rabbitpdf.in`  
## 🏢 **Registrar:** GoDaddy

---

## ✅ **Step 1: Point Domain to Your Server (GoDaddy)**

### **1.1: Log in to GoDaddy**

1. Go to: https://www.godaddy.com/
2. Click **"Sign In"** (top right)
3. Enter your credentials

---

### **1.2: Access DNS Management**

1. After logging in, click **"My Products"** (top menu)
2. Find **"Domains"** section
3. Find `rabbitpdf.in` in your domain list
4. Click on **`rabbitpdf.in`** (or click the **"DNS"** button next to it)

---

### **1.3: Edit DNS Records**

**You should see a DNS Management page with records like:**
- A records
- CNAME records
- MX records
- etc.

---

### **1.4: Add/Edit A Record for Root Domain**

**For `rabbitpdf.in` (without www):**

1. **If A record exists for `@` or blank:**
   - Click **"Edit"** (pencil icon) on the existing A record
   - Change **"Points to"** to: `51.20.135.170`
   - Click **"Save"**

2. **If no A record exists:**
   - Click **"Add"** button
   - **Type:** `A`
   - **Name:** `@` (or leave blank)
   - **Value:** `51.20.135.170`
   - **TTL:** `600` (or default)
   - Click **"Save"**

---

### **1.5: Add A Record for www Subdomain (Optional)**

**For `www.rabbitpdf.in`:**

1. Click **"Add"** button
2. Fill in:
   - **Type:** `A`
   - **Name:** `www`
   - **Value:** `51.20.135.170`
   - **TTL:** `600` (or default)
3. Click **"Save"**

---

### **1.6: Save Changes**

**GoDaddy usually saves automatically, but verify:**
- Check that records show `51.20.135.170`
- Wait a few minutes for changes to propagate

---

## ✅ **Step 2: Update Google OAuth Redirect URI**

### **2.1: Go to Google Cloud Console**

1. Go to: https://console.cloud.google.com/
2. Select your project
3. **APIs & Services** → **Credentials**
4. Click on your OAuth client ID (**RabbitPDF**)

---

### **2.2: Update Redirect URI**

**In "Authorised redirect URIs" section:**

1. **Remove:**
   - ❌ `http://51.20.135.170:3000/api/auth/callback/google`
   - ❌ `http://localhost:3001/api/auth/callback/google` (if you want to remove this too)

2. **Add:**
   - ✅ `http://rabbitpdf.in:3000/api/auth/callback/google`
   - ✅ `http://www.rabbitpdf.in:3000/api/auth/callback/google` (if you added www record)

3. **Click "Save"**

---

## ✅ **Step 3: Update GitHub OAuth Redirect URI**

### **3.1: Go to GitHub OAuth Apps**

1. Go to: https://github.com/settings/developers
2. Click on your OAuth app
3. Click **"Edit"**

---

### **3.2: Update Callback URL**

**In "Authorization callback URL":**

1. **Change to:**
   - ✅ `http://rabbitpdf.in:3000/api/auth/callback/github`

2. **Also update "Homepage URL":**
   - ✅ `http://rabbitpdf.in:3000`

3. **Click "Update application"**

---

## ✅ **Step 4: Update .env File on Server**

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
NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000
NEXT_PUBLIC_API_BASE=http://rabbitpdf.in:3000/api

# Also update (if present):
NEXTAUTH_URL=http://rabbitpdf.in:3000
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

## ✅ **Step 6: Wait for DNS Propagation**

**DNS changes can take 5-30 minutes (sometimes up to 48 hours).**

### **6.1: Check DNS Propagation**

**In PowerShell:**

```powershell
nslookup rabbitpdf.in
```

**Should show:** `51.20.135.170`

**Or use online tool:**
- https://www.whatsmydns.net/#A/rabbitpdf.in
- Should show `51.20.135.170` globally

---

### **6.2: Test Domain**

**Once DNS propagates, try:**

```
http://rabbitpdf.in:3000
```

**You should see your application!** ✅

---

## ✅ **Step 7: Test OAuth**

1. Go to: `http://rabbitpdf.in:3000`
2. Click **"Sign in"**
3. Try **"Continue with Google"**
4. Should redirect to Google and work! ✅

---

## 📋 **GoDaddy DNS Records Summary**

**Your DNS records should look like:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 51.20.135.170 | 600 |
| A | www | 51.20.135.170 | 600 |

---

## 🚨 **Common GoDaddy Issues:**

### **Issue: Can't find DNS Management**

**Fix:**
- Go to **"My Products"** → **"Domains"**
- Click on domain name (not DNS button)
- Look for **"DNS"** tab or **"Manage DNS"** button

### **Issue: DNS not updating**

**Fix:**
- Wait longer (can take up to 48 hours)
- Clear browser cache
- Try different DNS server: `8.8.8.8` (Google DNS)

### **Issue: Still showing old IP**

**Fix:**
- Check DNS records are saved correctly
- Wait for propagation
- Use `nslookup` to verify

---

## 🔒 **Optional: Setup HTTPS (Later)**

**For production, you should use HTTPS:**

### **Option 1: Cloudflare (Easier)**

1. Sign up: https://www.cloudflare.com/
2. Add `rabbitpdf.in` to Cloudflare
3. Update nameservers at GoDaddy to Cloudflare's
4. Cloudflare provides free SSL automatically

### **Option 2: Let's Encrypt with Nginx**

**More advanced, requires reverse proxy setup.**

---

## ✅ **Quick Checklist:**

- [ ] GoDaddy DNS A record added (`@` → `51.20.135.170`)
- [ ] Optional: www A record added (`www` → `51.20.135.170`)
- [ ] DNS propagated (check with nslookup)
- [ ] Google OAuth redirect URI updated to `http://rabbitpdf.in:3000/api/auth/callback/google`
- [ ] GitHub OAuth callback URL updated to `http://rabbitpdf.in:3000/api/auth/callback/github`
- [ ] `.env` file updated with `NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000`
- [ ] Containers restarted
- [ ] Application accessible at `http://rabbitpdf.in:3000`
- [ ] OAuth sign-in working

---

## 🎯 **Summary:**

1. **GoDaddy:** Add A record (`@` → `51.20.135.170`)
2. **Google OAuth:** Update redirect URI to `http://rabbitpdf.in:3000/api/auth/callback/google`
3. **GitHub OAuth:** Update callback URL to `http://rabbitpdf.in:3000/api/auth/callback/github`
4. **Server:** Update `.env` with `NEXT_PUBLIC_APP_URL=http://rabbitpdf.in:3000`
5. **Restart:** Restart containers
6. **Wait:** 5-30 minutes for DNS propagation
7. **Test:** Access `http://rabbitpdf.in:3000`

---

## 💡 **After Setup:**

**Your application will be accessible at:**
- ✅ `http://rabbitpdf.in:3000` (frontend)
- ✅ `http://rabbitpdf.in:3000/api` (backend API)

**OAuth will work with:**
- ✅ Google: `http://rabbitpdf.in:3000/api/auth/callback/google`
- ✅ GitHub: `http://rabbitpdf.in:3000/api/auth/callback/github`

---

**Follow these steps and let me know when DNS is set up!** 🚀



