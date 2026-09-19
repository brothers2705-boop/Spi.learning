/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for Cannot find module './xxx.js' error
  // Disable some optimizations that cause cache corruption
  swcMinify: true,
  experimental: {
    // Ensure stable build
  },
  // Ensure output is stable for Vercel
  output: undefined,
  // Allow preview embedding
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}
module.exports = nextConfig
