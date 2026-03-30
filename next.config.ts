import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['resium', 'cesium'],
  turbopack: {
    resolveAlias: {
      cesium: 'cesium/Source/Cesium',
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      resium: path.resolve(__dirname, 'node_modules/resium/src'),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        url: false,
        module: false,
        node: false,
      };
    }
    return config;
  },
};

export default nextConfig;
