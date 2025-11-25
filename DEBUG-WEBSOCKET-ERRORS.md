# Debug WebSocket Errors

## Step 1: Check What Error You're Getting

**Open browser console (F12) and check:**
- What's the exact error message?
- Is it 403 Forbidden?
- Is it connection timeout?
- Is it CORS error?

---

## Step 2: Verify Frontend WebSocket Connection URL

**On server, check frontend logs:**
```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml logs frontend --tail 100 | grep -i "websocket\|socket\|connecting"
```

**Should see:**
```
🔌 [WebSocket] Connecting to: https://rabbitpdf.in
```

**If you see `https://rabbitpdf.in/api` or `http://rabbitpdf.in:5000`, the fix wasn't applied correctly.**

---

## Step 3: Check Backend CORS Configuration

**On server:**
```bash
cat backend/config/cors.js
```

**Should show:**
```javascript
'https://rabbitpdf.in',
'https://www.rabbitpdf.in'
```

**If not, update it:**
```bash
nano backend/config/cors.js
# Replace 'yourdomain.com' with 'rabbitpdf.in'
# Save: Ctrl+O, Enter, Ctrl+X

# Rebuild backend
docker-compose -f docker-compose.production.yml up -d --build backend
```

---

## Step 4: Check Nginx Socket.IO Configuration

**On server:**
```bash
sudo cat /etc/nginx/sites-available/rabbitpdf | grep -A 15 "location /socket.io"
```

**Should show:**
```nginx
location /socket.io {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Origin $http_origin;
    proxy_cache_bypass $http_upgrade;
    
    # WebSocket specific timeouts
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_connect_timeout 75s;
}
```

**If `proxy_set_header Origin $http_origin;` is missing, add it:**
```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
# Add: proxy_set_header Origin $http_origin; after X-Forwarded-Proto line
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 5: Check Backend WebSocket Logs

**On server:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep -i "websocket\|socket\|connection\|auth"
```

**Look for:**
- `🔌 [WebSocket] Connection attempt from:` - Should see connection attempts
- `✅ [WebSocket] Client connected:` - Should see successful connections
- `❌ [WebSocket] Auth error:` - If you see this, authentication is failing

---

## Step 6: Test WebSocket Connection Directly

**On server, test if Socket.IO endpoint is accessible:**
```bash
curl -I https://rabbitpdf.in/socket.io/?EIO=4&transport=polling
```

**Should return:** `200 OK` or `400 Bad Request` (not 403)

**If 403, check:**
1. Nginx configuration
2. Backend CORS
3. Backend is running

---

## Step 7: Check Authentication Cookies

**In browser console (F12), run:**
```javascript
document.cookie
```

**Should see:** `better-auth.session_token=...` or `better-auth.session-token=...`

**If not, you're not logged in. Sign in first.**

---

## Step 8: Verify Environment Variables

**On server:**
```bash
cd ~/RabbitPDF
grep -E "NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_API_BASE|NODE_ENV" .env
```

**Should show:**
```
NEXT_PUBLIC_APP_URL=https://rabbitpdf.in
NEXT_PUBLIC_API_BASE=https://rabbitpdf.in/api
NODE_ENV=production
```

**If wrong, fix:**
```bash
sed -i 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://rabbitpdf.in|g' .env
sed -i 's|NEXT_PUBLIC_API_BASE=.*|NEXT_PUBLIC_API_BASE=https://rabbitpdf.in/api|g' .env
sed -i 's|NODE_ENV=.*|NODE_ENV=production|g' .env

# Rebuild frontend
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## Step 9: Check if Backend Allows WebSocket Without Auth (Temporary Debug)

**If authentication is the issue, temporarily allow unauthenticated connections:**

**On server:**
```bash
nano backend/websocket.js
```

**Find (around line 25-33):**
```javascript
      } else {
        if (process.env.NODE_ENV !== 'production') {
          socket.userId = 'dev-user';
          socket.userEmail = 'dev@example.com';
          socket.userName = 'Developer';
          next();
        } else {
          next(new Error('Authentication failed'));
        }
      }
```

**Temporarily change to (for debugging only):**
```javascript
      } else {
        // TEMPORARY: Allow connection even without auth for debugging
        console.warn('⚠️ [WebSocket] Allowing unauthenticated connection for debugging');
        socket.userId = 'temp-user';
        socket.userEmail = 'temp@example.com';
        socket.userName = 'Temp User';
        next();
      }
```

**Rebuild backend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build backend
```

**Test again. If it works, the issue is authentication. Revert the change and fix auth instead.**

---

## Step 10: Check Browser Network Tab

**In browser DevTools:**
1. Go to Network tab
2. Filter by "WS" (WebSocket) or "socket.io"
3. Click on the failed request
4. Check:
   - **Request URL:** Should be `wss://rabbitpdf.in/socket.io/...`
   - **Status:** What's the status code?
   - **Headers:** Are cookies being sent?
   - **Response:** What's the error message?

---

## Common Issues and Fixes

### Issue 1: 403 Forbidden
**Cause:** CORS or authentication
**Fix:**
```bash
# Check CORS config
cat backend/config/cors.js

# Rebuild backend
docker-compose -f docker-compose.production.yml up -d --build backend
```

### Issue 2: Connection Timeout
**Cause:** Nginx not forwarding WebSocket properly
**Fix:**
```bash
# Check nginx config
sudo nginx -t
sudo systemctl reload nginx

# Check backend is running
docker-compose -f docker-compose.production.yml ps backend
```

### Issue 3: CORS Error
**Cause:** Origin not in allowed list
**Fix:**
```bash
# Update CORS config
nano backend/config/cors.js
# Make sure 'https://rabbitpdf.in' is in allowedOrigins

# Rebuild backend
docker-compose -f docker-compose.production.yml up -d --build backend
```

### Issue 4: Authentication Failed
**Cause:** Cookies not being sent or session expired
**Fix:**
- Sign out and sign back in
- Check browser console for cookie errors
- Verify session exists in database

---

## Quick Test Script

**Run this on server to test everything:**
```bash
#!/bin/bash
echo "=== Testing WebSocket Setup ==="

echo "1. Checking backend CORS..."
grep -q "rabbitpdf.in" backend/config/cors.js && echo "✅ CORS configured" || echo "❌ CORS not configured"

echo "2. Checking nginx config..."
sudo nginx -t && echo "✅ Nginx config valid" || echo "❌ Nginx config invalid"

echo "3. Checking backend container..."
docker-compose -f docker-compose.production.yml ps backend | grep -q "Up" && echo "✅ Backend running" || echo "❌ Backend not running"

echo "4. Checking frontend container..."
docker-compose -f docker-compose.production.yml ps frontend | grep -q "Up" && echo "✅ Frontend running" || echo "❌ Frontend not running"

echo "5. Testing Socket.IO endpoint..."
curl -s -o /dev/null -w "%{http_code}" https://rabbitpdf.in/socket.io/?EIO=4&transport=polling
echo ""

echo "6. Checking environment variables..."
grep -q "NEXT_PUBLIC_APP_URL=https://rabbitpdf.in" .env && echo "✅ APP_URL correct" || echo "❌ APP_URL incorrect"
grep -q "NEXT_PUBLIC_API_BASE=https://rabbitpdf.in/api" .env && echo "✅ API_BASE correct" || echo "❌ API_BASE incorrect"

echo "=== Done ==="
```

**Save as `test-websocket.sh`, make executable, and run:**
```bash
chmod +x test-websocket.sh
./test-websocket.sh
```

---

## Still Not Working?

**Provide these details:**
1. Exact error message from browser console
2. Backend logs: `docker-compose logs backend --tail 50`
3. Frontend logs: `docker-compose logs frontend --tail 50`
4. Nginx error logs: `sudo tail -50 /var/log/nginx/error.log`
5. Network tab screenshot showing the failed WebSocket request

