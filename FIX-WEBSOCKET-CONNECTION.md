# Fix WebSocket Connection Issues

## Problem: WebSocket Not Connecting (0 connected sockets)

The backend shows "Total connected sockets: 0", which means the WebSocket connection is failing.

---

## Step 1: Check Browser Console for Exact Error

**In browser (F12 → Console), look for:**
- `🔌 [WebSocket] Connecting to: ...`
- `❌ [WebSocket] Connection error: ...`
- Any 403, 404, or CORS errors

**Share the exact error message.**

---

## Step 2: Check if WebSocket Authentication is Failing

**On server, check backend logs when you try to connect:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 100 | grep -i "websocket\|connection\|auth"
```

**Look for:**
- `🔌 [WebSocket] Connection attempt from:` - Should see this when you load the page
- `✅ [WebSocket] Client connected:` - Should see this if connection succeeds
- `❌ [WebSocket] Auth error:` - If you see this, authentication is failing

---

## Step 3: Temporarily Disable WebSocket Authentication (For Testing)

**If authentication is blocking connections, temporarily allow unauthenticated:**

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

**Change to (TEMPORARY - for testing only):**
```javascript
      } else {
        // TEMPORARY: Allow connection for debugging
        console.warn('⚠️ [WebSocket] Allowing connection without auth for debugging');
        socket.userId = req.userId || 'temp-user';
        socket.userEmail = 'temp@example.com';
        socket.userName = 'Temp User';
        next();
      }
```

**Rebuild backend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build backend
```

**Test again. If WebSocket connects now, the issue is authentication. Then we'll fix auth properly.**

---

## Step 4: Check Cookie Transmission

**WebSocket needs cookies for authentication. Check if cookies are being sent:**

**In browser console (F12), run:**
```javascript
// Check if cookies exist
console.log('Cookies:', document.cookie);

// Check Socket.IO connection
// Look in Network tab → WS requests → Headers → Cookie header
```

**If cookies aren't being sent:**
- Make sure you're logged in
- Check browser settings (blocking cookies?)
- Check if `withCredentials: true` is set in Socket.IO config (it is in the code)

---

## Step 5: Verify Nginx is Forwarding Cookies

**On server, check nginx config:**
```bash
sudo cat /etc/nginx/sites-available/rabbitpdf | grep -A 20 "location /socket.io"
```

**Make sure it includes:**
```nginx
proxy_set_header Cookie $http_cookie;
```

**If missing, add it:**
```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**In the `/socket.io` location block, add:**
```nginx
proxy_set_header Cookie $http_cookie;
```

**After `proxy_set_header Origin $http_origin;`**

**Then:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 6: Check Socket.IO Path Configuration

**The frontend uses `path: '/socket.io/'` but nginx routes `/socket.io` directly.**

**Verify nginx routes correctly:**
```bash
curl -v https://rabbitpdf.in/socket.io/?EIO=4&transport=polling 2>&1 | grep -i "HTTP\|cookie\|origin"
```

**Should see:**
- `HTTP/1.1 400 Bad Request` (normal for Socket.IO handshake)
- Cookie headers being sent

---

## Step 7: Add Debug Logging to Backend

**On server:**
```bash
nano backend/websocket.js
```

**Add more logging (around line 14-38):**
```javascript
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      console.log('🔌 [WebSocket] Connection attempt from:', socket.handshake.address);
      console.log('🔌 [WebSocket] Headers:', {
        origin: socket.handshake.headers.origin,
        cookie: socket.handshake.headers.cookie ? 'Present' : 'Missing',
        userAgent: socket.handshake.headers['user-agent']
      });
      
      const authResult = await verifyWebSocketAuth(socket);
      
      console.log('🔌 [WebSocket] Auth result:', {
        authenticated: authResult.authenticated,
        userId: authResult.userId,
        error: authResult.error
      });
      
      if (authResult.authenticated) {
        socket.userId = authResult.userId;
        socket.userEmail = authResult.userEmail;
        socket.userName = authResult.userName;
        console.log('✅ [WebSocket] Authentication successful for user:', authResult.userId);
        next();
      } else {
        console.warn('⚠️ [WebSocket] Authentication failed:', authResult.error);
        if (process.env.NODE_ENV !== 'production') {
          socket.userId = 'dev-user';
          socket.userEmail = 'dev@example.com';
          socket.userName = 'Developer';
          console.log('🔧 [WebSocket] Using dev user');
          next();
        } else {
          // TEMPORARY: Allow for debugging
          console.warn('⚠️ [WebSocket] Allowing connection without auth for debugging');
          socket.userId = 'temp-user';
          socket.userEmail = 'temp@example.com';
          socket.userName = 'Temp User';
          next();
          // next(new Error('Authentication failed'));
        }
      }
    } catch (error) {
      console.error('❌ [WebSocket] Auth error:', error);
      console.error('❌ [WebSocket] Error stack:', error.stack);
      // TEMPORARY: Allow for debugging
      socket.userId = 'temp-user';
      socket.userEmail = 'temp@example.com';
      socket.userName = 'Temp User';
      next();
      // next(new Error('Authentication failed'));
    }
  });
```

**Rebuild backend:**
```bash
docker-compose -f docker-compose.production.yml up -d --build backend
```

**Watch logs:**
```bash
docker-compose -f docker-compose.production.yml logs -f backend | grep -i websocket
```

**Now reload the page and check what logs appear.**

---

## Step 8: Test WebSocket Connection Manually

**In browser console (F12), run:**
```javascript
// Test Socket.IO connection
const socket = io('https://rabbitpdf.in', {
  withCredentials: true,
  transports: ['polling', 'websocket'],
  path: '/socket.io/'
});

socket.on('connect', () => {
  console.log('✅ Connected!', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});
```

**Check what happens. Share the console output.**

---

## Quick Fix: Update Nginx to Forward Cookies

**Most likely issue: Nginx isn't forwarding cookies to backend.**

**On server:**
```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**Find the `/socket.io` location block and make sure it has:**
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
    proxy_set_header Cookie $http_cookie;  # ADD THIS LINE
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

## After Fixing: Verify Connection

**1. Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep -i "websocket\|connected"
```

**Should see:**
```
✅ [WebSocket] Client connected: <socket-id>
```

**2. Check browser console:**
- Should see: `🔌 [WebSocket] Connected to server successfully!`

**3. Test real-time updates:**
- Change username → Should update immediately
- Rename conversation → Should update immediately

---

## If Still Not Working

**Provide:**
1. Browser console error (exact message)
2. Backend logs: `docker-compose logs backend --tail 100 | grep -i websocket`
3. Nginx error logs: `sudo tail -50 /var/log/nginx/error.log`
4. Network tab screenshot showing the WebSocket request

