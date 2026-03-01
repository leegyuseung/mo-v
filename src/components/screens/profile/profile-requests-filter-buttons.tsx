import { Button } from "@/components/ui/button";
import type { RequestFilter } from "@/types/profile";

type ProfileRequestsFilterButtonsProps = {
  filter: RequestFilter;
  totalCount: number;
  registrationCount: number;
  infoEditCount: number;
  reportCount: number;
  errorReportCount: number;
  liveBoxCount: number;
  onFilterChange: (nextFilter: RequestFilter) => void;
};

/** 요청 내역 상단 필터 버튼 그룹 */
export default function ProfileRequestsFilterButtons({
  filter,
  totalCount,
  registrationCount,
  infoEditCount,
  reportCount,
  errorReportCount,
  liveBoxCount,
  onFilterChange,
}: ProfileRequestsFilterButtonsProps) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={() => onFilterChange("all")}
        variant={filter === "all" ? "default" : "outline"}
        className={`cursor-pointer rounded-xl ${filter === "all" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""}`}
      >
        전체 {totalCount}
      </Button>
      <Button
        type="button"
        onClick={() => onFilterChange("registration")}
        variant={filter === "registration" ? "default" : "outline"}
        className={`cursor-pointer rounded-xl ${filter === "registration" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""}`}
      >
        버츄얼 추가 요청 {registrationCount}
      </Button>
      <Button
        type="button"
        onClick={() => onFilterChange("info-edit")}
        variant={filter === "info-edit" ? "default" : "outline"}
        className={`cursor-pointer rounded-xl ${filter === "info-edit" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""}`}
      >
        정보 수정 요청 {infoEditCount}
      </Button>
      <Button
        type="button"
        onClick={() => onFilterChange("report")}
        variant={filter === "report" ? "default" : "outline"}
        className={`cursor-pointer rounded-xl ${filter === "report" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""}`}
      >
        정보 신고 요청 {reportCount}
      </Button>
      <Button
        type="button"
        onClick={() => onFilterChange("error-report")}
        variant={filter === "error-report" ? "default" : "outline"}
        className={`cursor-pointer rounded-xl ${filter === "error-report" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""}`}
      >
        오류 신고 요청 {errorReportCount}
      </Button>
      <Button
        type="button"
        onClick={() => onFilterChange("live-box")}
        variant={filter === "live-box" ? "default" : "outline"}
        className={`cursor-pointer rounded-xl ${filter === "live-box" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""}`}
      >
        라이브박스 요청 {liveBoxCount}
      </Button>
    </div>
  );
}
