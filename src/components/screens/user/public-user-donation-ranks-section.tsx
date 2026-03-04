import Link from "next/link";
import { Heart, UserRound } from "lucide-react";
import type { PublicUserDonationRanksSectionProps } from "@/types/public-user-profile";

export default function PublicUserDonationRanksSection({
  canViewDonationRanks,
  donationRanks,
}: PublicUserDonationRanksSectionProps) {
  return (
    <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-900">하트 기부 랭크</h2>
      {!canViewDonationRanks ? (
        <p className="mt-2 text-sm text-gray-500">사용자가 하트 기부 랭크를 비공개로 설정했습니다.</p>
      ) : donationRanks.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">기부 랭크 정보가 없습니다.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {donationRanks.map((item) => (
            <Link
              key={`${item.streamerId}-${item.donorRank}-${item.totalSent}`}
              href={`/vlist/${item.streamerPublicId || item.streamerId}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 transition-colors hover:border-gray-300"
            >
              <span className="inline-flex min-w-14 items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">
                {item.donorRank}위
              </span>
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {item.streamerImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.streamerImageUrl}
                    alt={item.streamerNickname || "streamer"}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound className="h-4 w-4 text-gray-300" />
                  </div>
                )}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                {item.streamerNickname || `스트리머 ${item.streamerId}`}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                {item.totalSent.toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
