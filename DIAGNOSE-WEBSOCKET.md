# Simple WebSocket Diagnostic

## Step 1: Get Exact Error from Browser

**Open browser → F12 → Console tab**

**Look for WebSocket errors. Copy the EXACT error message.**

**Common errors:**
- `403 Forbidden` → Authentication/CORS issue
- `404 Not Found` → Wrong URL/path
- `Connection timeout` → Nginx not forwarding
- `xhr poll error` → CORS or authentication

**What error do you see?** (Copy and paste it here)

---

## Step 2: Check Backend Logs When You Load Page

**On server, run this BEFORE loading the page:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 0 -f | grep -i websocket
```

**Then load `https://rabbitpdf.in` in browser**

**What do you see in the logs?**
- Nothing? → Request not reaching backend
- `Connection attempt from:` → Request reaching backend
- `Authentication failed` → Auth issue
- `Client connected` → Connection working!

**Stop with Ctrl+C after checking**

---

## Step 3: Test Socket.IO Endpoint Directly

**On server:**
```bash
curl -v https://rabbitpdf.in/socket.io/?EIO=4&transport=polling 2>&1 | head -30
```

**What HTTP status code do you get?**
- `200` or `400` → Endpoint is reachable (good!)
- `403` → CORS/authentication blocking
- `404` → Wrong path/nginx config issue
- `502` → Backend not running

---

## Step 4: Check if WebSocket URL is Correct

**In browser console (F12), run:**
```javascript
console.log('APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
console.log('API_BASE:', process.env.NEXT_PUBLIC_API_BASE);
```

**What does it show?**
- Should be: `https://rabbitpdf.in` and `https://rabbitpdf.in/api`
- If different → Frontend not rebuilt with new env vars

---

## Step 5: Test WebSocket Connection Manually

**In browser console (F12), run:**
```javascript
const testSocket = io('https://rabbitpdf.in', {
  withCredentials: true,
  transports: ['polling'],
  path: '/socket.io/'
});

testSocket.on('connect', () => {
  console.log('✅ CONNECTED!', testSocket.id);
});

testSocket.on('connect_error', (error) => {
  console.error('❌ CONNECTION ERROR:', error.message, error);
});

setTimeout(() => {
  console.log('Socket connected?', testSocket.connected);
  console.log('Socket ID:', testSocket.id);
}, 3000);
```

**What happens?**
- `✅ CONNECTED!` → WebSocket works! Problem is in app code
- `❌ CONNECTION ERROR:` → Copy the exact error message

---

## Based on Results, Here's the Fix:

### If Step 1 shows `403 Forbidden`:
→ **Fix:** Update backend CORS and ensure cookies are forwarded

### If Step 2 shows nothing:
→ **Fix:** Nginx not forwarding `/socket.io` requests

### If Step 2 shows `Authentication failed`:
→ **Fix:** Cookies not being sent or backend auth issue

### If Step 3 shows `404`:
→ **Fix:** Nginx `/socket.io` location block missing

### If Step 4 shows wrong URL:
→ **Fix:** Rebuild frontend with correct env vars

### If Step 5 shows connection error:
→ **Fix:** Based on the specific error message

---

## Quick All-in-One Diagnostic Script

**Run this on server to check everything:**

```bash
#!/bin/bash
echo "=== WebSocket Diagnostic ==="
echo ""

echo "1. Checking backend container..."
docker-compose -f docker-compose.production.yml ps backend | grep -q "Up" && echo "✅ Backend running" || echo "❌ Backend not running"

echo ""
echo "2. Checking frontend container..."
docker-compose -f docker-compose.production.yml ps frontend | grep -q "Up" && echo "✅ Frontend running" || echo "❌ Frontend not running"

echo ""
echo "3. Testing Socket.IO endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://rabbitpdf.in/socket.io/?EIO=4&transport=polling)
if [ "$STATUS" = "200" ] || [ "$STATUS" = "400" ]; then
  echo "✅ Endpoint reachable (HTTP $STATUS)"
else
  echo "❌ Endpoint not reachable (HTTP $STATUS)"
fi

echo ""
echo "4. Checking nginx config..."
sudo nginx -t 2>&1 | grep -q "successful" && echo "✅ Nginx config valid" || echo "❌ Nginx config invalid"

echo ""
echo "5. Checking for /socket.io location in nginx..."
sudo grep -q "location /socket.io" /etc/nginx/sites-available/rabbitpdf && echo "✅ Socket.IO location exists" || echo "❌ Socket.IO location missing"

echo ""
echo "6. Checking backend CORS config..."
grep -q "rabbitpdf.in" backend/config/cors.js && echo "✅ CORS configured" || echo "❌ CORS not configured"

echo ""
echo "7. Checking environment variables..."
grep -q "NEXT_PUBLIC_APP_URL=https://rabbitpdf.in" .env && echo "✅ APP_URL correct" || echo "❌ APP_URL incorrect"
grep -q "NEXT_PUBLIC_API_BASE=https://rabbitpdf.in/api" .env && echo "✅ API_BASE correct" || echo "❌ API_BASE incorrect"

echo ""
echo "8. Checking frontend WebSocket code..."
grep -q "NEXT_PUBLIC_APP_URL" frontend/src/hooks/useWebSocket.ts && echo "✅ Using APP_URL" || echo "❌ Not using APP_URL"

echo ""
echo "=== Diagnostic Complete ==="
echo ""
echo "Now check browser console (F12) for WebSocket errors"
echo "And run: docker-compose logs backend -f | grep websocket"
```

**Save as `diagnose.sh`, make executable, and run:**
```bash
chmod +x diagnose.sh
./diagnose.sh
```

---

## After Running Diagnostic

**Share:**
1. Output of diagnostic script
2. Browser console error (from Step 1)
3. Backend logs when loading page (from Step 2)
4. Result of manual WebSocket test (from Step 5)

**Then I'll give you ONE specific fix based on what we find.**

