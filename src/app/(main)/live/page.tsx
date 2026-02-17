import type { Metadata } from "next";
import LiveScreen from "@/components/screens/live/live-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/live",
  },
};

export default function LivePage() {
  return <LiveScreen />;
}
