import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next/Image 원격 최적화 허용 도메인 목록
    // CHZZK/SOOP 썸네일 CDN 도메인이 바뀌면 여기 먼저 추가해야 한다.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "stimg.sooplive.co.kr",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nng-phinf.pstatic.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "phinf.pstatic.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "livecloud-thumb.akamaized.net",
        pathname: "/**",
      }
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });
    return config;
  },
};

export default nextConfig;
