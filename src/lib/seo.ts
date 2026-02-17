import type { Metadata } from "next";

const defaultSiteUrl = "https://mo-v.vercel.app";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || defaultSiteUrl;

export const SITE_NAME = "mo-v";
export const SITE_TITLE = "mo-v | 모두의 버추얼";
export const SITE_DESCRIPTION =
  "mo-v는 치지직/플랫폼 기반 버추얼 스트리머 정보와 라이브 현황을 한눈에 보는 보드입니다.";

export const SITE_KEYWORDS = [
  "mo-v",
  "버추얼",
  "버튜버",
  "치지직",
  "스트리머",
  "라이브",
  "버추얼 리스트",
  "버추얼 아이돌",
  "버추얼 크루",
  "이세계아이돌",
  "하데스"
] as const;

export function buildPageTitle(title?: string) {
  if (!title) return SITE_TITLE;
  return `${title} | ${SITE_NAME}`;
}

export function buildDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [...SITE_KEYWORDS],
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: "mo-v 로고",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: ["/logo.png"],
    },
    alternates: {
      canonical: SITE_URL,
    },
  };
}
