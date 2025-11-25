# 🔧 Update Dockerfile - Add Prisma Files

## ✅ **Your Current Production Stage:**

**You need to add Prisma files copy. Here's the updated version:**

---

## 📝 **Updated Production Stage:**

**Replace your current production stage (from `FROM node:18-alpine AS runner` onwards) with:**

```dockerfile
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

# Copy Prisma schema and generated client (needed at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

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

---

## 🔧 **What Changed:**

**Added these 3 lines after copying `.next/static`:**

```dockerfile
# Copy Prisma schema and generated client (needed at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
```

---

## 📋 **Step-by-Step:**

### **On Your Server:**

```bash
cd ~/RabbitPDF
nano frontend/Dockerfile
```

**Find the production stage section and add the Prisma copy lines.**

**Or replace the entire production stage section with the code above.**

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## 🚀 **After Updating:**

**Rebuild frontend:**

```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## ✅ **Quick Copy-Paste:**

**Just add these 3 lines after `COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static`:**

```dockerfile
# Copy Prisma schema and generated client (needed at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
```

---

**Add those 3 lines and rebuild!** 🚀



