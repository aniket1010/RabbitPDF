# Fix WebSocket After HTTPS Migration

## Problem: WebSocket stopped working after switching to HTTPS

When switching from HTTP to HTTPS, WebSocket connections need special configuration.

---

## Issue 1: Cookie SameSite Attribute

**HTTPS requires cookies to have proper SameSite settings. Check backend cookie settings:**

**On server:**
```bash
# Check if better-auth is setting cookies correctly
grep -r "sameSite\|SameSite" frontend/src/lib/auth.ts frontend/src/app/api/auth
```

**The issue:** Cookies set by better-auth might have `SameSite=None` but missing `Secure` flag, or vice versa.

---

## Issue 2: Socket.IO Secure Connection

**Socket.IO needs to use WSS (WebSocket Secure) for HTTPS. Verify frontend config:**

**The frontend code should already handle this, but verify:**

**On server, check:**
```bash
grep -A 5 "const newSocket = io" frontend/src/hooks/useWebSocket.ts
```

**Should show:**
```typescript
const newSocket = io(serverUrl, {
  withCredentials: true,  // Important for HTTPS
  autoConnect: true,
  transports: ['polling', 'websocket'],
  // ...
});
```

---

## Issue 3: Nginx WebSocket Upgrade Headers

**Make sure nginx properly handles WebSocket upgrades:**

**On server:**
```bash
sudo cat /etc/nginx/sites-available/rabbitpdf | grep -A 20 "location /socket.io"
```

**Should have:**
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

---

## Quick Fix: Update Nginx Socket.IO Config

**On server:**
```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**Find `/socket.io` location and ensure it's exactly:**
```nginx
location /socket.io {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Origin $http_origin;
    proxy_set_header Cookie $http_cookie;
    proxy_cache_bypass $http_upgrade;
    
    # WebSocket specific timeouts
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_connect_timeout 75s;
}
```

**Note:** Changed `Connection "upgrade"` to `Connection $connection_upgrade` (more reliable)

**Also, add this at the top of the `server` block (before locations):**
```nginx
# WebSocket upgrade map
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```

**Full server block should start like:**
```nginx
server {
    server_name rabbitpdf.in www.rabbitpdf.in;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/rabbitpdf.in/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/rabbitpdf.in/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    # WebSocket upgrade map
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    # Frontend
    location / {
        # ... rest of config
```

**Save and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Fix 2: Check Better-Auth Cookie Settings

**Better-auth might need explicit cookie settings for HTTPS. Check:**

**On server:**
```bash
grep -r "cookie\|Cookie" frontend/src/lib/auth.ts | head -20
```

**If cookies aren't being set with Secure flag, we need to update better-auth config.**

---

## Fix 3: Verify Socket.IO is Using WSS

**In browser console (F12), check Network tab:**
1. Filter by "WS" (WebSocket)
2. Click on the Socket.IO request
3. Check the URL - should be `wss://rabbitpdf.in/socket.io/...` (WSS, not WS)

**If it's using WS instead of WSS, that's the problem.**

---

## Fix 4: Add Explicit Secure Flag to Socket.IO Config

**Update frontend WebSocket config to force secure connection:**

**On server:**
```bash
nano frontend/src/hooks/useWebSocket.ts
```

**Find the Socket.IO initialization (around line 57) and ensure:**
```typescript
const newSocket = io(serverUrl, {
  withCredentials: true,
  autoConnect: true,
  transports: ['polling', 'websocket'],
  upgrade: true,
  rememberUpgrade: false,
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  path: '/socket.io/',
  secure: true,  // ADD THIS - Forces WSS for HTTPS
  rejectUnauthorized: false  // ADD THIS - Allows self-signed certs if needed
});
```

**Rebuild frontend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## Fix 5: Check Backend CORS for HTTPS Origin

**Backend CORS should allow HTTPS origin:**

**On server:**
```bash
cat backend/config/cors.js
```

**Should have:**
```javascript
'https://rabbitpdf.in',
'https://www.rabbitpdf.in'
```

**If missing, add them and rebuild backend.**

---

## Complete Nginx Config Fix

**Here's the complete corrected `/socket.io` location block:**

```nginx
# WebSocket upgrade map (add at top of server block, before locations)
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# Inside server block:
location /socket.io {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Origin $http_origin;
    proxy_set_header Cookie $http_cookie;
    proxy_cache_bypass $http_upgrade;
    
    # WebSocket specific timeouts
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_connect_timeout 75s;
    
    # HTTPS specific
    proxy_ssl_verify off;
}
```

---

## Test After Fixes

**1. Reload nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**2. Rebuild frontend (if you changed Socket.IO config):**
```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**3. Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs -f backend | grep -i websocket
```

**4. In browser:**
- Open `https://rabbitpdf.in`
- F12 → Console
- Should see: `🔌 [WebSocket] Connected to server successfully!`
- Network tab → WS → Should show `wss://rabbitpdf.in/socket.io/...`

---

## Most Likely Fix

**The most common issue after HTTPS migration is the `Connection` header. Update nginx:**

```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**Add at top of server block (before `location /`):**
```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```

**Update `/socket.io` location:**
```nginx
proxy_set_header Connection $connection_upgrade;
```

**Instead of:**
```nginx
proxy_set_header Connection "upgrade";
```

**Then:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**This should fix it!**

