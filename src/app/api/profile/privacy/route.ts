import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { UserProfilePrivacy } from "@/types/user-profile-privacy";
import { getUserAccountAccessResult } from "@/utils/server-account-status";

const DEFAULT_PRIVACY: UserProfilePrivacy = {
  show_account_info: true,
  show_favorites: true,
  show_donation_ranks: true,
  updated_at: null,
};

function createUnauthorizedResponse() {
  return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
}

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return createUnauthorizedResponse();

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const { data, error } = await supabase
    .from("user_profile_privacy")
    .select("show_account_info,show_favorites,show_donation_ranks,updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ privacy: DEFAULT_PRIVACY });
    }
    return NextResponse.json({ message: "공개 범위 조회에 실패했습니다." }, { status: 500 });
  }

  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from("user_profile_privacy")
      .upsert(
        {
          user_id: user.id,
          show_account_info: true,
          show_favorites: true,
          show_donation_ranks: true,
        },
        { onConflict: "user_id" }
      )
      .select("show_account_info,show_favorites,show_donation_ranks,updated_at")
      .maybeSingle();

    if (insertError) {
      return NextResponse.json({ privacy: DEFAULT_PRIVACY });
    }

    return NextResponse.json({
      privacy: inserted || DEFAULT_PRIVACY,
    });
  }

  return NextResponse.json({
    privacy: data,
  });
}

export async function PATCH(request: Request) {
  let showAccountInfo: boolean | undefined;
  let showFavorites: boolean | undefined;
  let showDonationRanks: boolean | undefined;

  try {
    const body = (await request.json()) as {
      showAccountInfo?: unknown;
      showFavorites?: unknown;
      showDonationRanks?: unknown;
    };

    if (body.showAccountInfo !== undefined) {
      if (typeof body.showAccountInfo !== "boolean") {
        return NextResponse.json({ message: "showAccountInfo 값이 올바르지 않습니다." }, { status: 400 });
      }
      showAccountInfo = body.showAccountInfo;
    }

    if (body.showFavorites !== undefined) {
      if (typeof body.showFavorites !== "boolean") {
        return NextResponse.json({ message: "showFavorites 값이 올바르지 않습니다." }, { status: 400 });
      }
      showFavorites = body.showFavorites;
    }

    if (body.showDonationRanks !== undefined) {
      if (typeof body.showDonationRanks !== "boolean") {
        return NextResponse.json({ message: "showDonationRanks 값이 올바르지 않습니다." }, { status: 400 });
      }
      showDonationRanks = body.showDonationRanks;
    }
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (
    showAccountInfo === undefined &&
    showFavorites === undefined &&
    showDonationRanks === undefined
  ) {
    return NextResponse.json({ message: "변경할 항목이 없습니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return createUnauthorizedResponse();

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const { data: current, error: currentError } = await supabase
    .from("user_profile_privacy")
    .select("show_account_info,show_favorites,show_donation_ranks")
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentError && currentError.code !== "PGRST116") {
    if (currentError.code === "42P01") {
      return NextResponse.json(
        { message: "공개 범위 테이블이 아직 생성되지 않았습니다. SQL을 먼저 적용해 주세요." },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "공개 범위 조회에 실패했습니다." }, { status: 500 });
  }

  const nextShowAccountInfo = showAccountInfo ?? current?.show_account_info ?? true;
  const nextShowFavorites = showFavorites ?? current?.show_favorites ?? true;
  const nextShowDonationRanks = showDonationRanks ?? current?.show_donation_ranks ?? true;

  const { data, error } = await supabase
    .from("user_profile_privacy")
    .upsert(
      {
        user_id: user.id,
        show_account_info: nextShowAccountInfo,
        show_favorites: nextShowFavorites,
        show_donation_ranks: nextShowDonationRanks,
      },
      { onConflict: "user_id" }
    )
    .select("show_account_info,show_favorites,show_donation_ranks,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ message: "공개 범위 저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    privacy: data,
  });
}
