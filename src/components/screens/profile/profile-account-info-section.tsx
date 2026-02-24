import { CalendarDays, Heart, Mail } from "lucide-react";

type ProfileAccountInfoSectionProps = {
  email: string;
  createdAt: string;
  heartPoint: number;
};

/** 읽기 전용 계정 정보 섹션 */
export default function ProfileAccountInfoSection({
  email,
  createdAt,
  heartPoint,
}: ProfileAccountInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">계정 정보</h2>

      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
        <Mail className="w-5 h-5 text-gray-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">이메일</p>
          <p className="text-sm text-gray-700 truncate">{email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
        <CalendarDays className="w-5 h-5 text-gray-400 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-gray-400">가입일</p>
          <p className="text-sm text-gray-700">{createdAt}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
        <Heart className="w-5 h-5 text-red-400 fill-red-400 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-gray-400">하트 포인트</p>
          <p className="text-sm font-semibold text-gray-700">{heartPoint.toLocaleString()} 하트</p>
        </div>
      </div>
    </div>
  );
}
