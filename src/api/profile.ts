import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
const NICKNAME_REGEX = /^[0-9A-Za-z가-힣_]+$/;

function validateNicknameInput(nickname?: string): string | undefined {
  if (nickname === undefined) return undefined;

  const trimmed = nickname.trim();
  if (!trimmed) {
    throw new Error("닉네임은 비어 있을 수 없습니다.");
  }
  if (trimmed.length < 2 || trimmed.length > 15) {
    throw new Error("닉네임은 2자 이상 15자 이하로 입력해 주세요.");
  }
  if (!NICKNAME_REGEX.test(trimmed)) {
    throw new Error("닉네임은 한글/영문/숫자/_ 만 사용할 수 있습니다.");
  }

  return trimmed;
}

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
