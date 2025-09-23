/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Configuraciones adicionales para Cordova
  assetPrefix: '/',
  basePath: '',
  distDir: 'out'
};

export default nextConfig;