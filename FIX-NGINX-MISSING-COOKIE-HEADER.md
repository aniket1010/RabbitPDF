# Fix Nginx Missing Cookie Header - CRITICAL

## 🎯 Problem Found

**The `/api` location block is missing cookie forwarding!**

**Current config:**
```nginx
location /api {
    # ... other headers ...
    proxy_set_header X-Forwarded-Proto $scheme;
    # ❌ MISSING: proxy_set_header Cookie $http_cookie;
}
```

**This is why backend routes don't receive cookies!**

---

## ✅ Fix: Add Cookie Header to `/api` Block

**On server:**
```bash
sudo nano /etc/nginx/sites-available/rabbitpdf
```

**Find the `/api` location block (around line 93-113) and add the cookie header:**

**Find:**
```nginx
    location /api {
        limit_req zone=api_limit burst=20 nodelay;

        # Strip /api prefix when proxying to backend
        rewrite ^/api(/.*)$ $1 break;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
```

**Add this line AFTER `X-Forwarded-Proto`:**
```nginx
        proxy_set_header Cookie $http_cookie;
```

**Should look like:**
```nginx
    location /api {
        limit_req zone=api_limit burst=20 nodelay;

        # Strip /api prefix when proxying to backend
        rewrite ^/api(/.*)$ $1 break;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;  # ✅ ADD THIS LINE
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # Increase body size for file uploads
        client_max_body_size 50M;
    }
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## ✅ Step 2: Test Nginx Config

**Test the config:**
```bash
sudo nginx -t
```

**Should show:** `syntax is ok` and `test is successful`

---

## ✅ Step 3: Reload Nginx

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

**Verify it's running:**
```bash
sudo systemctl status nginx
```

---

## ✅ Step 4: Test Cookie Forwarding

**Test if cookies now reach backend:**
```bash
curl -v -H "Cookie: test=value" https://rabbitpdf.in/api/conversation/list 2>&1 | grep -i "cookie"
```

**Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 20 | grep "session token received"
```

**Should now show:** `Session token received: EXISTS`

---

## ✅ Step 5: Test in Browser

1. **Clear browser cookies** (F12 → Application → Clear storage)
2. **Sign in** at `https://rabbitpdf.in/sign-in`
3. **Try accessing a protected route** (e.g., conversations should load)
4. **Check backend logs:**
```bash
docker-compose -f docker-compose.production.yml logs backend --tail 50 | grep "session token received"
```

**Should show:** `Session token received: EXISTS` ✅

---

## 🎯 Quick Fix Command (Alternative)

**If you prefer sed command:**
```bash
sudo sed -i '/location \/api {/,/proxy_set_header X-Forwarded-Proto \$scheme;/ {
    /proxy_set_header X-Forwarded-Proto \$scheme;/a\
        proxy_set_header Cookie $http_cookie;
}' /etc/nginx/sites-available/rabbitpdf
```

**Then test and reload:**
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## ✅ Verification Checklist

- [ ] Added `proxy_set_header Cookie $http_cookie;` to `/api` block
- [ ] Tested config: `sudo nginx -t` shows success
- [ ] Reloaded Nginx: `sudo systemctl reload nginx`
- [ ] Tested cookie forwarding: Backend logs show "EXISTS"
- [ ] Tested in browser: Sign in works, conversations load

---

## 🎉 Expected Result

**After this fix:**
- ✅ Cookies will be forwarded to backend
- ✅ Backend will see session tokens
- ✅ API calls will work without 401 errors
- ✅ WebSocket will authenticate properly

