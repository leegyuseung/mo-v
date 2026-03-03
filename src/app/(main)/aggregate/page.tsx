import type { Metadata } from "next";
import AggregateScreen from "@/components/screens/aggregate/aggregate-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/aggregate",
  },
};

export default function AggregatePage() {
  return <AggregateScreen />;
}

