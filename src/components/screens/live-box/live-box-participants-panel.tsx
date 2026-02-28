import Image from "next/image";
import Link from "next/link";
import { ExternalLink, UserRound } from "lucide-react";
import { toSafeExternalHttpUrl } from "@/utils/safe-url";
import type { LiveBoxParticipantsPanelProps } from "@/types/live-box-screen";

export default function LiveBoxParticipantsPanel({
  liveBox,
  filteredParticipantIds,
  participantByPlatformId,
  liveByPlatformId,
}: LiveBoxParticipantsPanelProps) {
  return (
    <div className="mt-5 border-t border-gray-100 pt-4">
      <p className="mb-2 text-sm font-medium text-gray-700">참여자</p>
      <div className="max-h-80 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {liveBox.participant_streamer_ids.length > 0 ? (
            filteredParticipantIds.map((platformId) => {
              const participant = participantByPlatformId.get(platformId);
              const liveInfo = liveByPlatformId.get(platformId);
              const safeLiveUrl = toSafeExternalHttpUrl(liveInfo?.liveUrl);
              const isLive = Boolean(safeLiveUrl);
              const participantBorderClass =
                participant?.platform === "chzzk"
                  ? "border-2 border-green-400"
                  : participant?.platform === "soop"
                    ? "border-2 border-blue-400"
                    : "border-2 border-gray-300";

              const content = (
                <>
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-gray-100 ${participantBorderClass}`}
                  >
                    {participant?.imageUrl ? (
                      <Image
                        src={participant.imageUrl}
                        alt={participant.nickname || platformId}
                        fill
                        sizes="32px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <UserRound className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm text-gray-700">
                        {participant?.nickname || "이름 미등록"}
                      </span>
                      {isLive ? (
                        <span className="inline-flex items-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          LIVE
                        </span>
                      ) : null}
                    </div>
                    {isLive ? (
                      <span className="text-xs text-gray-500">
                        {(liveInfo?.viewerCount ?? 0).toLocaleString()}명 시청 중
                      </span>
                    ) : null}
                  </div>
                  {isLive ? <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-400" /> : null}
                </>
              );

              if (safeLiveUrl) {
                return (
                  <Link
                    key={`${liveBox.id}-detail-participant-${platformId}`}
                    href={safeLiveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-100 bg-red-50/40 px-3 py-2 hover:bg-red-50"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={`${liveBox.id}-detail-participant-${platformId}`}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2"
                >
                  {content}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400">참여자가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
