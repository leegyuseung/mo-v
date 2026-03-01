import { Button } from "@/components/ui/button";

type AdminRequestActionButtonsProps = {
  approveLabel?: string;
  rejectLabel?: string;
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
};

/**
 * 관리자 요청 처리 버튼 UI를 공통화한다.
 * 왜: 화면별 버튼 스타일 편차를 제거하고 정책 변경 시 한 곳에서 관리하기 위함.
 */
export default function AdminRequestActionButtons({
  approveLabel = "확인",
  rejectLabel = "거절",
  onApprove,
  onReject,
  disabled = false,
}: AdminRequestActionButtonsProps) {
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        onClick={onApprove}
        disabled={disabled}
        className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
      >
        {approveLabel}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onReject}
        disabled={disabled}
        className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {rejectLabel}
      </Button>
    </div>
  );
}
