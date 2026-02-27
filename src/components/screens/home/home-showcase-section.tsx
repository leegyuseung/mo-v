import Link from "next/link";
import { PartyPopper, ThumbsUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateArray } from "@/utils/array";
import { ShowcaseStreamerList, getDdayLabel } from "@/components/screens/home/home-section-helpers";
import type { HomeShowcaseSectionProps } from "@/types/home-screen";

export default function HomeShowcaseSection({
  showcaseData,
  isShowcaseLoading,
  isShowcaseError,
}: HomeShowcaseSectionProps) {
  const upcomingBirthdayCount = showcaseData?.upcomingBirthdays.length || 0;

  return (
    <section className="p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <PartyPopper className="h-4 w-4 text-pink-500" />
              생일
            </h3>
            <span className="text-[11px] text-gray-400">{upcomingBirthdayCount}명</span>
          </div>
          {isShowcaseLoading ? (
            <div className="space-y-2">
              {generateArray(2).map((_, index) => (
                <div key={`home-showcase-birthday-skeleton-${index}`} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              ))}
            </div>
          ) : isShowcaseError ? (
            <p className="py-6 text-center text-xs text-gray-400">데이터를 불러오지 못했습니다.</p>
          ) : (
            <ShowcaseStreamerList
              streamers={showcaseData?.upcomingBirthdays || []}
              emptyText="D-3 이내 생일 버츄얼이 없습니다."
              showBirthdayMeta
              enableScrollWhenMany
            />
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <ThumbsUp className="h-4 w-4 text-blue-500" />
              추천
            </h3>
          </div>
          {isShowcaseLoading ? (
            <div className="space-y-2">
              {generateArray(2).map((_, index) => (
                <div key={`home-showcase-recommend-skeleton-${index}`} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              ))}
            </div>
          ) : isShowcaseError ? (
            <p className="py-6 text-center text-xs text-gray-400">데이터를 불러오지 못했습니다.</p>
          ) : (
            <ShowcaseStreamerList
              streamers={showcaseData?.recommendedStreamers || []}
              emptyText="추천 버츄얼이 없습니다."
            />
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">콘텐츠</h3>
            <Link
              href="/contents"
              className="text-[11px] font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
            >
              전체
            </Link>
          </div>
          {isShowcaseLoading ? (
            <div className="flex gap-2 overflow-hidden">
              {generateArray(6).map((_, index) => (
                <Skeleton
                  key={`home-showcase-content-skeleton-${index}`}
                  className="h-8 min-w-24 rounded-full"
                />
              ))}
            </div>
          ) : isShowcaseError ? (
            <p className="py-6 text-center text-xs text-gray-400">데이터를 불러오지 못했습니다.</p>
          ) : (showcaseData?.contentTitles || []).length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-400">등록된 콘텐츠가 없습니다.</p>
          ) : (
            <div className="max-h-[136px] space-y-2 overflow-y-auto pr-1">
              {(showcaseData?.contentTitles || []).map((content) => (
                <Link
                  key={`home-showcase-content-${content.id}`}
                  href={`/contents/${content.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 shadow-sm transition-colors duration-200 hover:border-gray-300 hover:bg-gray-100"
                >
                  <span className="truncate font-medium">{content.title}</span>
                  <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                    {content.isNew ? (
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                        NEW
                      </span>
                    ) : null}
                    {content.isClosingSoon ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                        마감임박
                      </span>
                    ) : null}
                    {content.participant_composition === "버츄얼만" ? (
                      <span className="rounded-full border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                        버츄얼만
                      </span>
                    ) : null}
                    <span className="ml-1 text-[11px] font-semibold text-gray-600">
                      모집마감 {getDdayLabel(content.daysUntilRecruitmentEnd)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
