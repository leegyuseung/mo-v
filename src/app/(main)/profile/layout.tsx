import type { ReactNode } from "react";
import ProfileSideMenu from "@/components/screens/profile/profile-side-menu";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mt-4 w-full max-w-7xl px-4 pb-8 md:px-6">
      <ProfileSideMenu />
      <section className="mt-5 min-w-0">{children}</section>
    </div>
  );
}
