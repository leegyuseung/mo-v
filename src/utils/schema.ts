import * as z from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "이메일을 입력해주세요." })
      .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: "올바른 이메일 형식이 아닙니다.",
      }),
    password: z
      .string()
      .min(10, { message: "비밀번호는 최소 10자 이상이어야 합니다." })
      .max(15, { message: "비밀번호는 최대 15자 이하이어야 합니다." })
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^*])/, {
        message: "영문, 숫자, 특수문자를 포함해야 합니다.",
      })
      .refine((val) => !val.includes("&"), {
        message: "& 문자는 사용할 수 없습니다.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], // 에러 메시지가 confirmPassword 필드에 표시되도록 설정
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
