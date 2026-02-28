"use client";

import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseFormRegister } from "react-hook-form";
import type { SignUpFormValues } from "@/utils/schema";

type SignupPasswordFieldProps = {
  label: string;
  placeholder: string;
  fieldName: "password" | "confirmPassword";
  register: UseFormRegister<SignUpFormValues>;
  errorMessage?: string;
  visible: boolean;
  onToggleVisible: () => void;
};

export default function SignupPasswordField({
  label,
  placeholder,
  fieldName,
  register,
  errorMessage,
  visible,
  onToggleVisible,
}: SignupPasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-sm font-bold">{label}</Label>
      <div className="relative">
        <Input
          {...register(fieldName)}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          className="h-12.5 pr-12"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer transition-colors"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <div className="h-5">
        {errorMessage ? <p className="text-destructive text-xs">{errorMessage}</p> : null}
      </div>
    </div>
  );
}
