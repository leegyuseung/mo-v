import ConfirmAlert from "@/components/common/confirm-alert";
import WithdrawAccountModal from "@/components/screens/profile/withdraw-account-modal";

type ProfileWithdrawDialogsProps = {
  isWithdrawAlertOpen: boolean;
  setIsWithdrawAlertOpen: (value: boolean) => void;
  isWithdrawConfirmOpen: boolean;
  setIsWithdrawConfirmOpen: (value: boolean) => void;
  isEmailProvider: boolean;
  withdrawPassword: string;
  setWithdrawPassword: (value: string) => void;
  withdrawPasswordConfirm: string;
  setWithdrawPasswordConfirm: (value: string) => void;
  withdrawConfirmText: string;
  setWithdrawConfirmText: (value: string) => void;
  isWithdrawing: boolean;
  handleWithdrawAccount: () => Promise<void>;
  closeWithdrawConfirmModal: () => void;
};

/** 회원탈퇴 확인 다이얼로그 묶음 */
export default function ProfileWithdrawDialogs({
  isWithdrawAlertOpen,
  setIsWithdrawAlertOpen,
  isWithdrawConfirmOpen,
  setIsWithdrawConfirmOpen,
  isEmailProvider,
  withdrawPassword,
  setWithdrawPassword,
  withdrawPasswordConfirm,
  setWithdrawPasswordConfirm,
  withdrawConfirmText,
  setWithdrawConfirmText,
  isWithdrawing,
  handleWithdrawAccount,
  closeWithdrawConfirmModal,
}: ProfileWithdrawDialogsProps) {
  return (
    <>
      <ConfirmAlert
        open={isWithdrawAlertOpen}
        title="회원탈퇴 안내"
        description="회원탈퇴 시 하트포인트가 사라지며, 하트 사용/선물 내역·즐겨찾기·정보수정요청 같은 관련 기록이 삭제되거나 복구가 어려울 수 있습니다. 계속 진행하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
        confirmVariant="danger"
        onCancel={() => setIsWithdrawAlertOpen(false)}
        onConfirm={() => {
          setIsWithdrawAlertOpen(false);
          setIsWithdrawConfirmOpen(true);
        }}
      />

      {isWithdrawConfirmOpen ? (
        <WithdrawAccountModal
          isEmailProvider={isEmailProvider}
          withdrawPassword={withdrawPassword}
          setWithdrawPassword={setWithdrawPassword}
          withdrawPasswordConfirm={withdrawPasswordConfirm}
          setWithdrawPasswordConfirm={setWithdrawPasswordConfirm}
          withdrawConfirmText={withdrawConfirmText}
          setWithdrawConfirmText={setWithdrawConfirmText}
          isWithdrawing={isWithdrawing}
          handleWithdrawAccount={handleWithdrawAccount}
          closeWithdrawConfirmModal={closeWithdrawConfirmModal}
        />
      ) : null}
    </>
  );
}
