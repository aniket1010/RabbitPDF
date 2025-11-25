# 📧 How to Find Your SMTP Credentials

Since you're getting emails successfully, your SMTP credentials are stored in your **local environment file**.

---

## 🔍 **Where to Look:**

### **Option 1: Check Your Local `.env.local` File**

**On your Windows machine, open:**

```
frontend\.env.local
```

**Or:**

```
frontend\.env
```

**Look for these lines:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@gmail.com
```

---

## 📋 **Based on Your Code, Your SMTP Settings Are:**

From `frontend/check-env.js`, your expected values are:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=bhusalaniket100@gmail.com
SMTP_PASS=YOUR_16_CHAR_APP_PASSWORD
MAIL_FROM=bhusalaniket100@gmail.com
```

---

## 🔑 **How to Get Your Gmail App Password:**

If you don't remember your app password:

1. **Go to:** https://myaccount.google.com/apppasswords
2. **Sign in** with `bhusalaniket100@gmail.com`
3. **Create a new app password** (if you don't have one)
4. **Copy the 16-character password** (no spaces)

---

## ✅ **Add to Production `.env.production`:**

**In your `.env.production` file on the server, replace:**

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

**With:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=bhusalaniket100@gmail.com
SMTP_PASS=YOUR_16_CHAR_APP_PASSWORD_HERE
MAIL_FROM=bhusalaniket100@gmail.com
```

---

## 🎯 **Quick Steps:**

1. **Open** `frontend\.env.local` on your Windows machine
2. **Find** the SMTP variables
3. **Copy** the values
4. **Paste** them into `.env.production` on your server

**That's it!** 🎉

