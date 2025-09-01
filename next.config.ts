import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
  typedRoutes: true,
  /* config options here */
};

export default nextConfig;
