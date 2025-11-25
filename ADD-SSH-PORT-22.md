# 🔧 Add SSH Port 22 to Security Group

## 🚨 **Problem:**

You only have ports **3000** and **5000** open, but **SSH requires port 22!**

That's why you can't connect via SSH.

---

## ✅ **Solution: Add Port 22 (SSH) to Security Group**

### **Step-by-Step:**

### **1. Go to AWS Console**

1. Go to: https://console.aws.amazon.com/ec2/
2. Click **"Instances"** (left sidebar)
3. Find your instance (IP: 51.20.135.170)
4. Click on it to select

---

### **2. Open Security Group**

1. Click **"Security"** tab (bottom panel)
2. You'll see **"Security groups"** section
3. Click on the Security Group name (e.g., `sg-xxxxx`)
4. This opens the Security Group page

---

### **3. Edit Inbound Rules**

1. Click **"Edit inbound rules"** button
2. You should see your current rules:
   - Port 3000 (Custom TCP)
   - Port 5000 (Custom TCP)

---

### **4. Add SSH Rule**

1. Click **"Add rule"** button
2. Fill in:
   - **Type:** Select **"SSH"** (or "Custom TCP")
   - **Protocol:** TCP (auto-selected)
   - **Port range:** **22** (auto-filled if you selected SSH)
   - **Source:** 
     - **Option 1:** Select **"My IP"** (recommended - only your IP)
     - **Option 2:** Select **"Anywhere-IPv4"** (0.0.0.0/0) - less secure but works from anywhere
   - **Description:** (optional) "SSH access"

3. Click **"Save rules"**

---

### **5. Verify Rule Added**

**You should now have 3 rules:**
- ✅ SSH (port 22)
- ✅ Custom TCP (port 3000)
- ✅ Custom TCP (port 5000)

---

## 🚀 **Try SSH Again**

**After adding the rule, try:**

```powershell
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170
```

**It should work now!** ✅

---

## 🔒 **Security Recommendation:**

**For better security:**

- **Use "My IP"** as source (only your current IP can SSH)
- **Don't use "Anywhere-IPv4"** unless you need SSH from multiple locations

**Note:** If your IP changes (different WiFi, location), you'll need to update the rule.

---

## 📋 **Complete Security Group Setup:**

**Your security group should have:**

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | My IP (or 0.0.0.0/0) | SSH access |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Frontend |
| Custom TCP | TCP | 5000 | 0.0.0.0/0 | Backend API |

---

## ✅ **Quick Steps:**

1. AWS Console → EC2 → Instances
2. Select your instance
3. Security tab → Click Security Group name
4. Edit inbound rules → Add rule
5. Type: SSH, Port: 22, Source: My IP
6. Save rules
7. Try SSH again!

---

## 🎯 **After Adding Port 22:**

**You should be able to:**

```powershell
# Connect via SSH
ssh -i rabbitpdf-key.pem ubuntu@51.20.135.170

# Access your application
# Frontend: http://51.20.135.170:3000
# Backend: http://51.20.135.170:5000
```

---

**Add port 22 to your security group and try SSH again!** 🚀



