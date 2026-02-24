import { Button } from "@/components/ui/button";
import { Gift, Save, UserRoundX } from "lucide-react";

type ProfileActionButtonsProps = {
  isFirstEdit: boolean;
  hasChanges: boolean;
  isPending: boolean;
  onOpenWithdrawAlert: () => void;
};

/** 프로필 저장/탈퇴 액션 영역 */
export default function ProfileActionButtons({
  isFirstEdit,
  hasChanges,
  isPending,
  onOpenWithdrawAlert,
}: ProfileActionButtonsProps) {
  return (
    <div className="flex flex-col items-end gap-3">
      {isFirstEdit ? (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <Gift className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-amber-700 font-medium">
            🎉 첫 프로필 수정 시 <strong className="text-amber-900">50 하트포인트</strong>를 드려요!
          </span>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={onOpenWithdrawAlert}
          className="px-8 h-11 rounded-xl font-semibold cursor-pointer bg-red-600 text-white hover:bg-red-700"
        >
          <UserRoundX className="w-4 h-4 mr-1.5" />
          회원탈퇴하기
        </Button>
        <Button
          type="submit"
          disabled={!hasChanges || isPending}
          className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              수정 중...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              수정하기
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
