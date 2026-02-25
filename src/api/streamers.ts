import { createClient } from "@/utils/supabase/client";
import type {
  CreateStreamerInfoEditRequestInput,
  CreateStreamerRequestInput,
  StreamerListParams,
  StreamerListResponse,
} from "@/types/streamer";
import {
  STREAMER_INFO_EDIT_REQUEST_TABLE,
  STREAMER_REQUEST_TABLE,
  STREAMER_TABLE,
} from "@/lib/constant";

const supabase = createClient();

/** 버츄얼 목록을 플랫폼·정렬·키워드 필터로 페이징 조회한다. 하트순 정렬 시 랭킹 뷰를 사용한다 */
export async function fetchStreamers({
  page,
  pageSize,
  platform,
  genre,
  sortBy,
  sortOrder,
  keyword,
}: StreamerListParams): Promise<StreamerListResponse> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const trimmedKeyword = keyword.trim();
  const trimmedGenre = genre.trim();
  const hasGenreFilter = trimmedGenre !== "" && trimmedGenre !== "all";

  if (sortBy === "star") {
    let streamerQuery = supabase.from(STREAMER_TABLE).select("*");

    if (platform !== "all") {
      streamerQuery = streamerQuery.eq("platform", platform);
    }
    if (hasGenreFilter) {
      streamerQuery = streamerQuery.contains("genre", [trimmedGenre]);
    }
    if (trimmedKeyword) {
      streamerQuery = streamerQuery.ilike("nickname", `%${trimmedKeyword}%`);
    }

    const { data: filteredStreamers, error: streamerError } = await streamerQuery;
    if (streamerError) throw streamerError;

    const streamersAll = filteredStreamers || [];
    const streamerIds = streamersAll.map((row) => row.id);

    const starCountById = new Map<number, number>();
    if (streamerIds.length > 0) {
      const { data: statRows, error: statError } = await supabase
        .from("streamer_star_stats")
        .select("streamer_id,star_count")
        .in("streamer_id", streamerIds);

      if (statError) throw statError;

      (statRows || []).forEach((row) => {
        if (typeof row.streamer_id === "number") {
          starCountById.set(row.streamer_id, row.star_count || 0);
        }
      });
    }

    const sorted = [...streamersAll].sort((a, b) => {
      const aCount = starCountById.get(a.id) || 0;
      const bCount = starCountById.get(b.id) || 0;
      const starDiff = aCount - bCount;
      if (starDiff !== 0) {
        return sortOrder === "asc" ? starDiff : -starDiff;
      }

      const nameDiff = (a.nickname || "").localeCompare(b.nickname || "", "ko");
      return nameDiff;
    });

    return {
      data: sorted.slice(from, to + 1),
      count: sorted.length,
    };
  }

  if (sortBy === "heart") {
    if (hasGenreFilter) {
      let streamerQuery = supabase.from(STREAMER_TABLE).select("*");

      if (platform !== "all") {
        streamerQuery = streamerQuery.eq("platform", platform);
      }
      if (trimmedKeyword) {
        streamerQuery = streamerQuery.ilike("nickname", `%${trimmedKeyword}%`);
      }
      streamerQuery = streamerQuery.contains("genre", [trimmedGenre]);

      const { data: filteredStreamers, error: streamerError } = await streamerQuery;
      if (streamerError) throw streamerError;

      const streamersAll = filteredStreamers || [];
      const streamerIds = streamersAll.map((row) => row.id);

      const heartCountById = new Map<number, number>();
      if (streamerIds.length > 0) {
        const { data: rankRows, error: rankError } = await supabase
          .from("streamer_heart_rank")
          .select("streamer_id,total_received")
          .in("streamer_id", streamerIds);

        if (rankError) throw rankError;

        (rankRows || []).forEach((row) => {
          if (typeof row.streamer_id === "number") {
            heartCountById.set(row.streamer_id, row.total_received || 0);
          }
        });
      }

      const sorted = [...streamersAll].sort((a, b) => {
        const aCount = heartCountById.get(a.id) || 0;
        const bCount = heartCountById.get(b.id) || 0;
        const diff = aCount - bCount;

        if (diff !== 0) {
          return sortOrder === "asc" ? diff : -diff;
        }

        const nameDiff = (a.nickname || "").localeCompare(b.nickname || "", "ko");
        return nameDiff;
      });

      return {
        data: sorted.slice(from, to + 1),
        count: sorted.length,
      };
    }

    let rankQuery = supabase
      .from("streamer_heart_rank")
      .select("streamer_id, total_received, nickname, platform", { count: "exact" })
      .order("total_received", { ascending: sortOrder === "asc", nullsFirst: false })
      .order("nickname", { ascending: true });

    if (platform !== "all") {
      rankQuery = rankQuery.eq("platform", platform);
    }
    if (trimmedKeyword) {
      rankQuery = rankQuery.ilike("nickname", `%${trimmedKeyword}%`);
    }

    const { data: rankRows, error: rankError, count } = await rankQuery.range(from, to);
    if (rankError) throw rankError;

    const orderedIds =
      rankRows
        ?.map((row) => row.streamer_id)
        .filter((id): id is number => typeof id === "number") || [];

    if (orderedIds.length === 0) {
      return { data: [], count: count || 0 };
    }

    const { data: streamerRows, error: streamerError } = await supabase
      .from(STREAMER_TABLE)
      .select("*")
      .in("id", orderedIds);

    if (streamerError) throw streamerError;

    const streamerById = new Map((streamerRows || []).map((row) => [row.id, row]));
    const orderedStreamers = orderedIds
      .map((id) => streamerById.get(id))
      .filter(Boolean);

    return {
      data: orderedStreamers,
      count: count || 0,
    };
  }

  let query = supabase
    .from(STREAMER_TABLE)
    .select("*", { count: "exact" })
    .order("nickname", { ascending: sortOrder === "asc" })
    .order("created_at", { ascending: false });

  if (platform !== "all") {
    query = query.eq("platform", platform);
  }
  if (hasGenreFilter) {
    query = query.contains("genre", [trimmedGenre]);
  }
  if (trimmedKeyword) {
    query = query.ilike("nickname", `%${trimmedKeyword}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
  };
}

/** 버츄얼 장르 목록(중복 제거)을 조회한다. */
export async function fetchStreamerGenres(): Promise<string[]> {
  const { data, error } = await supabase.from(STREAMER_TABLE).select("genre");

  if (error) {
    throw error;
  }

  const genreSet = new Set<string>();
  (data || []).forEach((row) => {
    (row.genre || []).forEach((genreItem: string) => {
      const normalizedGenre = (genreItem || "").trim();
      if (normalizedGenre) {
        genreSet.add(normalizedGenre);
      }
    });
  });

  return Array.from(genreSet).sort((a, b) => a.localeCompare(b, "ko"));
}

/** publicId 또는 레거시 숫자 ID로 버츄얼 상세를 조회한다 */
export async function fetchStreamerByPublicId(streamerPublicId: string) {
  const query = supabase.from(STREAMER_TABLE).select("*");
  const isLegacyNumericId = /^[0-9]+$/.test(streamerPublicId);
  const { data, error } = await (isLegacyNumericId
    ? query.eq("id", Number(streamerPublicId)).single()
    : query.eq("public_id", streamerPublicId).single());

  if (error) {
    throw error;
  }

  return data;
}

/** 버츄얼 등록 요청을 생성한다. 동일 URL의 대기 중 요청이 있으면 중복 방지 */
export async function createStreamerRegistrationRequest({
  requesterId,
  platform,
  platformStreamerId,
  platformStreamerUrl,
}: CreateStreamerRequestInput) {
  // 이미 등록된 버츄얼인지 먼저 확인한다.
  const { data: existingStreamer, error: existingStreamerError } = await supabase
    .from(STREAMER_TABLE)
    .select("id")
    .eq(platform === "chzzk" ? "chzzk_id" : "soop_id", platformStreamerId)
    .limit(1);

  if (existingStreamerError) {
    throw existingStreamerError;
  }

  if (existingStreamer && existingStreamer.length > 0) {
    throw new Error("이미 등록된 버츄얼입니다.");
  }

  const { data: existingPending, error: existsError } = await supabase
    .from(STREAMER_REQUEST_TABLE)
    .select("id")
    .eq("platform_streamer_url", platformStreamerUrl)
    .eq("status", "pending")
    .limit(1);

  if (existsError) {
    throw existsError;
  }

  if (existingPending && existingPending.length > 0) {
    throw new Error("이미 처리대기중입니다.");
  }

  const { error } = await supabase.from(STREAMER_REQUEST_TABLE).insert({
    requester_id: requesterId,
    platform,
    platform_streamer_id: platformStreamerId,
    platform_streamer_url: platformStreamerUrl,
    status: "pending",
  });

  if (error) {
    throw error;
  }
}

/** 버츄얼 정보 수정 요청을 생성한다 */
export async function createStreamerInfoEditRequest({
  content,
  streamerId,
  streamerNickname,
  requesterId,
  requesterNickname,
}: CreateStreamerInfoEditRequestInput) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("수정 요청 내용을 입력해 주세요.");
  }

  const { error } = await supabase.from(STREAMER_INFO_EDIT_REQUEST_TABLE).insert({
    content: trimmedContent,
    streamer_id: streamerId,
    streamer_nickname: streamerNickname,
    requester_id: requesterId,
    requester_nickname: requesterNickname,
    status: "pending",
  });

  if (error) {
    throw error;
  }
}
