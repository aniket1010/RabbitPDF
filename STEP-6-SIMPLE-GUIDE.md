# 🔐 Step 6: Create Environment File - SIMPLE GUIDE

You're in nano editor - let's make this easy!

---

## 🎯 **What You're Doing:**

Creating a file with all your app's configuration (like passwords, API keys, etc.)

---

## 📝 **EASIEST WAY - Do This:**

### **Option 1: Close Nano, Generate Secrets First**

**In nano, press:** `Ctrl + X` (to exit without saving)

**Then run these commands to generate secrets:**

```bash
# Generate all secrets you need
echo "BETTER_AUTH_SECRET:"
openssl rand -base64 32

echo "INTERNAL_API_SECRET:"
openssl rand -base64 32

echo "POSTGRES_PASSWORD:"
openssl rand -base64 24

echo "REDIS_PASSWORD:"
openssl rand -base64 24
```

**Copy each generated value!**

**Then open nano again:**

```bash
nano .env.production
```

---

### **Option 2: Use Template File (EASIEST!)**

**Close nano first:** `Ctrl + X` → `N` (don't save)

**Copy the template file:**

```bash
# Check if template exists
ls -la .env.production.template

# If it exists, copy it
cp .env.production.template .env.production

# Then edit it
nano .env.production
```

---

## 📋 **What to Fill In:**

You need to replace these placeholders:

1. **`YOUR_SERVER_IP`** → Your EC2 Public IP (e.g., `54.123.45.67`)
2. **`PASTE_GENERATED_PASSWORD`** → Use generated passwords
3. **`YOUR_OPENAI_KEY`** → Your OpenAI API key
4. **`YOUR_PINECONE_KEY`** → Your Pinecone API key

---

## 💡 **Simplest Approach:**

**Tell me:**
1. **What's your EC2 Public IP?** (e.g., `54.123.45.67`)
2. **Do you have your OpenAI API key ready?**
3. **Do you have your Pinecone API key ready?**

**I'll create a ready-to-use template with placeholders you just need to fill!**

---

## 🆘 **If You're Stuck:**

**Just tell me what's confusing and I'll help!**

- Don't know your server IP?
- Don't have API keys?
- Confused about which values to use?
- Something else?

**Let me know and I'll guide you step by step!** 😊

