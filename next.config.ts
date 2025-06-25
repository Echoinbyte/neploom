import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.localhost:3000"],
    },
  },
};

export default nextConfig;
