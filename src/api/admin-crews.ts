import { createClient } from "@/utils/supabase/client";
import type { Crew, CrewUpsertInput } from "@/types/admin";

const supabase = createClient();

const crewsTable = () =>
  (supabase as unknown as { from: (table: string) => any }).from("crews");

export async function fetchCrews(): Promise<Crew[]> {
  const { data, error } = await crewsTable()
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Crew[];
}

export async function createCrew(payload: CrewUpsertInput) {
  const { data, error } = await crewsTable()
    .insert({
      ...payload,
      members: [],
    })
    .select()
    .single();

  if (error) throw error;
  return data as Crew;
}

export async function updateCrew(crewId: number, payload: CrewUpsertInput) {
  const { data, error } = await crewsTable()
    .update({
      ...payload,
    })
    .eq("id", crewId)
    .select()
    .single();

  if (error) throw error;
  return data as Crew;
}

export async function deleteCrew(crewId: number) {
  const { error } = await crewsTable().delete().eq("id", crewId);
  if (error) throw error;
}

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
