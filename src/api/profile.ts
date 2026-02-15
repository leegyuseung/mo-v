import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateProfile(
    userId: string,
    data: { nickname?: string; bio?: string; avatar_url?: string; is_first_edit?: boolean }
) {
    const { data: profile, error } = await supabase
        .from("profiles")
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

    if (error) throw error;
    return profile;
}

export async function uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    // 기존 아바타 삭제 (에러 무시)
    await supabase.storage.from("avatars").remove([filePath]);

    // 새 아바타 업로드
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Public URL 가져오기
    const {
        data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return publicUrl;
}
