import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  transpilePackages: [
    "@medplum/react",
    "@mantine/core",
    "@mantine/hooks",
    "@mantine/notifications",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "minio",
        port: "9000",
        pathname: "/**",
      },
      // If deployed onto an external bucket, the protocol/hostname would be added here
      // For now we trust MinIO hosted locally and inside k8s via http.
    ],
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://localhost:3003/api/:path*", // Internal K8s DNS
        },
        {
          source: "/fhir/:path*",
          destination: "http://localhost:3003/fhir/:path*", // Internal K8s DNS
        },
        {
          source: "/tb-assets/:path*",
          destination: "http://localhost:8088/assets/:path*", // Internal K8s DNS to ThingsBoard static assets
        },
        {
          source: "/public-assets/:path*",
          destination: "http://localhost:9000/public-assets/:path*", // Internal K8s DNS to MinIO (or localhost replaced by scripts)
        },
      ],
    };
  },
};

export default nextConfig;
