import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
