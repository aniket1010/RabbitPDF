# 🔧 Fix: Missing @tailwindcss/postcss Module

## 🎯 **The Problem:**

Build failing with:
```
Error: Cannot find module '@tailwindcss/postcss'
```

**Why:** `NODE_ENV=production` was set before `npm ci`, which caused npm to skip devDependencies. But we need devDependencies (like `@tailwindcss/postcss`) for the build process!

---

## ✅ **The Fix:**

I've updated the Dockerfile locally. Now update it on your server:

### **Update `frontend/Dockerfile` on Server**

```bash
cd ~/chatPDF
nano frontend/Dockerfile
```

**Find this section (around lines 16-30):**

```dockerfile
# Set environment variables for build
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci
```

**Replace with:**

```dockerfile
# Set environment variables for build (but NOT NODE_ENV yet - we need devDependencies)
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci --include=dev

# Now set NODE_ENV=production for the build
ENV NODE_ENV=production
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## 🚀 **Rebuild**

```bash
docker-compose -f docker-compose.production.yml build frontend
```

**Build should now succeed!** ✅

---

## 💡 **What Changed:**

1. **Removed** `ENV NODE_ENV=production` before `npm ci`
2. **Added** `--include=dev` flag to ensure devDependencies are installed
3. **Moved** `ENV NODE_ENV=production` to after dependency installation

This ensures build tools like `@tailwindcss/postcss` are available during the build process!

---

## 🚀 **Quick Copy Method:**

**On your local Windows PowerShell:**

```powershell
cd D:\all_my_code\projects\chatPDF
scp -i C:\Users\$env:USERNAME\Downloads\chatpdf-key.pem frontend/Dockerfile ubuntu@YOUR_SERVER_IP:~/chatPDF/frontend/
```

**Then rebuild on server:**

```bash
docker-compose -f docker-compose.production.yml build frontend
```

---

**Let me know when you've updated the file!** 🚀



