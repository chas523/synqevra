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
          destination: "http://localhost:8088/assets/:path*", // ThingsBoard static assets
        },
      ],
    };
  },
};

export default nextConfig;
