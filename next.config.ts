// تكوين Next.js للنشر على Cloudflare Pages
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  // تكوين i18n للدعم العربي
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
    localeDetection: true,
  },
  
  // تكوين الصور
  images: {
    domains: ['assets.example.com', 'cloudflare-pages.dev'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // تكوين الوسائط
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // تكوين الأمان
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // تكوين إعادة التوجيه
  redirects: async () => {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
