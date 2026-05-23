import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Cache Components is opt-in via `cacheComponents: true` once schema + data
  // pipeline are stable. Enable after auth + Drizzle queries are wired so we
  // can use `'use cache'` on marketing + read-only data pages.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.courtlistener.com" },
      { protocol: "https", hostname: "storage.courtlistener.com" },
    ],
  },
};

export default nextConfig;
