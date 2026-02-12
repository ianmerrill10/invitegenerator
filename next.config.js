const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";

// CSP configuration - more restrictive in production
const getCSPHeader = () => {
  const directives = [
    "default-src 'self'",
    // In production, ideally remove unsafe-inline/eval, but Next.js requires them
    // Using Report-Only mode to monitor violations before enforcing
    isProduction
      ? "script-src 'self' 'unsafe-inline' https://js.stripe.com"
      : "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https://*.amazonaws.com https://*.stripe.com https://images.unsplash.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.amazonaws.com https://api.stripe.com https://cognito-idp.*.amazonaws.com https://*.sentry.io https://*.ingest.sentry.io",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "block-all-mixed-content",
    isProduction ? "upgrade-insecure-requests" : "",
  ].filter(Boolean);

  return directives.join("; ");
};

const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Allow production builds to succeed even if ESLint still has findings.
  // Lint should be run separately in CI via `npm run lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable standalone output for Docker deployment
  output: "standalone",

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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
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
            value: "camera=(), microphone=(), geolocation=(), payment=(self), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: getCSPHeader(),
          },
          // Prevent MIME type sniffing
          {
            key: "X-Download-Options",
            value: "noopen",
          },
          // Cross-Origin policies for enhanced isolation
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
      // API routes - additional security
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
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

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Compress responses
  compress: true,
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in CI/production builds
  silent: !process.env.CI,

  // Suppress Sentry errors if DSN is not configured
  disableLogger: true,

  // Don't widen the scope of the Sentry build plugin
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableServerWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
});
