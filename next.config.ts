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
