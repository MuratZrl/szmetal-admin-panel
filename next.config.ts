// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  typedRoutes: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zofgtjswwjikwhdirvpa.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**', // tüm yollar için izin ver
      },
    ],
  },

  async headers() {
    // Security headers applied to ALL routes
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
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
          "img-src 'self' data: blob: https://zofgtjswwjikwhdirvpa.supabase.co https://placehold.co",
          "connect-src 'self' https://zofgtjswwjikwhdirvpa.supabase.co",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    ];

    return [
      // Global security headers for all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Additional cache-busting for admin routes
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
        has: [{ type: 'host', value: 'www.szmetal.com.tr' }], // www → apex yönlendirme örneği
        destination: 'https://szmetal.com.tr/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
