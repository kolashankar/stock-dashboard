import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.alias['@components'] = path.resolve('./components')
    config.resolve.alias['@lib'] = path.resolve('./lib')
    config.resolve.alias['@hooks'] = path.resolve('./hooks')
    config.resolve.alias['@utils'] = path.resolve('./utils')
    config.resolve.alias['@repositories'] = path.resolve('./repositories')
    config.resolve.alias['@app'] = path.resolve('./app')
    return config
  },
}

export default nextConfig
