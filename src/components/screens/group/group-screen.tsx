"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Star, UsersRound, UserRound } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIdolGroupCards } from "@/hooks/queries/groups/use-idol-group-cards";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchStarredGroupIds } from "@/api/star";
import { isSupabaseStorageUrl } from "@/utils/image";
import { useBrokenImages } from "@/hooks/use-broken-images";

export default function GroupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "star">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const groupImages = useBrokenImages();
  const memberImages = useBrokenImages();
  const { data, isLoading, isFetching } = useIdolGroupCards();
  const { data: starredGroupIds = new Set<number>() } = useQuery({
    queryKey: ["starred-groups", user?.id],
    queryFn: async () => new Set(await fetchStarredGroupIds(user!.id)),
    enabled: Boolean(user?.id),
  });
  const groups = useMemo(() => {
    const source = data || [];
    const keywordLower = keyword.trim().toLowerCase();

    const filtered = source.filter((group) => {
      if (!keywordLower) return true;

      const hasGroupName = (group.name || "").toLowerCase().includes(keywordLower);
      if (hasGroupName) return true;

      return group.members.some((member) =>
        (member.nickname || "").toLowerCase().includes(keywordLower)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "star") {
        const diff = (a.star_count || 0) - (b.star_count || 0);
        if (diff !== 0) return sortOrder === "asc" ? diff : -diff;
      }

      const nameDiff = (a.name || "").localeCompare(b.name || "", "ko");
      return sortOrder === "asc" ? nameDiff : -nameDiff;
    });
  }, [data, keyword, sortBy, sortOrder]);

  const onChangeSort = (nextSortBy: "name" | "star") => {
    if (sortBy === nextSortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(nextSortBy);
    setSortOrder(nextSortBy === "star" ? "desc" : "asc");
  };


  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-5 flex flex-col gap-3">

        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">정렬</span>
            <Button
              type="button"
              size="sm"
              variant={sortBy === "name" ? "default" : "outline"}
              onClick={() => onChangeSort("name")}
              className={`cursor-pointer ${sortBy === "name" ? "bg-gray-800 hover:bg-gray-900 text-white" : ""}`}
            >
              가나다순
            </Button>
            <Button
              type="button"
              size="sm"
              variant={sortBy === "star" ? "default" : "outline"}
              onClick={() => onChangeSort("star")}
              className={`cursor-pointer ${sortBy === "star" ? "bg-gray-800 hover:bg-gray-900 text-white" : ""}`}
            >
              즐겨찾기순
            </Button>
          </div>

          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="그룹명 또는 멤버명을 입력해 주세요"
            className="h-9 border-gray-200 bg-white md:w-96"
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
        {isLoading ? <Spinner className="h-4 w-4 border-2" /> : null}
        <span>{isLoading ? "로딩중..." : `총 ${groups.length.toLocaleString()}개 그룹`}</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={`group-skeleton-${index}`}
              className="h-[164px] rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from({ length: 6 }).map((__, memberIndex) => (
                  <Skeleton key={`group-member-skeleton-${index}-${memberIndex}`} className="h-8 w-8 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400">
          그룹 정보가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {groups.map((group, index) => {
            const visibleMembers = group.members.slice(0, 13);
            const remainCount = Math.max(0, group.member_count - visibleMembers.length);

            return (
              <article
                key={group.id}
                className="cursor-pointer rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => router.push(`/group/${group.group_code}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/group/${group.group_code}`);
                  }
                }}
                tabIndex={0}
                role="button"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="relative h-14 w-14 shrink-0">
                    {starredGroupIds.has(group.id) ? (
                      <span className="absolute -right-1 -top-1 z-20 inline-flex h-5 w-5 items-center justify-center rounded-full border border-yellow-200 bg-white shadow-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      </span>
                    ) : null}
                    <div
                      className={`relative h-14 w-14 overflow-hidden rounded-full ${group.bg_color
                        ? "border-black-200 bg-black/80"
                        : "bg-white"
                        }`}
                    >
                      {group.image_url && !groupImages.isBroken(group.id) ? (
                        <Image
                          src={group.image_url}
                          alt={group.name}
                          fill
                          sizes="56px"
                          priority={index < 4}
                          unoptimized={isSupabaseStorageUrl(group.image_url)}
                          onError={() =>
                            groupImages.markBroken(group.id)
                          }
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UsersRound className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{group.name}</p>
                    <p className="text-xs text-gray-500">
                      멤버 {group.member_count.toLocaleString()}명
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {visibleMembers.map((member) => (
                    <Link
                      key={`${group.id}-${member.id}`}
                      href={`/vlist/${member.public_id || member.id}`}
                      className="group/member relative"
                      title={member.nickname || "버츄얼"}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-white transition group-hover/member:scale-[1.03]">
                        {member.image_url && !memberImages.isBroken(member.id) ? (
                          <Image
                            src={member.image_url}
                            alt={member.nickname || "streamer"}
                            fill
                            sizes="32px"
                            unoptimized={isSupabaseStorageUrl(member.image_url)}
                            onError={() =>
                              memberImages.markBroken(member.id)
                            }
                            className="object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UserRound className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover/member:opacity-100">
                        {member.nickname || "이름 미등록"}
                      </span>
                    </Link>
                  ))}
                  {remainCount > 0 ? (
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-1.5 text-[10px] font-medium text-violet-700">
                      +{remainCount}
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {isFetching && !isLoading ? (
        <div className="mt-3 flex justify-center">
          <Spinner className="h-5 w-5 border-2" />
        </div>
      ) : null}
    </div>
  );
}
