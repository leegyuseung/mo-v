import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { fetchPublicUserProfileByPublicId } from "@/api/public-user-profile-server";
import PublicUserProfileScreen from "@/components/screens/user/public-user-profile-screen";

type UserProfilePageProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { publicId } = await params;
  return {
    title: "유저 프로필",
    description: `${publicId} 유저의 공개 프로필`,
    alternates: {
      canonical: `/user/${publicId}`,
    },
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { publicId } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await fetchPublicUserProfileByPublicId(publicId, user?.id ?? null);
  if (!profile) {
    notFound();
  }

  return <PublicUserProfileScreen profile={profile} />;
}
