# 🖥️ Step 2: Create EC2 Instance

Let's create your virtual server on AWS!

---

## 🎯 **Goal:** Create an EC2 instance (virtual server) to run your application

**Time:** 15 minutes

---

## 📝 **Step-by-Step Instructions:**

### **2.1: Log into AWS Console**

1. Go to [console.aws.amazon.com](https://console.aws.amazon.com)
2. Sign in with your AWS account
3. You should see the AWS Management Console dashboard

**✅ Are you logged in? Let me know when you're ready for the next step!**

---

### **2.2: Navigate to EC2**

1. In the top search bar, type: **"EC2"**
2. Click on **"EC2"** service (under Services)
3. You should see the EC2 Dashboard

**✅ Can you see the EC2 Dashboard? Let me know!**

---

### **2.3: Launch Instance**

1. Look for a big orange button: **"Launch Instance"**
2. Click **"Launch Instance"**
3. You'll see a form to configure your instance

**✅ Are you on the "Launch an instance" page? Let me know!**

---

### **2.4: Configure Instance Details**

Fill in these fields:

#### **Name and tags:**
- **Name:** `chatpdf-server` (or any name you like)

#### **Application and OS Images:**
- Click **"Browse more AMIs"** or look for **"Ubuntu"**
- Select: **"Ubuntu Server 22.04 LTS"** (or latest LTS version)
- Architecture: **64-bit (x86)**

#### **Instance type:**
- Click **"Instance type"** dropdown
- Select: **t2.micro** (Free tier eligible)
- This is free for 750 hours/month!

#### **Key pair (login):**
- Click **"Create new key pair"**
- **Key pair name:** `chatpdf-key`
- **Key pair type:** RSA
- **Private key file format:** `.pem`
- Click **"Create key pair"**
- **⚠️ IMPORTANT:** The `.pem` file will download automatically - **SAVE IT SAFELY!** You'll need it to connect to your server.

**✅ Have you created the key pair and downloaded the .pem file? Let me know!**

---

### **2.5: Network Settings**

1. Click **"Edit"** next to Network settings
2. **Auto-assign Public IP:** Enable
3. **Firewall (security groups):**
   - Select: **"Create security group"**
   - **Security group name:** `chatpdf-security-group`
   - **Description:** `Security group for ChatPDF application`
   
4. **Inbound security group rules:**
   - **Rule 1:** SSH
     - Type: SSH
     - Source: **My IP** (recommended) or **0.0.0.0/0** (less secure, allows from anywhere)
   - **Rule 2:** HTTP
     - Click **"Add security group rule"**
     - Type: HTTP
     - Source: **0.0.0.0/0** (allows web traffic)
   - **Rule 3:** HTTPS
     - Click **"Add security group rule"**
     - Type: HTTPS
     - Source: **0.0.0.0/0** (allows secure web traffic)

**✅ Have you configured the security group? Let me know!**

---

### **2.6: Configure Storage**

1. Scroll to **"Configure storage"**
2. **Size:** 20 GB (free tier: 30 GB, so 20 GB is safe)
3. **Volume type:** gp3 (default)

**✅ Storage configured? Let me know!**

---

### **2.7: Launch Instance**

1. Scroll down to **"Summary"** section
2. Review your settings
3. Click the big orange button: **"Launch Instance"**
4. You should see: **"Success! Your instances are now launching"**

**✅ Instance launched? Let me know!**

---

### **2.8: Get Your Server IP**

1. Click **"View all instances"** (or go back to EC2 Dashboard)
2. Wait 1-2 minutes for instance to start
3. Find your instance (named `chatpdf-server`)
4. Check the **"Instance state"** - should say **"Running"** (green)
5. Look at **"Public IPv4 address"** - **COPY THIS IP!** 
   - Example: `54.123.45.67`
   - **This is your server's address!**

**✅ Do you have your Public IP address? Share it with me (or keep it safe)!**

---

## ✅ **Step 2 Complete Checklist:**

- [ ] Logged into AWS Console
- [ ] Navigated to EC2
- [ ] Clicked "Launch Instance"
- [ ] Selected Ubuntu Server 22.04 LTS
- [ ] Selected t2.micro instance type
- [ ] Created key pair and downloaded .pem file
- [ ] Configured security group (SSH, HTTP, HTTPS)
- [ ] Set storage to 20 GB
- [ ] Launched instance
- [ ] Instance is running
- [ ] Copied Public IPv4 address

---

## 🎉 **Congratulations!**

You've created your EC2 instance! 

**Next:** Step 3 - Connect to your server via SSH

**Tell me when you're ready for Step 3!** 🚀

---

## 🆘 **Troubleshooting:**

**Can't find EC2?**
- Use the search bar at the top: type "EC2"

**Instance not starting?**
- Wait 2-3 minutes
- Check if you have service limits (new accounts sometimes have limits)

**Can't download key pair?**
- Check browser downloads folder
- Make sure pop-ups aren't blocked

**Need help?** Let me know what step you're stuck on!

