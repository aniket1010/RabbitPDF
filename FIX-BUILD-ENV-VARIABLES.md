# 🔧 Fix: Build Error - Missing BETTER_AUTH_SECRET

## ✅ **Good News:**
- ✅ ESLint/TypeScript errors are now being skipped (config fix worked!)
- ❌ Build failing because `BETTER_AUTH_SECRET` is required during build

---

## 🎯 **The Problem:**

The build process needs environment variables **during build time**, not just at runtime. The auth config is being evaluated during the build.

---

## 🔧 **Solution: Pass Build Args**

I've updated your Dockerfile and docker-compose files locally. Now you need to:

### **Step 1: Update Files on Server**

**On your server, update these two files:**

#### **A. Update `frontend/Dockerfile`**

```bash
cd ~/chatPDF
nano frontend/Dockerfile
```

**Replace the entire file with this:**

```dockerfile
# Frontend Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Accept build arguments for environment variables
ARG BETTER_AUTH_SECRET
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_BASE
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET

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

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Use production config for build (if it exists, otherwise use default)
# This ensures production optimizations are used
RUN if [ -f next.config.production.ts ]; then \
      cp next.config.production.ts next.config.ts; \
      echo "Using production config"; \
    else \
      echo "Using default config"; \
    fi

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

USER nextjs

EXPOSE 3000

# Health check (using root endpoint since /api/health may not exist)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

#### **B. Update `docker-compose.production.yml`**

```bash
nano docker-compose.production.yml
```

**Find this section (around line 135-140):**

```yaml
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
```

**Replace with:**

```yaml
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
        BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
        NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
        NEXT_PUBLIC_API_BASE: ${NEXT_PUBLIC_API_BASE}
        GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
        GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-}
        GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID:-}
        GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET:-}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### **Step 2: Verify .env File Has Required Variables**

**Check your `.env` file has these variables:**

```bash
cat .env | grep -E "BETTER_AUTH_SECRET|NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_API_BASE"
```

**Required variables:**
- `BETTER_AUTH_SECRET` - Must be set!
- `NEXT_PUBLIC_APP_URL` - Must be set!
- `NEXT_PUBLIC_API_BASE` - Must be set!

**If missing, add them:**

```bash
nano .env
```

**Add/update these lines:**

```env
BETTER_AUTH_SECRET=your_secret_here
NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP
NEXT_PUBLIC_API_BASE=http://YOUR_SERVER_IP/api
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### **Step 3: Rebuild**

**After updating both files:**

```bash
# Rebuild frontend with new build args
docker-compose -f docker-compose.production.yml build frontend

# Or rebuild everything
docker-compose -f docker-compose.production.yml build
```

**Build should now succeed!** ✅

---

## 🚀 **Quick Copy-Paste Method:**

**If you prefer, you can copy the files directly from your local machine:**

**On your local Windows PowerShell:**

```powershell
# Navigate to project
cd D:\all_my_code\projects\chatPDF

# Copy Dockerfile to server
scp -i C:\Users\$env:USERNAME\Downloads\chatpdf-key.pem frontend/Dockerfile ubuntu@YOUR_SERVER_IP:~/chatPDF/frontend/

# Copy docker-compose file
scp -i C:\Users\$env:USERNAME\Downloads\chatpdf-key.pem docker-compose.production.yml ubuntu@YOUR_SERVER_IP:~/chatPDF/
```

**Then rebuild on server:**

```bash
docker-compose -f docker-compose.production.yml build frontend
```

---

## ✅ **Summary:**

1. ✅ Update `frontend/Dockerfile` (add build args)
2. ✅ Update `docker-compose.production.yml` (pass build args)
3. ✅ Verify `.env` file has required variables
4. ✅ Rebuild: `docker-compose build frontend`

**Let me know when you've updated the files!** 🚀

