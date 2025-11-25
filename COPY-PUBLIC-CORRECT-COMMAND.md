# ✅ Correct Command to Copy Public Directory

## 🎯 **Your Key File Location:**
- Found at: `C:\Users\bhusa\Downloads\rabbitpdf-key.pem`

---

## ✅ **Correct Command:**

**Run this in PowerShell:**

```powershell
cd D:\all_my_code\projects\chatPDF
scp -i C:\Users\bhusa\Downloads\rabbitpdf-key.pem -r frontend/public ubuntu@51.20.135.170:~/RabbitPDF/frontend/
```

---

## 🔧 **If You Get Permission Errors:**

**Set key file permissions first:**

```powershell
icacls C:\Users\bhusa\Downloads\rabbitpdf-key.pem /inheritance:r
icacls C:\Users\bhusa\Downloads\rabbitpdf-key.pem /grant:r "%username%:R"
```

**Then try the scp command again.**

---

## ✅ **Alternative: Use Full Path with Quotes**

**If spaces or special characters cause issues:**

```powershell
scp -i "C:\Users\bhusa\Downloads\rabbitpdf-key.pem" -r frontend/public ubuntu@51.20.135.170:~/RabbitPDF/frontend/
```

---

## 🚀 **After Copying:**

**Verify on server:**

```bash
ls -la frontend/public
```

**Then rebuild:**

```bash
docker-compose -f docker-compose.production.yml build frontend
```

---

**Run the command above!** 🚀



