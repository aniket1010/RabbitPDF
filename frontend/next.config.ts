import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Add your environment variables here as backup
    // GOOGLE_CLIENT_ID: 'your_google_client_id_here',
    // GOOGLE_CLIENT_SECRET: 'your_google_client_secret_here',
    // GITHUB_CLIENT_ID: 'your_github_client_id_here', 
    // GITHUB_CLIENT_SECRET: 'your_github_client_secret_here',
    // BETTER_AUTH_SECRET: 'your_secret_here',
  },
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
    resolveAlias: {
      canvas: './src/lib/canvas-stub.js',
    },
  },
  // Webpack fallback for when Turbopack is not used
  webpack: (config) => {
    // Handle PDF.js binary files and canvas dependency
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    // Ignore binary files from PDF.js
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });
    
    // Exclude canvas from bundling entirely
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
    });
    
    return config;
  },
};

export default nextConfig;
