import type { Metadata } from "next";

const defaultSiteUrl = "https://www.mo-v.kr";

function resolveSiteUrl(rawValue: string | undefined): string {
  const trimmed = rawValue?.trim();
  if (!trimmed) return defaultSiteUrl;

  try {
    return new URL(trimmed).toString().replace(/\/$/, "");
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString().replace(/\/$/, "");
    } catch {
      return defaultSiteUrl;
    }
  }
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = "mo-v";
export const SITE_TITLE = "mo-v | 모두의 버츄얼";
export const SITE_DESCRIPTION =
  "mo-v는 치지직/플랫폼 기반 버츄얼 정보와 라이브 현황을 한눈에 보는 보드입니다.";

export const SITE_KEYWORDS = [
  "mo-v",
  "버츄얼",
  "버튜버",
  "치지직",
  "버츄얼",
  "라이브",
  "버츄얼 리스트",
  "버츄얼 아이돌",
  "버츄얼 크루",
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
