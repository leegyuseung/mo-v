import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/api/auth";

/** 비밀번호 재설정 메일 발송 mutation 훅 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => resetPassword(email),
  });
}
