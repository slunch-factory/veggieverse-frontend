import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/" : "";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true, // GitHub Pages 정적 배포용
  },
};

export default nextConfig;
