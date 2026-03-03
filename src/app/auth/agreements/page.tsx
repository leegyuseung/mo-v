import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import SocialAgreementsScreen from "@/components/screens/auth/social-agreements-screen";
import { sanitizeAgreementNextPath } from "@/lib/user-agreement";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type AgreementsPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AgreementsPage({ searchParams }: AgreementsPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeAgreementNextPath(params.next);
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: agreement } = await supabase
    .from("user_agreements")
    .select("terms_accepted,privacy_accepted,third_party_accepted")
    .eq("user_id", user.id)
    .maybeSingle();

  const isRequiredAccepted = Boolean(
    agreement?.terms_accepted && agreement?.privacy_accepted && agreement?.third_party_accepted
  );
  if (isRequiredAccepted) {
    redirect(nextPath);
  }

  return <SocialAgreementsScreen nextPath={nextPath} />;
}
