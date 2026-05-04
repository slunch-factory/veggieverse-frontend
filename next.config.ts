import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['three'],
};

export default nextConfig;
