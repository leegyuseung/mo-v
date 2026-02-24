import { Separator } from "@/components/ui/separator";
import PasswordChangeSection from "@/components/screens/profile/password-change-section";

type ProfilePasswordPanelProps = {
  enabled: boolean;
  currentPw: string;
  setCurrentPw: (value: string) => void;
  newPw: string;
  setNewPw: (value: string) => void;
  confirmPw: string;
  setConfirmPw: (value: string) => void;
  showCurrentPw: boolean;
  setShowCurrentPw: (value: boolean) => void;
  showNewPw: boolean;
  setShowNewPw: (value: boolean) => void;
  showConfirmPw: boolean;
  setShowConfirmPw: (value: boolean) => void;
  isPwChanging: boolean;
  handleChangePassword: () => Promise<void>;
};

/** 이메일 가입 계정에서만 노출되는 비밀번호 변경 패널 */
export default function ProfilePasswordPanel({ enabled, ...passwordProps }: ProfilePasswordPanelProps) {
  if (!enabled) return null;

  return (
    <>
      <Separator />
      <PasswordChangeSection {...passwordProps} />
    </>
  );
}
