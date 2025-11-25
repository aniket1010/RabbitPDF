# 🔧 Fix: Google/GitHub Sign-In Not Working

## 🚨 **Common Issues:**

1. **OAuth credentials not set** in `.env` file
2. **Redirect URIs not configured** in Google/GitHub OAuth apps
3. **Wrong callback URLs** in OAuth app settings
4. **Environment variables not loaded** in containers

---

## ✅ **Step 1: Check Environment Variables**

### **On Your Server:**

```bash
cd ~/RabbitPDF

# Check if OAuth variables are set
cat .env | grep -E "GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GITHUB_CLIENT_ID|GITHUB_CLIENT_SECRET|NEXT_PUBLIC_APP_URL"
```

**You should see:**
```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
NEXT_PUBLIC_APP_URL=http://51.20.135.170:3000
```

**If any are missing or empty, add them!**

---

## ✅ **Step 2: Set OAuth Credentials in .env**

### **Edit .env File:**

```bash
nano .env
```

**Add/Update these lines:**

```env
# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here

# Application URL (IMPORTANT for OAuth callbacks!)
NEXT_PUBLIC_APP_URL=http://51.20.135.170:3000
NEXT_PUBLIC_API_BASE=http://51.20.135.170:5000
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## ✅ **Step 3: Configure Google OAuth**

### **3.1: Create Google OAuth Credentials**

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. If prompted, configure OAuth consent screen first

### **3.2: Configure OAuth Consent Screen**

1. Go to **"OAuth consent screen"**
2. Choose **"External"** (unless you have Google Workspace)
3. Fill in:
   - App name: `ChatPDF` (or your app name)
   - User support email: Your email
   - Developer contact: Your email
4. Click **"Save and Continue"**
5. Add scopes: `email`, `profile`, `openid`
6. Add test users (if in testing mode)
7. Click **"Save and Continue"**

### **3.3: Create OAuth Client ID**

1. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
2. Application type: **"Web application"**
3. Name: `ChatPDF Production`
4. **Authorized redirect URIs:** Add:
   ```
   http://51.20.135.170:3000/api/auth/callback/google
   ```
   **If you have a domain:**
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
5. Click **"Create"**
6. **Copy Client ID and Client Secret**
7. Add to your `.env` file

---

## ✅ **Step 4: Configure GitHub OAuth**

### **4.1: Create GitHub OAuth App**

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `ChatPDF` (or your app name)
   - **Homepage URL:** `http://51.20.135.170:3000` (or your domain)
   - **Authorization callback URL:** 
     ```
     http://51.20.135.170:3000/api/auth/callback/github
     ```
     **If you have a domain:**
     ```
     https://yourdomain.com/api/auth/callback/github
     ```
4. Click **"Register application"**

### **4.2: Get Client ID and Secret**

1. On the OAuth app page, you'll see:
   - **Client ID** (copy this)
   - **Client secrets** → Click **"Generate a new client secret"**
2. **Copy both** and add to your `.env` file

---

## ✅ **Step 5: Restart Services**

**After updating .env file:**

```bash
cd ~/RabbitPDF

# Restart frontend to load new environment variables
docker-compose -f docker-compose.production.yml restart frontend

# Or restart all services
docker-compose -f docker-compose.production.yml restart
```

---

## ✅ **Step 6: Verify Environment Variables Are Loaded**

### **Check Frontend Logs:**

```bash
docker-compose -f docker-compose.production.yml logs frontend | grep "Auth Config"
```

**You should see:**
```
🔍 [Auth Config] Environment variables check: {
  GOOGLE_CLIENT_ID: 'SET (your-client-id...)',
  GOOGLE_CLIENT_SECRET: 'SET',
  GITHUB_CLIENT_ID: 'SET',
  GITHUB_CLIENT_SECRET: 'SET',
  ...
}
```

**If you see "NOT SET":**
- Environment variables not loaded
- Check `.env` file
- Restart containers

---

## 🔍 **Step 7: Check Browser Console**

**When testing sign-in:**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try signing in with Google/GitHub
4. **Check for errors:**
   - "Failed to sign in with google"
   - "Redirect URI mismatch"
   - "Invalid client"

---

## 🚨 **Common Errors:**

### **Error: "Redirect URI mismatch"**

**Fix:**
- Check redirect URI in OAuth app matches exactly:
  - Google: `http://51.20.135.170:3000/api/auth/callback/google`
  - GitHub: `http://51.20.135.170:3000/api/auth/callback/github`
- Make sure `NEXT_PUBLIC_APP_URL` matches your actual URL

### **Error: "Invalid client"**

**Fix:**
- Check Client ID and Secret are correct
- Make sure they're copied correctly (no extra spaces)
- Restart containers after updating `.env`

### **Error: "OAuth credentials not set"**

**Fix:**
- Check `.env` file has all OAuth variables
- Restart containers
- Check logs: `docker-compose logs frontend | grep "Auth Config"`

---

## ✅ **Quick Checklist:**

- [ ] OAuth credentials set in `.env` file
- [ ] Google OAuth app created with correct redirect URI
- [ ] GitHub OAuth app created with correct redirect URI
- [ ] `NEXT_PUBLIC_APP_URL` matches your server URL
- [ ] Containers restarted after updating `.env`
- [ ] Environment variables loaded (check logs)
- [ ] Browser console shows no errors

---

## 🎯 **Redirect URI Format:**

**Your redirect URIs should be:**

**Google:**
```
http://51.20.135.170:3000/api/auth/callback/google
```

**GitHub:**
```
http://51.20.135.170:3000/api/auth/callback/github
```

**If you have a domain:**
```
https://yourdomain.com/api/auth/callback/google
https://yourdomain.com/api/auth/callback/github
```

**Important:** Must match exactly (including http/https, port, path)

---

## 🚀 **After Setup:**

1. **Update .env file** with OAuth credentials
2. **Configure OAuth apps** with correct redirect URIs
3. **Restart containers**
4. **Test sign-in** in browser
5. **Check browser console** for errors

---

## 💡 **Testing:**

**Try signing in:**
1. Go to: `http://51.20.135.170:3000`
2. Click "Sign in"
3. Click "Continue with Google" or "Continue with GitHub"
4. Should redirect to OAuth provider
5. After authorization, should redirect back and sign you in

---

**Let me know if you need help creating OAuth apps or if you encounter any errors!** 🚀



