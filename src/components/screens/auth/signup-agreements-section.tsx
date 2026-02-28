"use client";

import { ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SIGNUP_AGREEMENTS } from "@/components/screens/auth/signup-screen-constants";
import type { AgreementId, SignUpAgreementsState } from "@/types/signup-screen";

type SignupAgreementsSectionProps = {
  agreements: SignUpAgreementsState;
  isAllChecked: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleSingle: (id: AgreementId, checked: boolean) => void;
  onOpenTermsModal: (title: string, content: string) => void;
};

export default function SignupAgreementsSection({
  agreements,
  isAllChecked,
  onToggleAll,
  onToggleSingle,
  onOpenTermsModal,
}: SignupAgreementsSectionProps) {
  return (
    <div className="w-full flex flex-col gap-3 border-y border-gray-100 py-4">
      <div className="flex items-center space-x-2 pb-2">
        <Checkbox
          id="all-agree"
          checked={isAllChecked}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
        />
        <Label htmlFor="all-agree" className="cursor-pointer text-sm font-bold">
          모두 확인, 동의합니다
        </Label>
      </div>

      {SIGNUP_AGREEMENTS.map(({ id, title, required, content }) => (
        <div key={id} className="group flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={agreements[id]}
              onCheckedChange={(checked) => onToggleSingle(id, checked === true)}
            />
            <Label htmlFor={id} className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
              <span className={required ? "text-blue-600 font-medium" : "text-gray-400"}>
                {required ? "(필수)" : "(선택)"}
              </span>
              {title}
            </Label>
          </div>

          <button
            type="button"
            onClick={() => onOpenTermsModal(title, content)}
            className="cursor-pointer p-1 text-gray-300 transition-colors hover:text-gray-600"
            aria-label={`${title} 내용 보기`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
