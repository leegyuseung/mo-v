import type { Metadata } from "next";
import { Suspense } from "react";
import RankScreen from "@/components/screens/rank/rank-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/rank",
  },
};

export default function RankPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl p-4 md:p-6 text-sm text-gray-500">로딩중...</div>}>
      <RankScreen />
    </Suspense>
  );
}
