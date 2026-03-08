import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/utils/role";

/**
 * manager는 유저 관리/유저 제재 이력만 접근 가능하다.
 * 왜: 사이드바 숨김만으로는 직접 URL 접근을 막을 수 없기 때문이다.
 */
export default async function FullAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

  if (!profile || !isAdminRole(profile.role)) {
    redirect("/admin/users");
  }

  return children;
}
