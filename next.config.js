/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido: output: 'export',
  reactStrictMode: true,

  // IMPORTANTE para PWA
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
