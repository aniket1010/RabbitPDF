import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image configuration for external sources
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
  },
  // Turbopack configuration for PDF.js compatibility
  turbopack: {
    rules: {
      // Handle PDF.js binary files for Turbopack
      '*.node': {
        loaders: ['ignore-loader'],
        as: '*.js',
      },
    },
  },
  // Webpack fallback for when Turbopack is not used
  webpack: (config) => {
    // Handle PDF.js binary files
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    // Ignore binary files from PDF.js
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });
    
    return config;
  },
};

export default nextConfig;
