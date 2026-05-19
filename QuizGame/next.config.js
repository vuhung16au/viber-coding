module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Force all pages to be server-side rendered to avoid context provider issues
  reactStrictMode: true,
  trailingSlash: false,
  // Configure which pages should be statically generated
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["firebase"],
  // These options were moved from experimental to root level in Next.js 14
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // Add proper configuration for middleware
  experimental: {
    // Configure server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}
