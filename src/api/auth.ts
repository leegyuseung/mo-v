import { authForm } from "@/types/auth";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const signUp = async (formData: authForm) => {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      // emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export async function signInWithPassword({ email, password }: authForm) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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

export async function fetchHeartPoints(userId: string) {
  const { data, error } = await supabase
    .from("heart_points")
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

export async function addHeartPoints(userId: string, points: number) {
  // 현재 포인트 조회 (없으면 null)
  const { data: current } = await supabase
    .from("heart_points")
    .select("point")
    .eq("id", userId)
    .maybeSingle();

  const currentPoints = current?.point || 0;

  // upsert: 행이 없으면 생성, 있으면 업데이트
  const { data, error } = await supabase
    .from("heart_points")
    .upsert({
      id: userId,
      point: currentPoints + points,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

