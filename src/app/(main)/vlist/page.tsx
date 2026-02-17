import type { Metadata } from "next";
import VlistScreen from "@/components/screens/vlist/vlist-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/vlist",
  },
};

export default function VlistPage() {
  return <VlistScreen />;
}
