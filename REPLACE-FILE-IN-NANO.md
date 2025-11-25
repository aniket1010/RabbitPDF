# 📝 How to Replace Entire File in Nano

## 🎯 **Method 1: Clear All & Paste (Easiest)**

### **Step 1: Open File in Nano**
```bash
nano frontend/next.config.production.ts
```

### **Step 2: Select All & Delete**
1. **Select all text:** Press `Ctrl+A` (selects everything)
2. **Delete:** Press `Delete` or `Backspace` key
3. **File should now be empty**

### **Step 3: Paste the Correct Code**
1. **Right-click** in the terminal window (or `Shift+Insert` on some systems)
2. **Paste** the complete code below

---

## 🎯 **Method 2: Use Ctrl+K to Delete Line by Line**

1. **Go to top:** Press `Ctrl+Home` or `Alt+\` (go to beginning)
2. **Delete each line:** Press `Ctrl+K` repeatedly until all lines are deleted
3. **Paste** the new code

---

## 📋 **Complete Correct File Content (Copy This):**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  output: 'standalone',
  poweredByHeader: false,
  
  // Compression
  compress: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    // Handle PDF.js binary files and canvas dependency
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });
    
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
    });
    
    return config;
  },
  
  // Disable ESLint during builds (for production deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds (for production deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Runtime configuration
  serverExternalPackages: ['prisma', '@prisma/client'],
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
```

---

## ✅ **Step-by-Step Instructions:**

### **1. Open File:**
```bash
cd ~/chatPDF  # or your project directory
nano frontend/next.config.production.ts
```

### **2. Clear Everything:**
- Press `Ctrl+A` (select all)
- Press `Delete` or `Backspace`

### **3. Paste New Content:**
- **Right-click** in terminal window to paste
- OR `Shift+Insert` (on some systems)
- OR `Ctrl+Shift+V` (on some terminals)

### **4. Save & Exit:**
- Press `Ctrl+X` (exit)
- Press `Y` (yes, save)
- Press `Enter` (confirm filename)

---

## 🎯 **Alternative: Use a Different Editor**

**If nano is difficult, you can use `vi` or upload the file:**

### **Option A: Use `vi` (easier for large replacements)**
```bash
vi frontend/next.config.production.ts
# Press 'i' to enter insert mode
# Select all: Press 'gg' then 'dG' (delete from cursor to end)
# Paste your code
# Press 'Esc' then ':wq' to save and exit
```

### **Option B: Copy file from local to server**
**On your local Windows machine:**
```powershell
# From PowerShell, copy file to server
scp -i chatpdf-key.pem frontend/next.config.production.ts ubuntu@YOUR_SERVER_IP:~/chatPDF/frontend/
```

---

## 💡 **Nano Keyboard Shortcuts:**

- `Ctrl+A` - Select all / Go to beginning of line
- `Ctrl+K` - Delete current line
- `Ctrl+O` - Save (write out)
- `Ctrl+X` - Exit
- `Ctrl+W` - Search
- `Ctrl+\` - Search and replace
- `Ctrl+Home` or `Alt+\` - Go to beginning of file
- `Ctrl+End` or `Alt+/` - Go to end of file

---

## ✅ **Quick Method (Recommended):**

1. **Open:** `nano frontend/next.config.production.ts`
2. **Select all:** `Ctrl+A`
3. **Delete:** `Delete` key
4. **Paste:** Right-click (or `Shift+Insert`)
5. **Save:** `Ctrl+X`, `Y`, `Enter`

**Done!** ✅

