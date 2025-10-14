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
    return [
      {
        source: '/(dashboard|create_request|requests|clients|orders|products|account)(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
