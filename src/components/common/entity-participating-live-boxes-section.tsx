"use client";

import Link from "next/link";
import { CalendarClock, Boxes, UserRound } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import LiveBoxStatusBadge from "@/components/common/live-box-status-badge";
import { useParticipatingLiveBoxes } from "@/hooks/queries/live-box/use-participating-live-boxes";
import { formatLiveBoxDisplayDate } from "@/utils/live-box-presenter";
import type {
  EntityParticipatingLiveBoxCard,
  EntityParticipatingLiveBoxesSectionProps,
} from "@/types/entity-participating-live-boxes";

export default function EntityParticipatingLiveBoxesSection({
  title,
  members,
}: EntityParticipatingLiveBoxesSectionProps) {
  const platformIds = members.flatMap((member) => [
    member.chzzk_id || "",
    member.soop_id || "",
  ]);
  const { data: liveBoxes = [], isLoading, isError } = useParticipatingLiveBoxes(platformIds);

  const cards: EntityParticipatingLiveBoxCard[] = liveBoxes
    .filter((liveBox) => liveBox.status === "대기" || liveBox.status === "진행중")
    .map((liveBox) => {
      const participantIds = liveBox.participant_streamer_ids.map((platformId) =>
        platformId.trim().toLowerCase()
      );
      const matchedMembers = members.filter((member) =>
        [member.chzzk_id, member.soop_id]
          .filter(Boolean)
          .some((platformId) => participantIds.includes((platformId || "").trim().toLowerCase()))
      );

      return { liveBox, matchedMembers };
    })
    .filter((item) => item.matchedMembers.length > 0);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Boxes className="h-4 w-4 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>

      {isLoading ? (
        <div className="flex min-h-24 items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <p className="text-sm text-gray-400">라이브박스 목록을 불러오지 못했습니다.</p>
      ) : cards.length === 0 ? (
        <p className="text-sm text-gray-400">참여 중인 라이브박스가 없습니다.</p>
      ) : (
        <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
          {cards.map(({ liveBox, matchedMembers }) => (
            <Link
              key={liveBox.id}
              href={`/live-box/${liveBox.id}`}
              className="block rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:border-gray-200 hover:bg-gray-100/70"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{liveBox.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>시작일시 {formatLiveBoxDisplayDate(liveBox.starts_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>마감일시 {formatLiveBoxDisplayDate(liveBox.ends_at)}</span>
                    </div>
                  </div>
                </div>
                <LiveBoxStatusBadge status={liveBox.status} className="px-2 py-0.5" />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-gray-500">참여 멤버</span>
                {matchedMembers.map((member) => (
                  <span
                    key={`${liveBox.id}-member-${member.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700"
                  >
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.nickname || "member"}
                        loading="lazy"
                        className="h-4 w-4 rounded-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-3.5 w-3.5" />
                    )}
                    <span>{member.nickname || "이름 미등록"}</span>
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
