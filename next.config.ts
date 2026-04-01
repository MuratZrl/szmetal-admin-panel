// next.config.ts
import type { NextConfig } from "next";

const SUPABASE_HOST = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://localhost').hostname;

const nextConfig: NextConfig = {
  devIndicators: false,
  typedRoutes: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'same-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          `img-src 'self' data: blob: https://${SUPABASE_HOST} https://placehold.co`,
          `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} blob:`,
          "worker-src 'self' blob:",
          "frame-src 'self'",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/(dashboard|clients|products|account)(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.szmetal.com.tr' }],
        destination: 'https://szmetal.com.tr/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
