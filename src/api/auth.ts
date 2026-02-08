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
