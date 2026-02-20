import { createClient } from "@/utils/supabase/client";
import { validateNicknameInput } from "@/utils/validate";

const supabase = createClient();

/** 유저 프로필을 조회한다 */
export async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;
    return data;
}

/** 유저 프로필을 수정한다. 닉네임 변경 시 RPC로 코드를 재할당한다 */
export async function updateProfile(
    userId: string,
    data: { nickname?: string; bio?: string; avatar_url?: string; is_first_edit?: boolean }
) {
    const validatedNickname = validateNicknameInput(data.nickname);

    if (validatedNickname !== undefined) {
        const { error: nicknameError } = await supabase.rpc("assign_profile_nickname_code", {
            p_user_id: userId,
            p_nickname: validatedNickname,
        });
        if (nicknameError) throw nicknameError;
    }

    const updates: {
        bio?: string;
        avatar_url?: string;
        is_first_edit?: boolean;
        updated_at: string;
    } = {
        updated_at: new Date().toISOString(),
    };

    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.avatar_url !== undefined) updates.avatar_url = data.avatar_url;
    if (data.is_first_edit !== undefined) updates.is_first_edit = data.is_first_edit;

    const shouldUpdateProfileColumns =
        data.bio !== undefined ||
        data.avatar_url !== undefined ||
        data.is_first_edit !== undefined;

    if (shouldUpdateProfileColumns) {
        const { error: updateError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", userId);
        if (updateError) throw updateError;
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;
    return profile;
}

/** 유저 아바타를 Supabase Storage에 업로드하고 공개 URL을 반환한다 */
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
