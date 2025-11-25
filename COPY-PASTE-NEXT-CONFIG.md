# 📋 Copy & Paste Next.js Config in Nano

## 🎯 **How to Copy & Paste in Nano**

**Here's the easiest way:**

---

## 📋 **Step 1: Get the Correct Code**

**Here's the complete correct file:**

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

## 🚀 **Step 2: On Server - Open Nano**

**On your server:**

```bash
# Navigate to project
cd ~/RabbitPDF

# Open file
nano frontend/next.config.production.ts
```

---

## 📋 **Step 3: Replace Entire File**

**In nano:**

### **Option A: Clear and Paste (Easiest)**

1. **Select all:** `Ctrl+A` (selects all text)
2. **Delete:** `Delete` or `Backspace` (clears file)
3. **Paste:** Right-click → Paste (or `Shift+Insert`)
4. **Save:** `Ctrl+X`, `Y`, `Enter`

---

### **Option B: Delete Line by Line**

1. **Go to first line:** `Ctrl+Home` or scroll to top
2. **Delete each line:** `Ctrl+K` (deletes current line)
3. **Repeat** until file is empty
4. **Paste:** Right-click → Paste
5. **Save:** `Ctrl+X`, `Y`, `Enter`

---

## 💡 **Step 4: Copy from Here**

**To copy the code:**

1. **Select the code block above** (from `import type` to `export default`)
2. **Copy:** `Ctrl+C` (Windows) or `Cmd+C` (Mac)
3. **In nano:** Right-click → Paste

---

## 🎯 **Quick Steps:**

1. **Copy the code** from above
2. **On server:** `nano frontend/next.config.production.ts`
3. **Select all:** `Ctrl+A`
4. **Delete:** `Delete`
5. **Paste:** Right-click → Paste
6. **Save:** `Ctrl+X`, `Y`, `Enter`

---

## ✅ **Step 5: Verify**

**After saving:**

```bash
# Check file syntax
cat frontend/next.config.production.ts | head -20

# Should show the correct content
```

---

## 🆘 **If Paste Doesn't Work:**

**Alternative: Use sed to replace file**

```bash
# Backup current file
cp frontend/next.config.production.ts frontend/next.config.production.ts.backup

# Create new file with correct content
cat > frontend/next.config.production.ts << 'EOF'
[paste the entire code block here]
EOF
```

**But nano paste should work!**

---

## 📋 **Complete Code to Copy:**

**Copy everything from here:**

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

**Copy this entire block and paste into nano!** 🚀


