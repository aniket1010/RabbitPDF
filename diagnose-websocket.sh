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
echo "9. Checking nginx Cookie forwarding..."
sudo grep -q "proxy_set_header Cookie" /etc/nginx/sites-available/rabbitpdf && echo "✅ Cookies forwarded" || echo "❌ Cookies NOT forwarded"

echo ""
echo "10. Checking nginx Connection upgrade..."
sudo grep -A 2 "location /socket.io" /etc/nginx/sites-available/rabbitpdf | grep -q "Connection" && echo "✅ Connection header set" || echo "❌ Connection header missing"

echo ""
echo "=== Diagnostic Complete ==="
echo ""
echo "Next steps:"
echo "1. Open browser → F12 → Console"
echo "2. Look for WebSocket errors"
echo "3. Run: docker-compose logs backend -f | grep websocket"
echo "4. Load the page and watch for connection attempts"

