import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProfileFormValues } from "@/utils/schema";

type ProfileBasicFieldsSectionProps = {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  bioLength: number;
};

/** 닉네임/자기소개 입력 섹션 */
export default function ProfileBasicFieldsSection({
  register,
  errors,
  bioLength,
}: ProfileBasicFieldsSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="nickname" className="text-sm font-semibold text-gray-700">
          닉네임
        </Label>
        <Input
          id="nickname"
          placeholder="닉네임을 입력해주세요"
          {...register("nickname")}
          className="h-11"
        />
        {errors.nickname ? (
          <p className="text-xs text-red-500 mt-1">{errors.nickname.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
            자기소개
          </Label>
          <span className={`text-xs ${bioLength > 200 ? "text-red-500" : "text-gray-400"}`}>
            {bioLength} / 200
          </span>
        </div>
        <Textarea
          id="bio"
          placeholder="자기소개를 입력해주세요"
          rows={4}
          {...register("bio")}
          className="resize-none"
        />
        {errors.bio ? <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p> : null}
      </div>
    </>
  );
}
