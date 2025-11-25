# 🚀 Upgrade EC2 Instance to t2.small

## 🎯 **Step-by-Step Guide to Upgrade**

**We'll upgrade from t2.micro to t2.small for reliable builds!**

---

## 📋 **Step 1: Stop the Instance**

**In AWS Console:**

1. **Go to:** EC2 Dashboard → Instances
2. **Select your instance** (checkbox)
3. **Click "Instance state"** button (top right)
4. **Click "Stop instance"**
5. **Click "Stop"** to confirm
6. **Wait until "Instance state" = "Stopped"** (1-2 minutes)

**⚠️ Important:** Instance must be STOPPED (not running) to change type!

---

## 🔧 **Step 2: Change Instance Type**

**Once instance is "Stopped":**

1. **Select your instance** (checkbox)
2. **Click "Actions"** button (top right)
3. **Go to:** "Instance settings" → "Change instance type"
4. **In the dialog:**
   - **Instance type:** Select **"t2.small"**
   - **Click "Apply"**
5. **Wait for confirmation** (few seconds)

---

## 🚀 **Step 3: Start the Instance**

**After instance type is changed:**

1. **Select instance**
2. **Click "Instance state"** → **"Start instance"**
3. **Wait 1-2 minutes**
4. **Check:**
   - Instance state = "Running"
   - Status checks = "2/2 checks passed"
   - **Note the NEW Public IP** (might have changed!)

---

## 🔍 **Step 4: Verify Instance Type**

**Once instance is running:**

1. **Select instance**
2. **Check "Instance type" column** → Should show **"t2.small"**
3. **Check "Instance details" tab** → Should show:
   - **Instance type:** t2.small
   - **vCPU:** 2
   - **Memory:** 2 GiB

---

## 🔌 **Step 5: Reconnect**

**Connect with NEW Public IP (if it changed):**

```powershell
# Use NEW Public IP from AWS Console
ssh -i rabbitpdf-key.pem ubuntu@NEW_PUBLIC_IP
```

**Or use AWS Session Manager** (browser terminal - easier)

---

## ✅ **Step 6: Verify Resources**

**Once connected, verify upgrade:**

```bash
# Check CPU cores (should show 2)
nproc

# Check memory (should show ~2GB)
free -h

# Should show:
# total: ~2GB (was ~1GB before)
```

---

## 🚀 **Step 7: Rebuild Docker Images**

**Now with more resources, rebuild:**

```bash
# Navigate to project
cd ~/RabbitPDF

# Start build (will be much faster now!)
docker-compose -f docker-compose.production.yml build
```

**Expected time:** 10-15 minutes (vs 30+ minutes before)

---

## 📋 **Quick Checklist:**

- [ ] Stop instance
- [ ] Wait until "Stopped"
- [ ] Change instance type to t2.small
- [ ] Start instance
- [ ] Wait until "Running" with "2/2 checks passed"
- [ ] Note NEW Public IP
- [ ] Reconnect
- [ ] Verify resources (2 vCPU, 2GB RAM)
- [ ] Rebuild Docker images

---

## 💡 **Important Notes:**

### **Public IP Will Change:**
- **After stop/start, IP changes!**
- **Get NEW IP from AWS Console**
- **Update SSH command with new IP**

### **Data is Safe:**
- **Instance type change doesn't affect data**
- **All files remain intact**
- **Just more resources!**

### **Cost:**
- **t2.small = ~$15/month** (vs ~$8/month for t2.micro)
- **Only $7/month more**
- **Worth it for reliable builds!**

---

## 🎯 **What to Do Now:**

1. **Go to AWS Console** → EC2 → Instances
2. **Stop instance** (Instance state → Stop)
3. **Wait until "Stopped"**
4. **Change instance type** (Actions → Instance settings → Change instance type → t2.small)
5. **Start instance**
6. **Get NEW Public IP**
7. **Reconnect**
8. **Rebuild**

**Let me know when instance is stopped and I'll guide you through changing the type!** 🚀

