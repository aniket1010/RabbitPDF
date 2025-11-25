# 🔧 Fix: CORS Error - Credentials Not Supported with Wildcard

## 🚨 **The Problem:**

**Error:** `Credential is not supported if the CORS header 'Access-Control-Allow-Origin' is '*'`

**Why:** The OPTIONS handler in the auth route is using `'*'` for `Access-Control-Allow-Origin`, but you're sending credentials (cookies). Browsers don't allow this combination.

---

## ✅ **Fix: Update OPTIONS Handler**

### **File to Fix:** `frontend/src/app/api/auth/[...all]/route.ts`

**Current code (line 64-74):**
```typescript
export const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',  // ❌ This is the problem!
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
```

**Fixed code:**
```typescript
export const OPTIONS = async (request: Request) => {
  const origin = request?.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,  // ✅ Use actual origin, not '*'
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
```

---

## 🔧 **Step-by-Step Fix:**

### **Step 1: Update Frontend Auth Route**

**On your server, SSH in:**

```bash
cd ~/RabbitPDF
nano frontend/src/app/api/auth/[...all]/route.ts
```

**Find line 64-74 and replace:**

**Change from:**
```typescript
export const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
```

**Change to:**
```typescript
export const OPTIONS = async (request: Request) => {
  const origin = request?.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### **Step 2: Update Backend CORS Config**

**Also update backend CORS to include your domain:**

```bash
nano backend/config/cors.js
```

**Update allowedOrigins:**

```javascript
const allowedOrigins = [
  // Development origins
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  // Production origins
  'http://rabbitpdf.in:3000',
  'http://www.rabbitpdf.in:3000',
  'http://rabbitpdf.in',
  'http://www.rabbitpdf.in',
  'http://51.20.135.170:3000',
  'http://51.20.135.170'
];
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### **Step 3: Rebuild Frontend**

**After fixing the code:**

```bash
docker-compose -f docker-compose.production.yml up -d --build frontend
```

**This rebuilds with the fix.**

---

### **Step 4: Restart Backend**

**After updating CORS config:**

```bash
docker-compose -f docker-compose.production.yml restart backend
```

---

### **Step 5: Test**

1. **Clear browser cache:** `Ctrl+Shift+Delete`
2. **Hard refresh:** `Ctrl+Shift+R`
3. **Try OAuth sign-in again**
4. **Should work now!** ✅

---

## 📋 **Complete Fixed Code:**

**`frontend/src/app/api/auth/[...all]/route.ts` - OPTIONS handler:**

```typescript
export const OPTIONS = async (request: Request) => {
  const origin = request?.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
```

---

## ✅ **Quick Fix Commands:**

```bash
# 1. SSH to server
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170

# 2. Update frontend auth route
cd ~/RabbitPDF
nano frontend/src/app/api/auth/[...all]/route.ts
# Fix OPTIONS handler (see above)

# 3. Update backend CORS
nano backend/config/cors.js
# Add domain to allowedOrigins (see above)

# 4. Rebuild frontend
docker-compose -f docker-compose.production.yml up -d --build frontend

# 5. Restart backend
docker-compose -f docker-compose.production.yml restart backend

# 6. Test in browser
```

---

## 🎯 **What Changed:**

**Before:**
- ❌ `Access-Control-Allow-Origin: '*'` (wildcard)
- ❌ Credentials enabled → Browser blocks it

**After:**
- ✅ `Access-Control-Allow-Origin: origin` (actual origin)
- ✅ Credentials enabled → Browser allows it

---

## 💡 **Why This Works:**

**Browsers have a security rule:**
- ✅ Credentials + specific origin = Allowed
- ❌ Credentials + wildcard (`*`) = Blocked

**By using the actual origin instead of `*`, credentials work!**

---

**Fix the OPTIONS handler and rebuild frontend - that's the key!** 🚀



