import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "efbvxsoghrqqmozuewah.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "stimg.sooplive.co.kr",
      },
      {
        protocol: "https",
        hostname: "nng-phinf.pstatic.net",
      }
    ],
  },
};

export default nextConfig;
