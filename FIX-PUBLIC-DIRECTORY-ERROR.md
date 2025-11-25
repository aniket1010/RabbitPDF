# 🔧 Fix: Public Directory Not Found Error

## 🎯 **The Problem:**

Build failing with:
```
failed to solve: failed to compute cache key: "/app/public": not found
```

**Why:** The `public` directory might not be copied correctly, or Docker is looking for it before it's created.

---

## ✅ **The Fix:**

I've updated the Dockerfile locally. The fix ensures `public` exists in builder stage, then copies it conditionally in runner stage.

### **Update `frontend/Dockerfile` on Server**

**The key changes are:**

1. **In builder stage** - Verify public exists after `COPY . .`
2. **In runner stage** - Use mount syntax to conditionally copy public

**Here's the complete updated Dockerfile section for the runner stage (lines 70-82):**

```dockerfile
# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

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

## 🚀 **Alternative: Simpler Fix (If Mount Doesn't Work)**

**If the mount syntax doesn't work in your Docker version, use this simpler approach:**

Replace lines 74-82 with:

```dockerfile
# Copy public directory - create empty if it doesn't exist
RUN mkdir -p ./public && chown nextjs:nodejs ./public
# Copy public if it exists (will fail silently if missing)
COPY --from=builder --chown=nextjs:nodejs /app/public* ./public/ || true
```

**But COPY doesn't support `||`, so use this instead:**

```dockerfile
# Copy public directory
# Create empty directory first to avoid COPY failure
RUN mkdir -p ./public && chown nextjs:nodejs ./public
# Try to copy - if it fails, directory will be empty (which is OK)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public 2>&1 || echo "Public directory not found, using empty directory"
```

**Actually, COPY doesn't support error handling. So the best approach is:**

```dockerfile
# Copy public directory
# Ensure it exists in builder first, then copy normally
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
```

**But this will fail if public doesn't exist. So we need to ensure it exists in builder stage first (which we already do).**

---

## 🔍 **Debug: Check if Public Exists**

**On your server, check if public directory exists in the project:**

```bash
cd ~/RabbitPDF  # or ~/chatPDF
ls -la frontend/public
```

**If it doesn't exist, that's the problem!**

---

## ✅ **Simplest Solution:**

**If public directory exists in your project, the issue might be Docker cache. Try:**

```bash
# Clean build (no cache)
docker-compose -f docker-compose.production.yml build --no-cache frontend
```

**Or ensure public is copied explicitly in builder:**

Add this after `COPY . .` in builder stage:

```dockerfile
# Explicitly verify public directory was copied
RUN ls -la public || echo "Public directory missing!"
RUN if [ ! -d public ]; then mkdir -p public; fi
```

---

## 🚀 **Quick Copy Method:**

**Copy the updated Dockerfile from local:**

```powershell
cd D:\all_my_code\projects\chatPDF
scp -i C:\Users\$env:USERNAME\Downloads\chatpdf-key.pem frontend/Dockerfile ubuntu@YOUR_SERVER_IP:~/RabbitPDF/frontend/
```

**Then rebuild:**

```bash
docker-compose -f docker-compose.production.yml build --no-cache frontend
```

---

## 💡 **Most Likely Cause:**

The `public` directory exists locally but might not be getting copied to the server, or Docker is using cached layers where public didn't exist.

**Solution:** Clean build with `--no-cache` flag!

---

**Let me know if the build succeeds!** 🚀



