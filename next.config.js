/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "invitegenerator.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security and caching headers
  // Note: CSP is now handled by middleware.ts with per-request nonces
  async headers() {
    return [
      // Cache static assets aggressively
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache templates for 1 hour
      {
        source: "/templates/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // Security headers for all paths
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          // CSP is set dynamically by middleware.ts with nonces for better security
        ],
      },
    ];
  },

  // Redirects for SEO and user experience
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth/signup",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth/signup",
        permanent: true,
      },
    ];
  },

  // Environment variables exposed to the browser (public)
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com",
    NEXT_PUBLIC_APP_NAME: "InviteGenerator",
  },

  // Optimize production build
  swcMinify: true,
  
  // Experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },

  // Output configuration for IONOS deployment
  output: "standalone",

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Compress responses
  compress: true,
};

module.exports = nextConfig;
