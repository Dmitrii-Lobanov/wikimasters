import { dirname } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  webpack: (config, { isServer }) => {
    // Module Federation configuration
    // Remotes point to locally deployed micro-frontends (can be updated for production)
    // Exposes UI components and navigation for remote micro-frontends to use
    
    if (!isServer) {
      // Client-side only configuration
      config.plugins = config.plugins || [];
      
      // Module Federation would be applied here via webpack plugin
      // For now, components are loaded locally with dynamic imports
      // Extend this with actual Module Federation plugin as needed
    }

    return config;
  },
};

export default nextConfig;
