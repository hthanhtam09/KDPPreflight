import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  turbopack: {},
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Compress responses for better TTFB
  compress: true,

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'three',
      '@react-three/drei',
    ],
  },

  // Optimize images served through next/image
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 1 day
  },

  // Security + performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Aggressive caching for static assets
      {
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, immutable' }],
      },
      {
        source: '/:path*.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.webp',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.avif',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/pdf.worker.min.mjs',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  // Remove sitemap.xml from public — Next.js now generates it via app/sitemap.ts
  async redirects() {
    return [
      { source: '/kdp-bleed-checker', destination: '/tools/kdp-bleed-checker', statusCode: 301 },
      { source: '/kdp-cover-validator', destination: '/tools/kdp-cover-validator', statusCode: 301 },
      { source: '/kdp-spine-width-calculator', destination: '/tools/kdp-spine-width-calculator', statusCode: 301 },
      { source: '/kdp-trim-size-calculator', destination: '/tools/kdp-trim-size-calculator', statusCode: 301 },
      { source: '/kdp-cover-size-guide', destination: '/blog/kdp-cover-dimensions-explained', statusCode: 301 },
      { source: '/kdp-safe-area-guide', destination: '/blog/kdp-safe-area-guide', statusCode: 301 },
      { source: '/kdp-paperback-guide', destination: '/blog/beginners-guide-kdp-cover-formatting', statusCode: 301 },
      { source: '/kdp-glossary', destination: '/glossary', statusCode: 301 },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
