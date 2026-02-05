import { build } from 'velite'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Velite integration: build content at dev/build time
  webpack: (config, { dev, isServer }) => {
    if (isServer) {
      build({ watch: dev, clean: !dev })
    }
    return config
  }
}

export default nextConfig
