import type { AuthForm } from "@/types/auth";
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

export const signUp = async (formData: AuthForm) => {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export async function signInWithPassword({ email, password }: AuthForm) {
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
