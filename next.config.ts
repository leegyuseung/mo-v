import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cache writes 절감을 위해 생성 폭/포맷 수를 제한한다.
    // 너무 큰 폭(>1200)은 제외해 파생 이미지를 줄인다.
    deviceSizes: [64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 24, 32, 40, 48, 56, 72, 80, 112, 160],
    formats: ["image/webp"],
    // 외부 이미지(프로필/썸네일)의 최소 캐시 보존 시간
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
