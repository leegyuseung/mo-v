import type { Metadata } from "next";
import StarScreen from "@/components/screens/star/star-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/star",
  },
};

export default function StarPage() {
  return <StarScreen />;
}
