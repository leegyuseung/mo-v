import { UserRound } from "lucide-react";

type ProfileLoginRequiredStateProps = {
  className: string;
};

/** 비로그인 상태 안내 */
export default function ProfileLoginRequiredState({ className }: ProfileLoginRequiredStateProps) {
  return (
    <div className={className}>
      <div className="text-center py-16">
        <UserRound className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">로그인이 필요합니다</h2>
        <p className="text-gray-500">프로필을 수정하려면 먼저 로그인해주세요.</p>
      </div>
    </div>
  );
}
