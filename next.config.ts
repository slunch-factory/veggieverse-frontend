import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

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
