import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/assets/maps/:path*",
        destination: "https://gamemap.uesp.net/assets/maps/:path*",
      },
      {
        source: "/db/gamemap.php",
        destination: "/gamemap",
      },
      {
        source: "/mw/db/gamemap.php",
        destination: "/gamemap",
      },
    ];
  },
};

export default nextConfig;
