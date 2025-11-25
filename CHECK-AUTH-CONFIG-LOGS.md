# 🔍 Check Auth Config Logs - Full Output

## ✅ **See Full Auth Config:**

**The grep command might be cutting off the output. Try:**

```bash
docker-compose -f docker-compose.production.yml logs frontend | grep -A 10 "Auth Config"
```

**This shows 10 lines after "Auth Config"**

---

## 🔍 **Or See All Frontend Logs:**

**To see the full auth config output:**

```bash
docker-compose -f docker-compose.production.yml logs frontend | tail -50
```

**This shows the last 50 lines of logs**

---

## 📋 **What to Look For:**

**You should see something like:**

```
🔍 [Auth Config] Environment variables check: {
  GOOGLE_CLIENT_ID: 'SET (155650275421-iojd4...)',
  GOOGLE_CLIENT_SECRET: 'SET',
  GITHUB_CLIENT_ID: 'SET',
  GITHUB_CLIENT_SECRET: 'SET',
  BETTER_AUTH_SECRET: 'SET',
  NEXT_PUBLIC_APP_URL: 'http://rabbitpdf.in:3000',
  NODE_ENV: 'production',
  APP_URL: 'http://rabbitpdf.in:3000'
}
```

---

## ✅ **Check Specific Values:**

**Check NEXT_PUBLIC_APP_URL:**

```bash
docker-compose -f docker-compose.production.yml logs frontend | grep "NEXT_PUBLIC_APP_URL"
```

**Should show:**
```
NEXT_PUBLIC_APP_URL: 'http://rabbitpdf.in:3000',
```

**If it shows something else (like IP address), rebuild needed!**

---

## 🚀 **Quick Commands:**

```bash
# See full auth config (10 lines after)
docker-compose -f docker-compose.production.yml logs frontend | grep -A 10 "Auth Config"

# See last 50 lines
docker-compose -f docker-compose.production.yml logs frontend | tail -50

# Check specific variable
docker-compose -f docker-compose.production.yml logs frontend | grep "NEXT_PUBLIC_APP_URL"

# See all logs
docker-compose -f docker-compose.production.yml logs frontend
```

---

**Run the command with `-A 10` to see the full output!** 🔍



