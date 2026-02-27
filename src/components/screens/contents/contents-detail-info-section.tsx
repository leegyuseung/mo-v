import type { ContentsDetailInfoSectionProps } from "@/types/contents-detail";

export default function ContentsDetailInfoSection({
  detailItems,
  participationRequirement,
  description,
}: ContentsDetailInfoSectionProps) {
  return (
    <>
      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
        {detailItems.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3 py-1.5"
          >
            <span className="inline-flex items-center justify-center text-center text-xs font-medium text-gray-500">
              {item.label}
            </span>
            <span className="break-all text-sm leading-6 text-gray-700">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="md:col-span-2">
        <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3 py-1.5">
            <span className="inline-flex items-center justify-center text-center text-xs font-medium text-gray-500">
              참가조건
            </span>
            <p className="break-all text-sm leading-6 text-gray-700">
              {participationRequirement?.trim() || "-"}
            </p>
          </div>
        </div>

        <p className="mb-2 text-xs font-medium text-gray-500">상세설명</p>
        {description ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{description}</p>
        ) : (
          <p className="text-sm text-gray-500">설명이 없습니다.</p>
        )}
      </div>
    </>
  );
}
