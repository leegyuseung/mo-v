import type { Metadata } from "next";
import CrewScreen from "@/components/screens/crew/crew-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/crew",
  },
};

export default function CrewPage() {
  return <CrewScreen />;
}
