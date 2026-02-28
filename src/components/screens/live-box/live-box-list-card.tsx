import Image from "next/image";
import Link from "next/link";
import { CalendarClock, Tag, UserRound, Users } from "lucide-react";
import LiveBoxStatusBadge from "@/components/common/live-box-status-badge";
import { formatLiveBoxDisplayDate } from "@/utils/live-box-presenter";
import type { LiveBoxListCardProps } from "@/types/live-box-screen";

/**
 * 목록 카드 1개를 분리해 렌더링 비용과 화면 컴포넌트 복잡도를 낮춘다.
 * 왜: 필터/정렬 state 변경 시 전체 파일 재평가 범위를 줄이기 위함.
 */
export default function LiveBoxListCard({
  box,
  participantByPlatformId,
  brokenParticipantImageById,
  onParticipantImageError,
}: LiveBoxListCardProps) {
  const participantPreviews = box.participant_streamer_ids.map((platformId) => {
    const participant = participantByPlatformId.get(platformId);
    return {
      platformId,
      nickname: participant?.nickname || null,
      imageUrl: participant?.imageUrl || null,
    };
  });

  const visibleParticipants = participantPreviews.slice(0, 17);
  const hiddenParticipantCount = Math.max(0, participantPreviews.length - visibleParticipants.length);
  const participantRenderCountById = new Map<string, number>();

  return (
    <Link
      href={`/live-box/${box.id}`}
      className="group block cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:bg-gray-50/40 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.45)]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-black">
          {box.title}
        </h2>
        <LiveBoxStatusBadge status={box.status} className="px-2 py-0.5" />
      </div>

      <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-600">
        <Tag className="h-3.5 w-3.5" />
        <div className="flex flex-wrap gap-1.5">
          {box.category.length > 0 ? (
            box.category.map((item) => (
              <span
                key={`${box.id}-category-${item}`}
                className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5"
              >
                {item}
              </span>
            ))
          ) : (
            <span>-</span>
          )}
        </div>
      </div>

      <p className="mb-4 truncate text-sm text-gray-600">{box.description?.trim() || "설명이 없습니다."}</p>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-gray-500">참여자</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleParticipants.length > 0 ? (
            <>
              {visibleParticipants.map((participant) => {
                const isBroken = brokenParticipantImageById[participant.platformId] === true;
                const renderCount = (participantRenderCountById.get(participant.platformId) || 0) + 1;
                participantRenderCountById.set(participant.platformId, renderCount);

                return (
                  <div
                    key={`${box.id}-participant-${participant.platformId}-${renderCount}`}
                    title={participant.nickname || "이름 미등록"}
                    className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100"
                  >
                    {participant.imageUrl && !isBroken ? (
                      <Image
                        src={participant.imageUrl}
                        alt={participant.nickname || participant.platformId}
                        fill
                        sizes="32px"
                        className="object-cover"
                        unoptimized
                        onError={() => onParticipantImageError(participant.platformId)}
                      />
                    ) : (
                      <UserRound className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                );
              })}

              {hiddenParticipantCount > 0 ? (
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-1.5 text-[10px] font-medium text-violet-700">
                  +{hiddenParticipantCount}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-xs text-gray-400">참여자 없음</span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          <span>참여자 수 {box.participant_streamer_ids.length.toLocaleString()}명</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
          <span>시작일시 {formatLiveBoxDisplayDate(box.starts_at)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
          <span>종료일시 {formatLiveBoxDisplayDate(box.ends_at)}</span>
        </div>
      </div>
    </Link>
  );
}
