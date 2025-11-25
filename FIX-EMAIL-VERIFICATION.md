# 🔧 Fix: Email Verification Not Working

## 🚨 **The Problem:**

**Email verification emails are not being sent.**

**Possible causes:**
- SMTP not configured
- SMTP credentials incorrect
- SMTP connection errors
- Email service blocking

---

## ✅ **Solution: Check SMTP Configuration**

### **Step 1: Check SMTP Environment Variables**

**Check if SMTP is configured:**

```bash
# Check frontend environment variables
docker-compose -f docker-compose.production.yml exec frontend env | grep SMTP

# Or check .env file
cat .env | grep SMTP
```

**Required variables:**
- `SMTP_HOST` (e.g., `smtp.gmail.com`)
- `SMTP_PORT` (e.g., `587` or `465`)
- `SMTP_USER` (your email)
- `SMTP_PASS` (your email password or app password)
- `MAIL_FROM` (sender email address)

---

### **Step 2: Check Frontend Logs**

**Check if emails are being sent or if there are errors:**

```bash
# Check frontend logs for email sending
docker-compose -f docker-compose.production.yml logs frontend --tail 100 | grep -i "email\|smtp\|verification\|mail"

# Check for SMTP errors
docker-compose -f docker-compose.production.yml logs frontend --tail 200 | grep -i "error\|exception\|failed\|smtp"
```

---

### **Step 3: Test SMTP Configuration**

**Use the debug endpoint to test SMTP:**

```bash
# Test SMTP configuration
curl http://rabbitpdf.in:3000/api/debug/smtp
```

**Or check in browser:** `http://rabbitpdf.in:3000/api/debug/smtp`

---

### **Step 4: Check Email Verification Logs**

**When you try to verify email, check logs:**

```bash
# Watch frontend logs in real-time
docker-compose -f docker-compose.production.yml logs frontend -f

# Then try to send verification email and watch for errors
```

---

## 🎯 **Quick Diagnostic:**

```bash
# 1. Check SMTP configuration
docker-compose -f docker-compose.production.yml exec frontend env | grep SMTP

# 2. Check frontend logs for email errors
docker-compose -f docker-compose.production.yml logs frontend --tail 200 | grep -i "email\|smtp\|verification"

# 3. Test SMTP endpoint
curl http://rabbitpdf.in:3000/api/debug/smtp

# 4. Watch logs while testing
docker-compose -f docker-compose.production.yml logs frontend -f
```

---

## 💡 **Common Issues:**

**1. SMTP not configured:**
- Add SMTP credentials to `.env` file
- Restart frontend after adding

**2. Gmail App Password:**
- Use Gmail App Password (16 characters, no spaces)
- Enable 2FA on Gmail account first

**3. SMTP connection errors:**
- Check SMTP_HOST and SMTP_PORT
- Check firewall/security group allows SMTP port

**4. Email in spam folder:**
- Check spam/junk folder
- Verify MAIL_FROM matches SMTP_USER

---

## 🔧 **Fix SMTP Configuration:**

**If SMTP is not configured, add to `.env`:**

```bash
# Edit .env file
nano .env

# Add SMTP configuration (example for Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@gmail.com

# Restart frontend
docker-compose -f docker-compose.production.yml restart frontend
```

---

**Check SMTP configuration and frontend logs first!** 🔍



