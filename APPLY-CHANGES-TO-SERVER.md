# 📝 How to Apply Code Changes to Server

## 🎯 **Option 1: Edit File Directly on Server (Easiest)**

### **Step 1: SSH into Server**

```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
```

---

### **Step 2: Navigate to Project Directory**

```bash
cd ~/RabbitPDF
```

---

### **Step 3: Edit the File**

```bash
# Edit the verification endpoint file
nano frontend/src/app/api/auth/email/verify-and-login/route.ts
```

---

### **Step 4: Make the Changes**

**Find these lines and update them:**

**1. After line 10, add:**
```typescript
    // Use NEXT_PUBLIC_APP_URL for redirects (not internal Docker hostname)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
```

**2. Replace all instances of:**
```typescript
new URL("/sign-in", url)
```

**With:**
```typescript
new URL("/sign-in", appUrl)
```

**3. Replace all instances of:**
```typescript
new URL(`/sign-in?email=...`, url)
```

**With:**
```typescript
new URL(`/sign-in?email=...`, appUrl)
```

**4. Replace:**
```typescript
new URL("/", url)
```

**With:**
```typescript
new URL("/", appUrl)
```

**5. In the catch block (line 102), replace:**
```typescript
    const url = new URL(request.url);
    return NextResponse.redirect(new URL(`/sign-in`, url));
```

**With:**
```typescript
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    return NextResponse.redirect(new URL(`/sign-in`, appUrl));
```

---

### **Step 5: Save and Exit**

**In nano:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

---

### **Step 6: Rebuild Frontend**

```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## 🎯 **Option 2: Copy File from Local to Server**

### **Step 1: Copy File from Local**

**From your local machine:**

```bash
scp -i rabbitpdf-key.pem frontend/src/app/api/auth/email/verify-and-login/route.ts ubuntu@51.20.135.170:~/RabbitPDF/frontend/src/app/api/auth/email/verify-and-login/route.ts
```

---

### **Step 2: Rebuild Frontend**

**SSH into server and rebuild:**

```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## 🎯 **Option 3: Use Git (If Using Version Control)**

### **Step 1: Commit Changes Locally**

```bash
git add frontend/src/app/api/auth/email/verify-and-login/route.ts
git commit -m "Fix email verification redirect to use NEXT_PUBLIC_APP_URL"
git push
```

---

### **Step 2: Pull on Server**

**SSH into server:**

```bash
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
cd ~/RabbitPDF
git pull
docker-compose -f docker-compose.production.yml up -d --build frontend
```

---

## 📋 **Quick Summary:**

**Easiest method:**
1. SSH into server
2. Edit file with nano
3. Make changes
4. Rebuild frontend

**Or copy file:**
1. Copy file from local to server with scp
2. Rebuild frontend

---

**Choose the method that works best for you!** 🚀



