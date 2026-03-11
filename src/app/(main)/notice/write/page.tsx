import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { canManageNoticeOnServer } from "@/api/notice-server";
import NoticeWriteScreen from "@/components/screens/notice/notice-write-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/notice/write",
  },
};

export default async function NoticeWritePage() {
  const cookieStore = await cookies();
  const canWriteNotice = await canManageNoticeOnServer(cookieStore);

  if (!canWriteNotice) {
    redirect("/notice");
  }

  return <NoticeWriteScreen />;
}
