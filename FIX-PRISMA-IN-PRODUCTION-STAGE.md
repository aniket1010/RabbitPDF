# 🔧 Fix: Prisma Schema Not in Production Stage

## 🚨 **The Problem:**

**Prisma schema is generated during build, but not copied to production stage.**

**Next.js standalone mode doesn't include Prisma files automatically.**

---

## ✅ **Solution: Update Dockerfile to Copy Prisma Files**

### **Update `frontend/Dockerfile`**

**I've updated it locally. Now update on your server:**

```bash
cd ~/RabbitPDF
nano frontend/Dockerfile
```

**Find this section (around lines 70-82):**

```dockerfile
# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public directory...
```

**Add these lines BEFORE the public directory copy:**

```dockerfile
# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client (needed at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy public directory...
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## 🚀 **Rebuild Frontend**

**After updating Dockerfile:**

```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**This rebuilds with Prisma files included.**

---

## ✅ **Alternative: Copy Files Manually (Temporary Fix)**

**If you can't rebuild right now, copy files into running container:**

```bash
# Copy Prisma schema
docker cp frontend/prisma chatpdf-frontend:/app/prisma

# Copy Prisma client (if exists)
docker cp frontend/node_modules/.prisma chatpdf-frontend:/app/node_modules/.prisma 2>/dev/null || echo "Prisma client not found locally"
docker cp frontend/node_modules/@prisma chatpdf-frontend:/app/node_modules/@prisma 2>/dev/null || echo "Prisma package not found locally"

# Restart frontend
docker-compose -f docker-compose.production.yml restart frontend
```

**But rebuilding is better!**

---

## 🎯 **Complete Updated Dockerfile Section**

**Here's the complete section (lines 70-82):**

```dockerfile
# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client (needed at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy public directory - use a workaround to handle missing directory
# First create the directory, then try to copy contents
RUN mkdir -p ./public && chown nextjs:nodejs ./public
# Use a shell script approach to conditionally copy
RUN --mount=from=builder,source=/app,target=/tmp/builder \
    if [ -d /tmp/builder/public ] && [ "$(ls -A /tmp/builder/public 2>/dev/null)" ]; then \
      cp -r /tmp/builder/public/* ./public/ 2>/dev/null || true; \
      chown -R nextjs:nodejs ./public; \
    fi
```

---

## 🚀 **Quick Fix:**

**1. Update Dockerfile (add Prisma copy lines)**
**2. Rebuild:** `docker-compose up -d --build frontend`
**3. Test OAuth sign-in**

---

**Update the Dockerfile and rebuild - that's the proper fix!** 🚀



