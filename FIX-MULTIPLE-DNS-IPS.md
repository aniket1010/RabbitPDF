# 🔧 Fix: Multiple IP Addresses in DNS

## ✅ **Good News:**

Your DNS is working! `51.20.135.170` is in the list, which means your domain is pointing to your server.

---

## ⚠️ **Issue: Multiple IP Addresses**

**You're seeing:**
- ✅ `51.20.135.170` (your server - correct!)
- ❓ `76.223.105.230` (unknown - should remove)
- ❓ `13.248.243.5` (unknown - should remove)

**Having multiple IPs can cause:**
- Connection issues
- OAuth redirect problems
- Inconsistent behavior

---

## ✅ **Fix: Remove Extra A Records**

### **Step 1: Check GoDaddy DNS Records**

1. Go to: https://www.godaddy.com/
2. **My Products** → **Domains** → `rabbitpdf.in`
3. Click **"DNS"** or **"Manage DNS"**
4. Look at **A records**

**You should see something like:**
- A record for `@` pointing to `51.20.135.170` ✅
- A record for `@` pointing to `76.223.105.230` ❌ (remove)
- A record for `@` pointing to `13.248.243.5` ❌ (remove)

---

### **Step 2: Remove Extra A Records**

**For each extra A record:**

1. Click **"Edit"** (pencil icon) or **"Delete"** (trash icon)
2. **Delete** records pointing to:
   - `76.223.105.230`
   - `13.248.243.5`
3. **Keep only** the record pointing to `51.20.135.170`

---

### **Step 3: Verify DNS Records**

**After removing extra records, you should have:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 51.20.135.170 | 600 |

**Optional (for www subdomain):**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | www | 51.20.135.170 | 600 |

---

### **Step 4: Wait for DNS Update**

**After removing extra records:**
- Wait 5-30 minutes
- Test again:

```powershell
nslookup rabbitpdf.in
```

**Should show only:**
```
Name:    rabbitpdf.in
Address:  51.20.135.170
```

---

## 🚀 **While DNS Updates: Test Your Application**

**Even with multiple IPs, you can test:**

1. **Try accessing:** `http://rabbitpdf.in:3000`
2. **If it doesn't work, try:** `http://51.20.135.170:3000` (direct IP)
3. **Check OAuth:** Try Google/GitHub sign-in

---

## ✅ **Quick Checklist:**

- [ ] Check GoDaddy DNS records
- [ ] Remove A records pointing to `76.223.105.230`
- [ ] Remove A records pointing to `13.248.243.5`
- [ ] Keep only A record pointing to `51.20.135.170`
- [ ] Wait 5-30 minutes
- [ ] Test: `nslookup rabbitpdf.in` (should show only one IP)
- [ ] Test: `http://rabbitpdf.in:3000`

---

## 💡 **Why Multiple IPs?**

**Possible reasons:**
- Old DNS records not removed
- Multiple A records accidentally added
- GoDaddy default records
- Load balancer records (if you had one before)

**Solution:** Keep only the one pointing to your server!

---

## 🎯 **After Fixing DNS:**

**Once you have only one IP (`51.20.135.170`):**

1. ✅ DNS will be clean
2. ✅ OAuth will work reliably
3. ✅ Application will be accessible consistently

---

**Go to GoDaddy, check your DNS records, and remove the extra A records!** 🚀



