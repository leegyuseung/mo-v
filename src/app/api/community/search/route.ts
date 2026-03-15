import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { CommunitySearchItem } from "@/types/community";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("q")?.trim() || "";

  if (!keyword) {
    return NextResponse.json({ items: [] });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [streamersResult, groupsResult, crewsResult] = await Promise.all([
    supabase
      .from("streamers")
      .select("id,public_id,nickname,image_url")
      .ilike("nickname", `%${keyword}%`)
      .order("nickname", { ascending: true })
      .limit(8),
    supabase
      .from("idol_groups")
      .select("id,group_code,name,image_url")
      .ilike("name", `%${keyword}%`)
      .order("name", { ascending: true })
      .limit(8),
    supabase
      .from("crews")
      .select("id,crew_code,name,image_url")
      .ilike("name", `%${keyword}%`)
      .order("name", { ascending: true })
      .limit(8),
  ]);

  if (streamersResult.error || groupsResult.error || crewsResult.error) {
    return NextResponse.json(
      { message: "커뮤니티 검색에 실패했습니다." },
      { status: 500 }
    );
  }

  const items: CommunitySearchItem[] = [
    ...(streamersResult.data || [])
      .filter((streamer) => Boolean(streamer.public_id))
      .map((streamer) => ({
        id: `search-vlist-${streamer.id}`,
        type: "vlist" as const,
        name: streamer.nickname || `버츄얼 ${streamer.id}`,
        href: `/community/vlist/${streamer.public_id}`,
        imageUrl: streamer.image_url || null,
      })),
    ...(groupsResult.data || []).map((group) => ({
      id: `search-group-${group.id}`,
      type: "group" as const,
      name: group.name,
      href: `/community/group/${group.group_code ?? group.id}`,
      imageUrl: group.image_url || null,
    })),
    ...(crewsResult.data || []).map((crew) => ({
      id: `search-crew-${crew.id}`,
      type: "crew" as const,
      name: crew.name,
      href: `/community/crew/${crew.crew_code ?? crew.id}`,
      imageUrl: crew.image_url || null,
    })),
  ];

  return NextResponse.json({ items });
}
