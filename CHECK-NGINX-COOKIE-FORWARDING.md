# Check Nginx Cookie Forwarding - Phase 2

## Step 1: Check Nginx Config for Cookie Forwarding

**SSH to server (if not already connected):**
```bash
ssh -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
```

**Check Nginx config:**
```bash
sudo cat /etc/nginx/sites-available/rabbitpdf | grep -A 10 "location /api"
```

**Look for:** `proxy_set_header Cookie $http_cookie;`

**Run this command and share the output:**
```bash
sudo cat /etc/nginx/sites-available/rabbitpdf | grep -B 2 -A 12 "location /api"
```

---

## Step 2: Check All Location Blocks

**Check if cookie forwarding exists in all relevant blocks:**
```bash
sudo cat /etc/nginx/sites-available/rabbitpdf | grep -B 2 -A 15 "location"
```

**Share the full output** - I need to see all location blocks.

---

## Step 3: Test Cookie Forwarding

**Test if Nginx forwards cookies to backend:**
```bash
# Test with a cookie
curl -v -H "Cookie: test=value" https://rabbitpdf.in/api/conversation/list 2>&1 | grep -i "cookie"
```

**Also check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 20
```

**Look for:** Does backend see the cookie in the request?

---

## Step 4: Check Backend Auth Middleware

**Check if backend is looking for cookies correctly:**
```bash
cat backend/utils/auth.js | grep -A 20 "session token received"
```

**Share the output** - I need to see how backend extracts cookies.

---

## 🎯 Expected Fix

**If Nginx is missing cookie forwarding:**

Add this line to all `/api` location blocks:
```nginx
proxy_set_header Cookie $http_cookie;
```

**Then reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📋 Quick Check Commands

**Run these and share outputs:**

1. **Check Nginx config:**
```bash
sudo cat /etc/nginx/sites-available/rabbitpdf | grep -B 2 -A 12 "location /api"
```

2. **Check backend auth code:**
```bash
cat backend/utils/auth.js | head -50
```

3. **Test cookie forwarding:**
```bash
curl -v -H "Cookie: test=value" https://rabbitpdf.in/api/conversation/list 2>&1 | head -30
```

