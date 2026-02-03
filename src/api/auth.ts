import { authForm } from "@/types/auth";
import { createClient } from "@/utils/supabase/client";

export const signUp = async (formData: authForm) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        nickname: formData.nickname,
        display_name: formData.nickname,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};
