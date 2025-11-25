# 🔧 Troubleshooting: SSH Connection & Docker Build

## 🚨 **Current Issues:**

1. ❌ Docker build not showing progress
2. ❌ Can't connect via new terminal

**Let's diagnose and fix!**

---

## 🔍 **Step 1: Check Your Original Terminal**

### **In the terminal where Docker build is running:**

**Try pressing `Enter` or typing something:**

- ✅ **If cursor responds:** Terminal is alive, build might be stuck
- ❌ **If no response:** Terminal/SSH connection might be dead

---

## 🔄 **Step 2: Try to Reconnect**

### **If Original Terminal is Dead:**

**In your original terminal:**

1. **Try pressing `Ctrl+C`** (to cancel if stuck)
2. **Try typing:** `echo "test"`
3. **If no response:** Connection is dead

**Close the terminal and reconnect:**

```powershell
# In PowerShell
cd C:\path\to\your\key
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
```

---

## 🔍 **Step 3: Check if Build is Still Running**

### **After Reconnecting:**

**Check Docker processes:**

```bash
# Check if Docker build is running
ps aux | grep docker

# Check Docker containers
docker ps -a

# Check Docker images (to see if build completed)
docker images

# Check recent Docker logs
docker-compose -f docker-compose.production.yml logs --tail=50
```

---

## 🚨 **Step 4: Check What Happened**

### **Check System Resources:**

```bash
# Check if server is responsive
free -h
df -h
top
```

**If server is unresponsive:**
- Might need to restart EC2 instance
- Check AWS Console for instance status

---

## 🔧 **Step 5: Check AWS Console**

### **Go to AWS Console:**

1. **EC2 Dashboard**
2. **Instances**
3. **Check your instance:**
   - ✅ **Status:** Should be "Running"
   - ✅ **Status Checks:** Should be "2/2 checks passed"
   - ❌ **If "Failed":** Instance might need restart

---

## 🎯 **Possible Scenarios:**

### **Scenario 1: SSH Connection Timed Out**

**Symptoms:**
- Terminal not responding
- Can't connect via new terminal

**Solution:**
1. Close terminal
2. Reconnect via SSH
3. Check if build completed or failed

---

### **Scenario 2: Docker Build Failed**

**Symptoms:**
- Build stopped
- No progress
- Error messages (if you can see them)

**Solution:**
1. Reconnect via SSH
2. Check Docker logs
3. Restart build if needed

---

### **Scenario 3: Server Overloaded**

**Symptoms:**
- Server unresponsive
- Can't SSH in
- Build stuck

**Solution:**
1. Check AWS Console
2. Restart EC2 instance if needed
3. Reconnect and check

---

### **Scenario 4: Network Issues**

**Symptoms:**
- Can't connect
- Connection drops
- Timeout errors

**Solution:**
1. Check your internet connection
2. Try connecting again
3. Check AWS Console for instance status

---

## 🚀 **Quick Fix Steps:**

### **1. Try Reconnecting:**

```powershell
# In PowerShell
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
```

**If connection fails:**
- Check AWS Console
- Verify instance is running
- Check security group allows SSH (port 22)

---

### **2. Once Connected, Check Docker:**

```bash
# Check if build process exists
ps aux | grep docker

# Check Docker images
docker images

# Check if containers exist
docker ps -a
```

---

### **3. Check Build Status:**

```bash
# Navigate to project
cd ~/RabbitPDF
# or
cd ~/ChatPDF

# Check Docker Compose status
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs --tail=100
```

---

## 🆘 **If You Can't Connect:**

### **Check AWS Console:**

1. **EC2 → Instances**
2. **Select your instance**
3. **Check:**
   - Status: Should be "Running"
   - Status Checks: Should be "2/2 checks passed"
   - Public IP: Note it down

4. **If instance is stopped:**
   - Click "Start instance"
   - Wait 1-2 minutes
   - Try connecting again

---

## 🔄 **If Build Failed:**

### **Restart Build:**

```bash
# Clean up
docker-compose -f docker-compose.production.yml down

# Remove old images (optional)
docker rmi $(docker images -q)  # Be careful!

# Rebuild
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d
```

---

## 📋 **Diagnostic Checklist:**

- [ ] Can you reconnect via SSH?
- [ ] Is EC2 instance running in AWS Console?
- [ ] Can you run commands on server?
- [ ] Is Docker build still running?
- [ ] Did build complete or fail?
- [ ] Are there any error messages?

---

## 🎯 **Next Steps:**

**Tell me:**
1. **Can you reconnect via SSH?** (Yes/No)
2. **What do you see when you reconnect?**
3. **What's the status in AWS Console?**

**Based on your answers, I'll guide you through the fix!** 🚀

