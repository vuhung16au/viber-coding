module.exports = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Force all pages to be server-side rendered to avoid context provider issues
  reactStrictMode: true,
  trailingSlash: false,
  // Configure which pages should be statically generated
  output: 'standalone',
  // Skip static generation for pages that require authentication
  experimental: {
    // Skip problematic pages during static generation
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
  },
  // Configure which routes require dynamic rendering and are not pre-rendered
  async generateStaticParams() {
    return [];
  }
}