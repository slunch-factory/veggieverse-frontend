import type { NextConfig } from "next";
import {withSentryConfig} from '@sentry/nextjs';

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
  transpilePackages: ['three'],
  images: {
    // next/image 자동 변환 포맷 — AVIF 우선(가장 작음), 미지원 시 WebP fallback
    formats: ['image/avif', 'image/webp'],
    // Supabase Storage 외부 이미지(구독 재료·상품 등) 최적화 허용. qa/prod 프로젝트 모두 커버.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: 'slunchfactory',
  project: 'veggieverse',
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,

  disableLogger: true,

  widenClientFileUpload: true,
  sourcemaps: {
    disable: false,
    assets: ['.next/server/chunks/*.js', '.next/server/chunks/*.js.map', '.next/static/chunks/*.js'],
    ignore: ['**/node_modules/**'],
    deleteSourcemapsAfterUpload: true,
  },
});
