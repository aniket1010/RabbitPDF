# 🌐 Step 7: Update CORS Configuration

Let's update the CORS settings to allow your frontend to communicate with your backend!

---

## 🎯 **Goal:** Update CORS to allow your server IP/domain

**Time:** 2-3 minutes

**You should be:** Connected to server, in project directory

---

## 📋 **What is CORS?**

**CORS (Cross-Origin Resource Sharing)** controls which websites can access your API.

**We need to add your server IP/domain to the allowed list!**

---

## 📝 **Step-by-Step Instructions:**

### **7.1: Navigate to Backend Config**

**On your server, run:**

```bash
# Make sure you're in project directory
cd ~/RabbitPDF
# or
cd ~/ChatPDF

# Open the CORS config file
nano backend/config/cors.js
```

**✅ File opened? Let me know!**

---

### **7.2: Find the Production Origins**

**You'll see this section (around lines 11-14):**

```javascript
  // Production origins - UPDATE THESE
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'https://api.yourdomain.com'
```

---

### **7.3: Replace with Your Server IP**

**Replace those lines with your actual server IP:**

**If using IP address (no domain):**
```javascript
  // Production origins - UPDATE THESE
  'http://YOUR_SERVER_IP',
  'http://YOUR_SERVER_IP:3000',
  'http://YOUR_SERVER_IP:5000'
```

**Example (if your IP is `54.123.45.67`):**
```javascript
  // Production origins - UPDATE THESE
  'http://54.123.45.67',
  'http://54.123.45.67:3000',
  'http://54.123.45.67:5000'
```

**If using domain:**
```javascript
  // Production origins - UPDATE THESE
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://yourdomain.com',
  'http://www.yourdomain.com'
```

---

### **7.4: Get Your Server IP (if needed)**

**If you don't remember your IP, run:**

```bash
curl ifconfig.me
```

**Or check AWS Console:**
- EC2 → Instances → Your instance → Public IPv4 address

---

### **7.5: Complete Example**

**After updating, your file should look like this (using IP):**

```javascript
const allowedOrigins = [
  // Development origins
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  // Production origins - UPDATED
  'http://54.123.45.67',        // ← Your server IP
  'http://54.123.45.67:3000',   // ← Frontend
  'http://54.123.45.67:5000'    // ← Backend
];
```

---

### **7.6: Save the File**

**In nano:**
1. Press `Ctrl + X` (to exit)
2. Press `Y` (to confirm save)
3. Press `Enter` (to confirm filename)

**✅ File saved? Let me know!**

---

### **7.7: Verify the Changes**

**Run:**

```bash
# Check the file was updated
grep -A 3 "Production origins" backend/config/cors.js
```

**You should see your IP address in the output!**

---

## ✅ **Step 7 Complete Checklist:**

- [ ] Opened `backend/config/cors.js`
- [ ] Found the "Production origins" section
- [ ] Replaced `yourdomain.com` with your server IP
- [ ] Added all necessary URLs (with and without ports)
- [ ] Saved the file
- [ ] Verified changes

---

## 🚀 **Next Step:**

Once CORS is updated, tell me: **"Step 7 complete"** or **"CORS updated"**

Then we'll move to **Step 8: Deploy Application** 🚀

---

## 🆘 **Need Help?**

**If you get stuck:**
- Tell me your server IP and I'll help you format it correctly
- Tell me if you're using a domain or IP
- I'll guide you through it!

**Ready? Let's update CORS!** 🎯

