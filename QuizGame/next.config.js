module.exports = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Force all pages to be server-side rendered to avoid context provider issues
  reactStrictMode: true,
  trailingSlash: false,
  // Configure which pages should be statically generated
  output: 'standalone',
  // These options were moved from experimental to root level in Next.js 14
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // Font optimization configuration
  optimizeFonts: true,
  // Add proper configuration for middleware
  experimental: {
    serverComponentsExternalPackages: ["firebase"],
    // Move serverActions to experimental section
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Add proper React configuration for the use() hook
    react: {
      serverComponents: true,
      serverActions: true,
    },
  },
}