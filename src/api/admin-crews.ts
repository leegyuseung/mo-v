import { createClient } from "@/utils/supabase/client";
import type { Crew, CrewUpsertInput } from "@/types/crew";

const supabase = createClient();

/** 전체 크루 목록을 최신순으로 조회한다 */
export async function fetchCrews(): Promise<Crew[]> {
  const { data, error } = await supabase.from("crews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Crew[];
}

/** 새 크루를 생성한다. members 배열은 빈 배열로 초기화된다 */
export async function createCrew(payload: CrewUpsertInput) {
  const { data, error } = await supabase.from("crews")
    .insert({
      ...payload,
      members: [],
    })
    .select()
    .single();

  if (error) throw error;
  return data as Crew;
}

/** 크루 정보를 수정한다 */
export async function updateCrew(crewId: number, payload: CrewUpsertInput) {
  const { data, error } = await supabase.from("crews")
    .update({
      ...payload,
    })
    .eq("id", crewId)
    .select()
    .single();

  if (error) throw error;
  return data as Crew;
}

/** 크루를 삭제한다 */
export async function deleteCrew(crewId: number) {
  const { error } = await supabase.from("crews").delete().eq("id", crewId);
  if (error) throw error;
}

/** 크루 대표 이미지를 group-images 버킷에 업로드하고 publicUrl을 반환한다 */
export async function uploadCrewImage(file: File) {
  const fileExt = (file.name.split(".").pop() || "png").toLowerCase();
  const randomKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2, 14);
  const filePath = `crews/${Date.now()}_${randomKey}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("group-images")
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("group-images").getPublicUrl(filePath);

  return publicUrl;
}
