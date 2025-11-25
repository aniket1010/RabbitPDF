# ✅ Can I Change Database Names? - Yes!

## 🎯 **Short Answer:**

**Variable NAMES:** ❌ **Don't change** (must stay: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)

**Variable VALUES:** ✅ **Yes, you can change!** (can change `chatpdf_user` and `chatpdf_production` to anything you want)

---

## 📝 **What You CAN Change:**

### **✅ Database User Name:**

**Default:**
```env
POSTGRES_USER=chatpdf_user
```

**You can change to:**
```env
POSTGRES_USER=myapp_user
POSTGRES_USER=admin
POSTGRES_USER=rabbitpdf_user
POSTGRES_USER=anything_you_want
```

**✅ This is fine!** Just use letters, numbers, and underscores.

---

### **✅ Database Name:**

**Default:**
```env
POSTGRES_DB=chatpdf_production
```

**You can change to:**
```env
POSTGRES_DB=myapp_production
POSTGRES_DB=rabbitpdf_db
POSTGRES_DB=production_db
POSTGRES_DB=anything_you_want
```

**✅ This is fine!** Just use letters, numbers, and underscores.

---

### **✅ Password:**

**You MUST change this!** Generate a strong password:

```env
POSTGRES_PASSWORD=GENERATE_A_STRONG_PASSWORD_HERE
```

---

## ❌ **What You CANNOT Change:**

### **Variable Names (These are fixed):**

```env
POSTGRES_USER=     ← This name must stay the same
POSTGRES_PASSWORD= ← This name must stay the same
POSTGRES_DB=       ← This name must stay the same
```

**Why?** These are standard PostgreSQL environment variable names that Docker and PostgreSQL expect.

---

## 💡 **Example - Custom Names:**

**You can do this:**

```env
# Custom user name
POSTGRES_USER=rabbitpdf_admin

# Custom database name
POSTGRES_DB=rabbitpdf_prod

# Strong password (required)
POSTGRES_PASSWORD=xK9mP2qR7vN4wL8tY3zA6bC1dE5fG
```

**Docker Compose will automatically:**
- Create user: `rabbitpdf_admin`
- Create database: `rabbitpdf_prod`
- Set password: `xK9mP2qR7vN4wL8tY3zA6bC1dE5fG`
- Create DATABASE_URL: `postgresql://rabbitpdf_admin:xK9mP2qR7vN4wL8tY3zA6bC1dE5fG@postgres:5432/rabbitpdf_prod`

**✅ Everything will work!**

---

## 🎯 **Best Practices:**

### **Good Names:**
```env
POSTGRES_USER=chatpdf_user        ✅
POSTGRES_USER=app_admin          ✅
POSTGRES_USER=myapp_user         ✅
POSTGRES_DB=chatpdf_production   ✅
POSTGRES_DB=app_prod            ✅
POSTGRES_DB=production_db       ✅
```

### **Avoid:**
```env
POSTGRES_USER=chatpdf-user      ❌ (hyphens not recommended)
POSTGRES_USER=chatpdf user      ❌ (spaces not allowed)
POSTGRES_DB=ChatPDF             ❌ (uppercase can cause issues)
```

**Use:** lowercase letters, numbers, and underscores

---

## ✅ **Summary:**

**Can change:**
- ✅ `chatpdf_user` → any name you want
- ✅ `chatpdf_production` → any database name you want
- ✅ Password → must be strong and unique

**Cannot change:**
- ❌ `POSTGRES_USER` → variable name must stay
- ❌ `POSTGRES_PASSWORD` → variable name must stay
- ❌ `POSTGRES_DB` → variable name must stay

---

## 🚀 **Example - Your Custom Setup:**

```env
# Your custom names
POSTGRES_USER=rabbitpdf_admin
POSTGRES_PASSWORD=GENERATE_STRONG_PASSWORD
POSTGRES_DB=rabbitpdf_prod
```

**This will work perfectly!** 🎉

---

**Want to use custom names? Just change the values, keep the variable names the same!** ✅


