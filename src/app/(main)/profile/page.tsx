import type { Metadata } from "next";
import ProfileScreen from "@/components/screens/profile-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
