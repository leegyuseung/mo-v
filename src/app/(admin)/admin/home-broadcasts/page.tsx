import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { hasAdminAccess } from "@/utils/role";
import HomeBroadcastsScreen from "@/components/screens/admin/home-broadcasts-screen";

export default async function AdminHomeBroadcastsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !hasAdminAccess(profile.role)) {
    redirect("/admin/users");
  }

  return <HomeBroadcastsScreen />;
}
