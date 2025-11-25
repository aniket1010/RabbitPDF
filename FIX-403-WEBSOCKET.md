# Fix 403 Forbidden WebSocket Error

## Problem: 403 Forbidden on `/socket.io/`

The error shows: `Failed to load resource: the server responded with a status of 403 (Forbidden)`

This means the request reaches the backend but is being rejected.

---

## Root Cause

The backend's `allowRequest` callback in Socket.IO is checking CORS origins, but it's likely:
1. Not receiving the origin header properly through nginx
2. Or the origin check is failing

---

## Fix 1: Update Backend Socket.IO allowRequest

**On server:**
```bash
nano backend/index.js
```

**Find (around line 29-39):**
```javascript
  allowRequest: (req, callback) => {
    // Allow all requests in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    // In production, check origin
    const origin = req.headers.origin;
    const allowed = corsConfig.origin.includes(origin);
    callback(null, allowed);
  }
```

**Replace with:**
```javascript
  allowRequest: (req, callback) => {
    // Allow all requests in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    // In production, check origin
    const origin = req.headers.origin;
    console.log('🔍 [Socket.IO] Connection request from origin:', origin);
    console.log('🔍 [Socket.IO] Allowed origins:', corsConfig.origin);
    
    // If origin is missing, check Referer header (nginx might strip Origin)
    const checkOrigin = origin || req.headers.referer?.split('/').slice(0, 3).join('/');
    console.log('🔍 [Socket.IO] Checking origin:', checkOrigin);
    
    // Allow if origin matches or if it's from our domain
    const allowed = !checkOrigin || 
                   corsConfig.origin.includes(checkOrigin) ||
                   checkOrigin.includes('rabbitpdf.in');
    
    console.log('🔍 [Socket.IO] Allowed?', allowed);
    
    if (!allowed) {
      console.warn('⚠️ [Socket.IO] Rejecting connection from:', checkOrigin);
    }
    
    callback(null, allowed);
  }
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Rebuild backend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build backend
```

---

## Fix 2: Ensure Nginx Forwards Origin Header

**On server:**
```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**In the `/socket.io` location block, make sure you have:**
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
    proxy_set_header Origin $http_origin;  # Make sure this is here
    proxy_set_header Cookie $http_cookie;   # Make sure this is here
    proxy_cache_bypass $http_upgrade;
    
    # WebSocket specific timeouts
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_connect_timeout 75s;
}
```

**Save and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Fix 3: Temporarily Allow All Origins (For Testing)

**If Fix 1 doesn't work, temporarily allow all origins to test:**

**On server:**
```bash
nano backend/index.js
```

**Change allowRequest to:**
```javascript
  allowRequest: (req, callback) => {
    // TEMPORARY: Allow all for debugging
    console.log('🔍 [Socket.IO] Allowing connection from:', req.headers.origin);
    callback(null, true);
  }
```

**Rebuild backend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build backend
```

**Test again. If it works, the issue is CORS. Then we'll fix it properly.**

---

## Quick Test After Fix

**1. Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs -f backend | grep -i "socket\|websocket\|connection"
```

**2. Reload page and watch for:**
- `🔍 [Socket.IO] Connection request from origin: https://rabbitpdf.in`
- `🔍 [Socket.IO] Allowed? true`
- `✅ [WebSocket] Client connected:`

**3. Browser console should show:**
- `🔌 [WebSocket] Connected to server successfully!`

---

## Most Likely Fix

**The issue is the `allowRequest` callback. Update it with Fix 1, rebuild backend, and it should work.**

