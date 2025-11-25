# 🔧 Fix: Google OAuth Doesn't Accept IP Addresses

## 🚨 **The Problem:**

Google OAuth **doesn't allow IP addresses** in redirect URIs. You're seeing:

> "Invalid redirect: Must end with a public top-level domain (such as .com or .org)."

**Your current URI:** `http://51.20.135.170:3000/api/auth/callback/google` ❌

**Google requires:** A domain name like `http://yourdomain.com/api/auth/callback/google` ✅

---

## ✅ **Solution Options:**

### **Option 1: Use a Domain Name (Recommended for Production)**

**If you have a domain:**

1. **Point your domain to your server IP:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add an A record: `@` → `51.20.135.170`
   - Wait for DNS propagation (5-30 minutes)

2. **Update Google OAuth redirect URI:**
   ```
   http://yourdomain.com/api/auth/callback/google
   ```
   Or with HTTPS:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

3. **Update .env file:**
   ```env
   NEXT_PUBLIC_APP_URL=http://yourdomain.com
   ```

4. **Restart containers:**
   ```bash
   docker-compose -f docker-compose.production.yml restart frontend
   ```

---

### **Option 2: Use a Free Domain (No-IP, DuckDNS)**

**Get a free domain that points to your IP:**

#### **Using DuckDNS (Free):**

1. Go to: https://www.duckdns.org/
2. Sign up (free)
3. Create a subdomain: `yourname.duckdns.org`
4. Point it to your IP: `51.20.135.170`
5. Update Google OAuth redirect URI:
   ```
   http://yourname.duckdns.org:3000/api/auth/callback/google
   ```
6. Update `.env`:
   ```env
   NEXT_PUBLIC_APP_URL=http://yourname.duckdns.org:3000
   ```

#### **Using No-IP (Free):**

1. Go to: https://www.noip.com/
2. Sign up (free)
3. Create a hostname: `yourname.ddns.net`
4. Point it to your IP
5. Update redirect URI and `.env` accordingly

---

### **Option 3: Use localhost for Development (Temporary)**

**For testing only (not recommended for production):**

1. **Keep localhost redirect URI:**
   ```
   http://localhost:3001/api/auth/callback/google
   ```

2. **Access your app via SSH tunnel:**
   ```powershell
   ssh -i rabbitpdf-key.pem -L 3001:localhost:3000 ubuntu@51.20.135.170
   ```

3. **Then access:** `http://localhost:3001`

**This is only for testing!**

---

### **Option 4: Disable Google OAuth (Temporary)**

**If you don't need Google OAuth right now:**

1. **Remove Google OAuth from your app** (or just don't use it)
2. **Use email/password sign-in** or **GitHub OAuth** only
3. **Set up Google OAuth later** when you have a domain

**Note:** GitHub OAuth might also have similar restrictions with IP addresses.

---

## 🎯 **Recommended: Get a Free Domain**

### **Quick Setup with DuckDNS:**

1. **Sign up:** https://www.duckdns.org/
2. **Create subdomain:** `yourname.duckdns.org`
3. **Point to IP:** `51.20.135.170`
4. **Update Google OAuth:**
   - Remove: `http://51.20.135.170:3000/api/auth/callback/google`
   - Add: `http://yourname.duckdns.org:3000/api/auth/callback/google`
5. **Update .env:**
   ```env
   NEXT_PUBLIC_APP_URL=http://yourname.duckdns.org:3000
   ```
6. **Restart containers**

---

## 🔍 **Check GitHub OAuth Too**

**GitHub might also have restrictions. Check:**

1. Go to: https://github.com/settings/developers
2. Edit your OAuth app
3. **Authorization callback URL** should be:
   - `http://yourdomain.com/api/auth/callback/github` ✅
   - NOT `http://51.20.135.170:3000/api/auth/callback/github` ❌

---

## ✅ **After Setting Up Domain:**

### **1. Update Google OAuth:**

**Remove IP-based URI:**
- ❌ `http://51.20.135.170:3000/api/auth/callback/google`

**Add domain-based URI:**
- ✅ `http://yourdomain.com/api/auth/callback/google`

### **2. Update .env File:**

```env
NEXT_PUBLIC_APP_URL=http://yourdomain.com
NEXT_PUBLIC_API_BASE=http://yourdomain.com/api
```

### **3. Restart Services:**

```bash
docker-compose -f docker-compose.production.yml restart frontend
```

### **4. Test:**

1. Go to: `http://yourdomain.com`
2. Try Google sign-in
3. Should work now! ✅

---

## 💡 **Quick Fix Summary:**

**The issue:** Google doesn't accept IP addresses in redirect URIs.

**Solutions:**
1. ✅ **Get a domain** (recommended)
2. ✅ **Use free domain** (DuckDNS, No-IP)
3. ✅ **Use localhost with SSH tunnel** (testing only)
4. ✅ **Disable Google OAuth** (temporary)

---

## 🚀 **Easiest Solution:**

**Get a free DuckDNS domain:**

1. Sign up: https://www.duckdns.org/
2. Create: `yourname.duckdns.org`
3. Point to: `51.20.135.170`
4. Update Google OAuth redirect URI
5. Update `.env` file
6. Restart containers

**Takes 5 minutes!** ⚡

---

**Which option would you like to use? I can help you set it up!** 🚀



