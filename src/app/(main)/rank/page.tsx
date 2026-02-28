import type { Metadata } from "next";
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
  return <RankScreen />;
}

