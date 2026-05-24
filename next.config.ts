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
  async headers() {
    return [
      {
        // Embeddable widget: anyone can iframe these. We *don't* set
        // X-Frame-Options (modern browsers honor frame-ancestors), and we
        // open Content-Security-Policy: frame-ancestors *.
        source: "/widget/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
          { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
          { key: "X-DocketLens-Widget", value: "v1" },
        ],
      },
    ];
  },
};

export default nextConfig;
