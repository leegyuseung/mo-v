import { authForm } from "@/types/auth";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });

  if (error) throw error;
}

export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string
) {
  // 현재 비밀번호 확인
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (signInError) throw new Error("현재 비밀번호가 일치하지 않습니다.");

  // 새 비밀번호로 변경
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) throw updateError;
}

export async function signInWithProvider(provider: "google" | "kakao") {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}
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

export async function addHeartPoints(
  userId: string,
  points: number,
  type: string = "etc",
  description?: string
) {
  // 현재 포인트 조회 (없으면 null)
  const { data: current } = await supabase
    .from("heart_points")
    .select("point")
    .eq("id", userId)
    .maybeSingle();

  const currentPoints = current?.point || 0;
  const newPoints = currentPoints + points;

  // upsert: 행이 없으면 생성, 있으면 업데이트
  const { data, error } = await supabase
    .from("heart_points")
    .upsert({
      id: userId,
      point: newPoints,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // 히스토리 기록
  await supabase.from("heart_point_history").insert({
    user_id: userId,
    amount: points,
    type,
    description: description || null,
    after_point: newPoints,
  });

  return data;
}

export async function fetchHeartPointHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  const { data, error, count } = await supabase
    .from("heart_point_history")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}
