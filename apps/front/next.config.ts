import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@medplum/react',
      'lucide-react'
    ],
  },
  transpilePackages: [
    "@medplum/react",
    "@mantine/core",
    "@mantine/hooks",
    "@mantine/notifications",
  ],

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://api:3003/api/:path*", // Internal K8s DNS
        },
        {
          source: "/fhir/:path*",
          destination: "http://api:3003/fhir/:path*", // Internal K8s DNS
        },
        {
          source: "/tb-assets/:path*",
          destination: "http://localhost:8088/assets/:path*", // Internal K8s DNS to ThingsBoard static assets (or localhost replaced by scripts)
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
