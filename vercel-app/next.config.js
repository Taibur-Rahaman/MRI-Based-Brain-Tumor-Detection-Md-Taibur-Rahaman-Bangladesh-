/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  // Increase timeout for API routes to handle model inference
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  // Optimize images
  images: {
    domains: [],
  },
}

module.exports = nextConfig
