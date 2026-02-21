import type { AuthForm, DeleteAccountInput } from "@/types/auth";
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

/**
 * 현재 로그인된 사용자의 계정을 탈퇴(soft delete 가능) 처리한다.
 * 이메일(가입) 사용자인 경우, 추가 보안을 위해 비밀번호를 재확인한다.
 * 탈퇴 성공 시 Supabase 로컬 세션 및 브라우저 세션 상태를 초기화한다.
 *
 * @param params 탈퇴 처리 요청 객체 (provider, email, password 포함)
 */
export async function deleteMyAccount(params: DeleteAccountInput) {
  const { provider, email, password } = params;

  // 이메일 로그인 계정은 비밀번호 재확인 후 탈퇴 처리
  if (provider === "email") {
    if (!email || !password) {
      throw new Error("비밀번호 확인이 필요합니다.");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }
  }

  const response = await fetch("/api/account/delete", {
    method: "DELETE",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "회원탈퇴에 실패했습니다.");
  }

  // 탈퇴 직후 로컬 세션/토큰도 즉시 제거한다.
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  sessionStorage.removeItem("session_active");
}
