import { createClient } from "@/utils/supabase/client";
import type { IdolGroupUpsertInput } from "@/types/admin";
import type { IdolGroup } from "@/types/group";

const supabase = createClient();

export async function fetchIdolGroups(): Promise<IdolGroup[]> {
    const { data, error } = await supabase
        .from("idol_groups")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createIdolGroup(payload: IdolGroupUpsertInput) {
    const { data, error } = await supabase
        .from("idol_groups")
        .insert({
            ...payload,
            members: [],
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateIdolGroup(
    groupId: number,
    payload: IdolGroupUpsertInput
) {
    const { data, error } = await supabase
        .from("idol_groups")
        .update({
            ...payload,
        })
        .eq("id", groupId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteIdolGroup(groupId: number) {
    const { error } = await supabase
        .from("idol_groups")
        .delete()
        .eq("id", groupId);

    if (error) throw error;
}

export async function uploadIdolGroupImage(file: File) {
    const fileExt = (file.name.split(".").pop() || "png").toLowerCase();
    const randomKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID().replace(/-/g, "")
            : Math.random().toString(36).slice(2, 14);
    // 긴 원본 파일명으로 인한 URL/오브젝트 키 이슈를 피하기 위해
    // 원본 이름 대신 짧은 랜덤 키 기반으로 저장한다.
    const filePath = `idol-groups/${Date.now()}_${randomKey}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("group-images")
        .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const {
        data: { publicUrl },
    } = supabase.storage.from("group-images").getPublicUrl(filePath);

    return publicUrl;
}
