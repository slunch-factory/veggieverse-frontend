import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/veggieverse" : "";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true, // GitHub Pages 정적 배포용
  },
};

export default nextConfig;
