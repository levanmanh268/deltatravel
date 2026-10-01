import type { NextConfig } from 'next';

const buildCommit =
  process.env.RENDER_GIT_COMMIT ||
  process.env.COMMIT_REF ||
  process.env.GITHUB_SHA ||
  process.env.DELTA_BUILD_COMMIT ||
  '';
const buildProvider = process.env.RENDER_GIT_COMMIT
  ? 'render'
  : process.env.COMMIT_REF
    ? 'netlify'
    : process.env.GITHUB_SHA
      ? 'github'
      : process.env.DELTA_BUILD_PROVIDER || 'unknown';

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://delta-travel-api.onrender.com https://*.supabase.co",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

const config: NextConfig = {
  env: {
    DELTA_BUILD_COMMIT: buildCommit,
    DELTA_BUILD_PROVIDER: buildProvider,
  },
  transpilePackages: ['@tour/shared'],
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default config;
