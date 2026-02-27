import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import type { ShowcaseStreamerListProps } from "@/types/home-screen";

export function getStatusBadgeClass(status: string) {
  if (status === "진행중") return "bg-green-50 text-green-700 border-green-200";
  if (status === "종료") return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export function formatEndsAt(value: string | null) {
  if (!value) return "미설정";
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getStreamerRingClass(platform: string | null) {
  if (platform === "chzzk") return "border-green-500";
  if (platform === "soop") return "border-blue-500";
  return "border-gray-300";
}

export function getDdayLabel(days: number | null | undefined) {
  if (days === null || days === undefined) return "-";
  if (days <= 0) return "D-day";
  return `D-${days}`;
}

export function ShowcaseStreamerList({
  streamers,
  emptyText,
  showBirthdayMeta = false,
  enableScrollWhenMany = false,
}: ShowcaseStreamerListProps) {
  if (streamers.length === 0) {
    return <p className="py-6 text-center text-xs text-gray-400">{emptyText}</p>;
  }

  const listClassName =
    enableScrollWhenMany ? "max-h-[140px] space-y-2 overflow-y-auto pt-1 pr-1" : "space-y-2";

  return (
    <div className={listClassName}>
      {streamers.map((streamer) => (
        <Link
          key={`home-showcase-streamer-${streamer.id}`}
          href={`/vlist/${streamer.public_id || String(streamer.id)}`}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-100/60 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.45)]"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-white p-0.5 ${getStreamerRingClass(
              streamer.platform
            )}`}
          >
            <div className="relative h-full w-full overflow-hidden rounded-full bg-gray-100">
              {streamer.image_url ? (
                <Image
                  src={streamer.image_url}
                  alt={streamer.nickname || "streamer"}
                  fill
                  sizes="44px"
                  loading="lazy"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound className="h-4 w-4 text-gray-300" />
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {streamer.nickname || "이름 미등록"}
            </p>
            {showBirthdayMeta ? (
              <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-500">
                <span>생일: {streamer.birthday || "-"}</span>
                <span className="font-semibold text-gray-700">
                  {getDdayLabel(streamer.daysUntilBirthday)}
                </span>
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
