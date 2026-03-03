import Link from "next/link";
import { Heart, Trophy, UserRound } from "lucide-react";
import { formatDateTimeLabel } from "@/components/screens/aggregate/aggregate-screen-utils";
import type { AggregateRankRowProps } from "@/types/aggregate-rank";

export default function AggregateRankRow({ row }: AggregateRankRowProps) {
  return (
    <Link
      href={`/vlist/${row.streamer_public_id || row.streamer_id}`}
      className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-xl border border-gray-200 bg-white px-3 py-3 transition hover:border-gray-400"
    >
      <div className="row-span-2 flex min-w-0 items-center gap-2 self-center">
        <span className="inline-flex min-w-10 items-center justify-center text-sm font-semibold text-gray-700">
          {row.rank <= 3 ? (
            <Trophy
              className={`h-5 w-5 ${
                row.rank === 1 ? "text-yellow-500" : row.rank === 2 ? "text-gray-400" : "text-[#8B5A2B]"
              }`}
            />
          ) : (
            `${row.rank}위`
          )}
        </span>
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          {row.streamer_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.streamer_image_url}
              alt={row.streamer_nickname || "streamer"}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UserRound className="h-4 w-4 text-gray-300" />
            </div>
          )}
        </div>
        <p className="truncate text-sm font-semibold text-gray-900">{row.streamer_nickname || "이름 미등록"}</p>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        <p className="truncate text-[11px] text-gray-500">
          집계 기간: {formatDateTimeLabel(row.period_start_at)} ~ {formatDateTimeLabel(row.period_end_at)}
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          {row.total_received.toLocaleString()}
        </span>
      </div>

      <div className="overflow-x-auto text-xs text-gray-600">
        <p className="flex items-center justify-end gap-3 whitespace-nowrap text-right">
          <span>
            기부 유저 수: <span className="font-medium text-gray-800">{row.donor_count.toLocaleString()}</span>
          </span>
          <span>
            최다 기부 유저:{" "}
            <span className="font-medium text-gray-800">{row.top_donor_nickname || row.top_donor_user_id || "-"}</span>
            {" · "}
            <span className="font-medium text-gray-800">{row.top_donor_total.toLocaleString()}</span>
          </span>
        </p>
      </div>
    </Link>
  );
}
