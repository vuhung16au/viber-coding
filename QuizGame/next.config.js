module.exports = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Force all pages to be server-side rendered to avoid context provider issues
  reactStrictMode: true,
  trailingSlash: false,
  // Configure which pages should be statically generated
  output: 'standalone',
  // Move these options outside of experimental as they're now standard config options
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // Remove the invalid generateStaticParams from config (it belongs in page components)
}